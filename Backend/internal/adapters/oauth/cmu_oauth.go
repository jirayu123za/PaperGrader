package oauth

import (
	"os"
	"paperGrader/internal/config"
)

type CMUOAuthConfig struct {
	ClientID     string
	ClientSecret string
	Scope        string
	AuthURL      string
	TokenURL     string
	UserInfoURL  string
	RedirectURL  string
	JWTSecret    string
}

func LoadCMUOAuthConfig() CMUOAuthConfig {
	config.LoadEnv()

	return CMUOAuthConfig{
		ClientID:     os.Getenv("CMU_CLIENT_ID"),
		ClientSecret: os.Getenv("CMU_CLIENT_SECRET"),
		Scope:        os.Getenv("CMU_SCOPE"),
		AuthURL:      os.Getenv("CMU_AUTH_URL"),
		TokenURL:     os.Getenv("CMU_TOKEN_URL"),
		UserInfoURL:  os.Getenv("CMU_USERINFO_URL"),
		RedirectURL:  os.Getenv("CMU_REDIRECT_URL"),
		JWTSecret:    os.Getenv("JWT_SECRET"),
	}
}
