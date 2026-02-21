package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/techulus/manage-prompt/internal/cost"
	"github.com/techulus/manage-prompt/internal/storage"
	"github.com/techulus/manage-prompt/internal/ws"
)

type Handlers struct {
	db  *storage.DB
	hub *ws.Hub
}

func NewHandlers(db *storage.DB, hub *ws.Hub) *Handlers {
	return &Handlers{db: db, hub: hub}
}

func (h *Handlers) ListRequests(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 50
	}

	requests, total, err := h.db.List(page, limit)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, map[string]any{
		"requests": requests,
		"total":    total,
		"page":     page,
		"limit":    limit,
	})
}

func (h *Handlers) GetRequest(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/api/requests/")
	if id == "" {
		http.Error(w, "missing request ID", http.StatusBadRequest)
		return
	}

	req, err := h.db.Get(id)
	if err != nil {
		http.Error(w, "request not found", http.StatusNotFound)
		return
	}

	writeJSON(w, req)
}

func (h *Handlers) DeleteRequests(w http.ResponseWriter, r *http.Request) {
	count, err := h.db.ClearAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, map[string]any{"deleted": count})
}

func (h *Handlers) GetStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.db.GetStats()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	writeJSON(w, stats)
}

type ingestPayload struct {
	Model            string `json:"model"`
	Provider         string `json:"provider"`
	Prompt           any    `json:"prompt"`
	ResponseText     string `json:"response_text"`
	RawResponse      any    `json:"raw_response"`
	TokensInput      *int   `json:"tokens_input"`
	TokensOutput     *int   `json:"tokens_output"`
	CacheReadTokens  *int   `json:"cache_read_tokens"`
	CacheWriteTokens *int   `json:"cache_write_tokens"`
	LatencyMs        int64  `json:"latency_ms"`
	IsStreaming       bool   `json:"is_streaming"`
	FinishReason     string `json:"finish_reason"`
}

func (h *Handlers) Ingest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload ingestPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	promptJSON, _ := json.Marshal(payload.Prompt)

	provider := normalizeProvider(payload.Provider)
	model := payload.Model

	var rawResponse string
	if payload.RawResponse != nil {
		rawJSON, _ := json.Marshal(payload.RawResponse)
		rawResponse = string(rawJSON)
	}

	rec := &storage.Request{
		ID:           uuid.New().String(),
		Timestamp:    time.Now().UnixMilli(),
		TargetURL:    provider + "/" + model,
		RequestBody:  string(promptJSON),
		ResponseBody: payload.ResponseText,
		RawResponse:  rawResponse,
		StatusCode:   200,
		LatencyMs:    payload.LatencyMs,
		IsStreaming:   payload.IsStreaming,
		Provider:     &provider,
		Model:        &model,
		TokensInput:      payload.TokensInput,
		TokensOutput:     payload.TokensOutput,
		CacheReadTokens:  payload.CacheReadTokens,
		CacheWriteTokens: payload.CacheWriteTokens,
	}

	if payload.TokensInput != nil && payload.TokensOutput != nil {
		rec.CostUSD = cost.Calculate(provider, model, *payload.TokensInput, *payload.TokensOutput)
	}

	if err := h.db.Insert(rec); err != nil {
		http.Error(w, "failed to store", http.StatusInternalServerError)
		return
	}

	h.hub.Broadcast(rec.ID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"id": rec.ID})
}

func normalizeProvider(raw string) string {
	parts := strings.SplitN(raw, ".", 2)
	return parts[0]
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}
