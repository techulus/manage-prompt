package storage

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

type DB struct {
	conn *sql.DB
}

func Open(dbPath string) (*DB, error) {
	if dbPath == "" {
		dir := ".manageprompt"
		if err := os.MkdirAll(dir, 0755); err != nil {
			return nil, fmt.Errorf("create data dir: %w", err)
		}
		dbPath = filepath.Join(dir, "requests.db")
	}

	conn, err := sql.Open("sqlite", dbPath+"?_journal_mode=WAL&_busy_timeout=5000")
	if err != nil {
		return nil, fmt.Errorf("open sqlite: %w", err)
	}

	db := &DB{conn: conn}
	if err := db.migrate(); err != nil {
		conn.Close()
		return nil, fmt.Errorf("migrate: %w", err)
	}

	return db, nil
}

func (db *DB) Close() error {
	return db.conn.Close()
}

func (db *DB) migrate() error {
	_, err := db.conn.Exec(`
		CREATE TABLE IF NOT EXISTS requests (
			id TEXT PRIMARY KEY,
			timestamp INTEGER NOT NULL,
			target_url TEXT NOT NULL,
			request_headers TEXT,
			request_body TEXT,
			response_headers TEXT,
			response_body TEXT,
			status_code INT,
			latency_ms INT,
			is_streaming BOOLEAN DEFAULT FALSE,
			error TEXT,
			provider TEXT,
			model TEXT,
			tokens_input INT,
			tokens_output INT,
			cache_read_tokens INT,
			cache_write_tokens INT,
			cost_usd REAL,
			raw_response TEXT
		);
		CREATE INDEX IF NOT EXISTS idx_timestamp ON requests(timestamp DESC);
		CREATE INDEX IF NOT EXISTS idx_provider ON requests(provider);
		CREATE INDEX IF NOT EXISTS idx_model ON requests(model);
	`)
	return err
}

func (db *DB) Insert(r *Request) error {
	_, err := db.conn.Exec(`
		INSERT INTO requests (
			id, timestamp, target_url,
			request_headers, request_body,
			response_headers, response_body,
			status_code, latency_ms, is_streaming, error,
			provider, model, tokens_input, tokens_output,
			cache_read_tokens, cache_write_tokens, cost_usd, raw_response
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		r.ID, r.Timestamp, r.TargetURL,
		r.RequestHeaders, r.RequestBody,
		r.ResponseHeaders, r.ResponseBody,
		r.StatusCode, r.LatencyMs, r.IsStreaming, r.Error,
		r.Provider, r.Model, r.TokensInput, r.TokensOutput,
		r.CacheReadTokens, r.CacheWriteTokens, r.CostUSD, r.RawResponse,
	)
	return err
}

func (db *DB) List(page, limit int) ([]RequestSummary, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 50
	}
	offset := (page - 1) * limit

	var total int
	err := db.conn.QueryRow("SELECT COUNT(*) FROM requests").Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	rows, err := db.conn.Query(`
		SELECT id, timestamp, target_url, status_code, latency_ms, is_streaming,
			   provider, model, tokens_input, tokens_output,
			   cache_read_tokens, cache_write_tokens, cost_usd
		FROM requests
		ORDER BY timestamp DESC
		LIMIT ? OFFSET ?`, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var results []RequestSummary
	for rows.Next() {
		var r RequestSummary
		err := rows.Scan(
			&r.ID, &r.Timestamp, &r.TargetURL,
			&r.StatusCode, &r.LatencyMs, &r.IsStreaming,
			&r.Provider, &r.Model, &r.TokensInput, &r.TokensOutput,
			&r.CacheReadTokens, &r.CacheWriteTokens, &r.CostUSD,
		)
		if err != nil {
			return nil, 0, err
		}
		results = append(results, r)
	}

	return results, total, nil
}

func (db *DB) Get(id string) (*Request, error) {
	var r Request
	err := db.conn.QueryRow(`
		SELECT id, timestamp, target_url,
			   request_headers, request_body,
			   response_headers, response_body,
			   status_code, latency_ms, is_streaming, error,
			   provider, model, tokens_input, tokens_output,
			   cache_read_tokens, cache_write_tokens, cost_usd, raw_response
		FROM requests WHERE id = ?`, id).Scan(
		&r.ID, &r.Timestamp, &r.TargetURL,
		&r.RequestHeaders, &r.RequestBody,
		&r.ResponseHeaders, &r.ResponseBody,
		&r.StatusCode, &r.LatencyMs, &r.IsStreaming, &r.Error,
		&r.Provider, &r.Model, &r.TokensInput, &r.TokensOutput,
		&r.CacheReadTokens, &r.CacheWriteTokens, &r.CostUSD, &r.RawResponse,
	)
	if err != nil {
		return nil, err
	}
	return &r, nil
}

func (db *DB) GetStats() (*Stats, error) {
	var s Stats
	var avgLatency sql.NullFloat64
	var totalCost sql.NullFloat64

	err := db.conn.QueryRow(`
		SELECT COUNT(*), COALESCE(SUM(cost_usd), 0), AVG(latency_ms)
		FROM requests`).Scan(&s.TotalRequests, &totalCost, &avgLatency)
	if err != nil {
		return nil, err
	}

	if totalCost.Valid {
		s.TotalCost = totalCost.Float64
	}
	if avgLatency.Valid {
		s.AvgLatencyMs = avgLatency.Float64
	}

	return &s, nil
}

func (db *DB) ClearAll() (int, error) {
	result, err := db.conn.Exec("DELETE FROM requests")
	if err != nil {
		return 0, err
	}
	count, _ := result.RowsAffected()
	return int(count), nil
}
