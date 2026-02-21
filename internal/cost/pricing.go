package cost

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

const modelsDevURL = "https://models.dev/api.json"

type ModelPricing struct {
	InputPerMTok  float64
	OutputPerMTok float64
}

type pricingStore struct {
	mu       sync.RWMutex
	data     map[string]map[string]ModelPricing
	fetched  bool
	fetchErr error
}

var store = &pricingStore{
	data: make(map[string]map[string]ModelPricing),
}

func GetPricing(provider, model string) *ModelPricing {
	store.mu.RLock()
	if !store.fetched {
		store.mu.RUnlock()
		store.fetch()
		store.mu.RLock()
	}
	defer store.mu.RUnlock()

	models, ok := store.data[provider]
	if !ok {
		return nil
	}
	pricing, ok := models[model]
	if !ok {
		return nil
	}
	return &pricing
}

func (s *pricingStore) fetch() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.fetched {
		return
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(modelsDevURL)
	if err != nil {
		s.fetchErr = fmt.Errorf("fetch models.dev: %w", err)
		s.fetched = true
		return
	}
	defer resp.Body.Close()

	var raw map[string]json.RawMessage
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		s.fetchErr = fmt.Errorf("decode models.dev: %w", err)
		s.fetched = true
		return
	}

	for providerKey, providerJSON := range raw {
		var prov struct {
			Models map[string]struct {
				Cost *struct {
					Input  float64 `json:"input"`
					Output float64 `json:"output"`
				} `json:"cost"`
			} `json:"models"`
		}
		if err := json.Unmarshal(providerJSON, &prov); err != nil {
			continue
		}

		if len(prov.Models) == 0 {
			continue
		}

		models := make(map[string]ModelPricing)
		for modelID, m := range prov.Models {
			if m.Cost == nil {
				continue
			}
			models[modelID] = ModelPricing{
				InputPerMTok:  m.Cost.Input,
				OutputPerMTok: m.Cost.Output,
			}
		}

		if len(models) > 0 {
			s.data[providerKey] = models
		}
	}

	s.fetched = true
}

func RefreshPricing() error {
	store.mu.Lock()
	store.fetched = false
	store.fetchErr = nil
	store.mu.Unlock()

	store.fetch()

	store.mu.RLock()
	defer store.mu.RUnlock()
	return store.fetchErr
}
