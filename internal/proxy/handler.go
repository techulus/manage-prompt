package proxy

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/techulus/manage-prompt/internal/cost"
	"github.com/techulus/manage-prompt/internal/provider"
	"github.com/techulus/manage-prompt/internal/storage"
	"github.com/techulus/manage-prompt/internal/ws"
)

const TargetHeader = "X-Manageprompt-Target"

type ProxyHandler struct {
	db     *storage.DB
	hub    *ws.Hub
	client *http.Client
}

func NewProxyHandler(db *storage.DB, hub *ws.Hub) *ProxyHandler {
	return &ProxyHandler{
		db:  db,
		hub: hub,
		client: &http.Client{
			Timeout: 5 * time.Minute,
		},
	}
}

func (h *ProxyHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	targetBase := r.Header.Get(TargetHeader)
	if targetBase == "" {
		http.Error(w, fmt.Sprintf(
			"Missing %s header.\n\nSet it to the target API base URL, e.g.:\n  %s: https://api.openai.com/v1",
			TargetHeader, TargetHeader,
		), http.StatusBadRequest)
		return
	}

	targetBase = strings.TrimRight(targetBase, "/")
	targetURL := targetBase + r.URL.Path
	if r.URL.RawQuery != "" {
		targetURL += "?" + r.URL.RawQuery
	}

	reqBody, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusInternalServerError)
		return
	}
	r.Body.Close()

	proxyReq, err := http.NewRequestWithContext(r.Context(), r.Method, targetURL, bytes.NewReader(reqBody))
	if err != nil {
		http.Error(w, "Failed to create proxy request", http.StatusInternalServerError)
		return
	}

	for key, values := range r.Header {
		if strings.EqualFold(key, TargetHeader) {
			continue
		}
		for _, v := range values {
			proxyReq.Header.Add(key, v)
		}
	}

	reqHeaders, _ := json.Marshal(filterHeaders(r.Header))

	start := time.Now()

	resp, err := h.client.Do(proxyReq)
	if err != nil {
		errMsg := err.Error()
		rec := &storage.Request{
			ID:             uuid.New().String(),
			Timestamp:      start.UnixMilli(),
			TargetURL:      targetURL,
			RequestHeaders: string(reqHeaders),
			RequestBody:    string(reqBody),
			StatusCode:     0,
			LatencyMs:      time.Since(start).Milliseconds(),
			Error:          &errMsg,
		}
		h.db.Insert(rec)
		h.hub.Broadcast(rec.ID)
		http.Error(w, "Failed to reach target: "+errMsg, http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	isStreaming := strings.Contains(resp.Header.Get("Content-Type"), "text/event-stream")

	for key, values := range resp.Header {
		for _, v := range values {
			w.Header().Add(key, v)
		}
	}
	w.WriteHeader(resp.StatusCode)

	var respBody []byte

	if isStreaming {
		respBody, err = h.handleStreaming(w, resp.Body)
	} else {
		respBody, err = io.ReadAll(resp.Body)
		if err == nil {
			w.Write(respBody)
		}
	}

	latency := time.Since(start).Milliseconds()
	respHeaders, _ := json.Marshal(filterHeaders(resp.Header))

	rec := &storage.Request{
		ID:              uuid.New().String(),
		Timestamp:       start.UnixMilli(),
		TargetURL:       targetURL,
		RequestHeaders:  string(reqHeaders),
		RequestBody:     string(reqBody),
		ResponseHeaders: string(respHeaders),
		ResponseBody:    string(respBody),
		StatusCode:      resp.StatusCode,
		LatencyMs:       latency,
		IsStreaming:     isStreaming,
	}

	if err != nil {
		errMsg := err.Error()
		rec.Error = &errMsg
	}

	if meta := provider.Extract(targetBase, respBody, isStreaming); meta != nil {
		rec.Provider = &meta.Provider
		rec.Model = &meta.Model
		if meta.TokensInput > 0 || meta.TokensOutput > 0 {
			rec.TokensInput = &meta.TokensInput
			rec.TokensOutput = &meta.TokensOutput
			rec.CostUSD = cost.Calculate(meta.Provider, meta.Model, meta.TokensInput, meta.TokensOutput)
		}
	}

	h.db.Insert(rec)
	h.hub.Broadcast(rec.ID)
}

func filterHeaders(h http.Header) map[string]string {
	result := make(map[string]string)
	for key, values := range h {
		lower := strings.ToLower(key)
		if lower == strings.ToLower(TargetHeader) {
			continue
		}
		if lower == "authorization" || lower == "x-api-key" {
			result[key] = "***"
			continue
		}
		result[key] = strings.Join(values, ", ")
	}
	return result
}
