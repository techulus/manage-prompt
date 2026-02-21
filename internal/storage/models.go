package storage

type Request struct {
	ID              string   `json:"id"`
	Timestamp       int64    `json:"timestamp"`
	TargetURL       string   `json:"target_url"`
	RequestHeaders  string   `json:"request_headers"`
	RequestBody     string   `json:"request_body"`
	ResponseHeaders string   `json:"response_headers"`
	ResponseBody    string   `json:"response_body"`
	StatusCode      int      `json:"status_code"`
	LatencyMs       int64    `json:"latency_ms"`
	IsStreaming     bool     `json:"is_streaming"`
	Error           *string  `json:"error,omitempty"`
	Provider        *string  `json:"provider,omitempty"`
	Model           *string  `json:"model,omitempty"`
	TokensInput     *int     `json:"tokens_input,omitempty"`
	TokensOutput    *int     `json:"tokens_output,omitempty"`
	CostUSD         *float64 `json:"cost_usd,omitempty"`
}

type RequestSummary struct {
	ID           string   `json:"id"`
	Timestamp    int64    `json:"timestamp"`
	TargetURL    string   `json:"target_url"`
	StatusCode   int      `json:"status_code"`
	LatencyMs    int64    `json:"latency_ms"`
	IsStreaming  bool     `json:"is_streaming"`
	Provider     *string  `json:"provider,omitempty"`
	Model        *string  `json:"model,omitempty"`
	TokensInput  *int     `json:"tokens_input,omitempty"`
	TokensOutput *int     `json:"tokens_output,omitempty"`
	CostUSD      *float64 `json:"cost_usd,omitempty"`
}

type Stats struct {
	TotalRequests int     `json:"total_requests"`
	TotalCost     float64 `json:"total_cost"`
	AvgLatencyMs  float64 `json:"avg_latency_ms"`
}
