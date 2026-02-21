package provider

import (
	"encoding/json"
	"strings"
)

type AnthropicParser struct{}

func (p *AnthropicParser) Match(targetURL string) bool {
	return matchHost(targetURL, "api.anthropic.com", "anthropic")
}

func (p *AnthropicParser) Parse(responseBody []byte, isStreaming bool) *ParsedMetadata {
	if isStreaming {
		return p.parseStreaming(responseBody)
	}
	return p.parseNonStreaming(responseBody)
}

func (p *AnthropicParser) parseNonStreaming(body []byte) *ParsedMetadata {
	var resp struct {
		Model string `json:"model"`
		Usage *struct {
			InputTokens  int `json:"input_tokens"`
			OutputTokens int `json:"output_tokens"`
		} `json:"usage"`
	}

	if err := json.Unmarshal(body, &resp); err != nil {
		return nil
	}

	meta := &ParsedMetadata{
		Provider: "anthropic",
		Model:    resp.Model,
	}

	if resp.Usage != nil {
		meta.TokensInput = resp.Usage.InputTokens
		meta.TokensOutput = resp.Usage.OutputTokens
	}

	return meta
}

func (p *AnthropicParser) parseStreaming(body []byte) *ParsedMetadata {
	meta := &ParsedMetadata{Provider: "anthropic"}

	lines := strings.Split(string(body), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if !strings.HasPrefix(line, "data: ") {
			continue
		}
		data := strings.TrimPrefix(line, "data: ")

		var event struct {
			Type    string `json:"type"`
			Message *struct {
				Model string `json:"model"`
				Usage *struct {
					InputTokens  int `json:"input_tokens"`
					OutputTokens int `json:"output_tokens"`
				} `json:"usage"`
			} `json:"message"`
			Usage *struct {
				InputTokens  int `json:"input_tokens"`
				OutputTokens int `json:"output_tokens"`
			} `json:"usage"`
		}

		if err := json.Unmarshal([]byte(data), &event); err != nil {
			continue
		}

		if event.Message != nil {
			if event.Message.Model != "" {
				meta.Model = event.Message.Model
			}
			if event.Message.Usage != nil {
				meta.TokensInput = event.Message.Usage.InputTokens
				meta.TokensOutput = event.Message.Usage.OutputTokens
			}
		}

		if event.Usage != nil {
			meta.TokensOutput = event.Usage.OutputTokens
		}
	}

	if meta.Model == "" {
		return nil
	}
	return meta
}
