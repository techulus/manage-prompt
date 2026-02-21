package provider

import (
	"encoding/json"
	"strings"
)

type OpenAIParser struct{}

func (p *OpenAIParser) Match(targetURL string) bool {
	return matchHost(targetURL, "api.openai.com", "openai")
}

func (p *OpenAIParser) Parse(responseBody []byte, isStreaming bool) *ParsedMetadata {
	if isStreaming {
		return p.parseStreaming(responseBody)
	}
	return p.parseNonStreaming(responseBody)
}

func (p *OpenAIParser) parseNonStreaming(body []byte) *ParsedMetadata {
	var resp struct {
		Model string `json:"model"`
		Usage *struct {
			PromptTokens     int `json:"prompt_tokens"`
			CompletionTokens int `json:"completion_tokens"`
		} `json:"usage"`
	}

	if err := json.Unmarshal(body, &resp); err != nil {
		return nil
	}

	meta := &ParsedMetadata{
		Provider: "openai",
		Model:    resp.Model,
	}

	if resp.Usage != nil {
		meta.TokensInput = resp.Usage.PromptTokens
		meta.TokensOutput = resp.Usage.CompletionTokens
	}

	return meta
}

func (p *OpenAIParser) parseStreaming(body []byte) *ParsedMetadata {
	meta := &ParsedMetadata{Provider: "openai"}

	lines := strings.Split(string(body), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if !strings.HasPrefix(line, "data: ") {
			continue
		}
		data := strings.TrimPrefix(line, "data: ")
		if data == "[DONE]" {
			continue
		}

		var chunk struct {
			Model string `json:"model"`
			Usage *struct {
				PromptTokens     int `json:"prompt_tokens"`
				CompletionTokens int `json:"completion_tokens"`
			} `json:"usage"`
		}

		if err := json.Unmarshal([]byte(data), &chunk); err != nil {
			continue
		}

		if chunk.Model != "" {
			meta.Model = chunk.Model
		}
		if chunk.Usage != nil {
			meta.TokensInput = chunk.Usage.PromptTokens
			meta.TokensOutput = chunk.Usage.CompletionTokens
		}
	}

	if meta.Model == "" {
		return nil
	}
	return meta
}
