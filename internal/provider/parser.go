package provider

import "strings"

type ParsedMetadata struct {
	Provider     string
	Model        string
	TokensInput  int
	TokensOutput int
}

type Parser interface {
	Match(targetURL string) bool
	Parse(responseBody []byte, isStreaming bool) *ParsedMetadata
}

var parsers = []Parser{
	&OpenAIParser{},
	&AnthropicParser{},
}

func Extract(targetURL string, responseBody []byte, isStreaming bool) *ParsedMetadata {
	for _, p := range parsers {
		if p.Match(targetURL) {
			return p.Parse(responseBody, isStreaming)
		}
	}
	return nil
}

func matchHost(targetURL string, hosts ...string) bool {
	lower := strings.ToLower(targetURL)
	for _, h := range hosts {
		if strings.Contains(lower, h) {
			return true
		}
	}
	return false
}
