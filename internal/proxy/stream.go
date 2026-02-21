package proxy

import (
	"bytes"
	"io"
	"net/http"
)

func (h *ProxyHandler) handleStreaming(w http.ResponseWriter, body io.Reader) ([]byte, error) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		data, err := io.ReadAll(body)
		if err == nil {
			w.Write(data)
		}
		return data, err
	}

	var buf bytes.Buffer
	chunk := make([]byte, 4096)

	for {
		n, err := body.Read(chunk)
		if n > 0 {
			buf.Write(chunk[:n])
			w.Write(chunk[:n])
			flusher.Flush()
		}
		if err != nil {
			if err == io.EOF {
				break
			}
			return buf.Bytes(), err
		}
	}

	return buf.Bytes(), nil
}
