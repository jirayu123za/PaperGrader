package repositories

import (
	"paperGrader/internal/models"

	"golang.org/x/oauth2"
)

type OAuthRepository interface {
	GetGoogleLoginURL(state string) string
	GetGoogleToken(code string) (*oauth2.Token, error)
	GetGoogleUserInfo(accessToken string) (*models.GoogleUserInfo, error)
}
