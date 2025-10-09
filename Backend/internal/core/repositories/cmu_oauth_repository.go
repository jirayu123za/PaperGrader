package repositories

import (
	"context"
	"paperGrader/internal/adapters/response"
)

type CMUOAuthRepository interface {
	// Define CMU OAuth related methods here
	BuildAuthorizeURL(redirectURI, state string) (string, error)
	ExchangeCode(ctx context.Context, code, redirectURI string) (response.CMUTokenResponse, error)
	GetBasicInfo(ctx context.Context, accessToken string) (response.CMUBasicInfo, error)
}
