package cost

func Calculate(provider, model string, tokensInput, tokensOutput int) *float64 {
	pricing := GetPricing(provider, model)
	if pricing == nil {
		return nil
	}

	c := (float64(tokensInput)/1_000_000)*pricing.InputPerMTok +
		(float64(tokensOutput)/1_000_000)*pricing.OutputPerMTok

	return &c
}
