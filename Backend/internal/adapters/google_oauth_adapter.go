package adapters

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"paperGrader/internal/adapters/oauth"
	"paperGrader/internal/config"
	"paperGrader/internal/models"

	"golang.org/x/oauth2"
)

type OAuthRepository struct {
}

func NewOAuthRepository() *OAuthRepository {
	return &OAuthRepository{}
}

func (r *OAuthRepository) GetGoogleLoginURL(state string) string {
	return oauth.AppConfig.GoogleLoginConfig.AuthCodeURL(state)
}

func (r *OAuthRepository) GetGoogleToken(code string) (*oauth2.Token, error) {
	token, err := oauth.AppConfig.GoogleLoginConfig.Exchange(context.Background(), code)
	if err != nil {
		return nil, err
	}

	return token, nil
}

func (r *OAuthRepository) GetGoogleUserInfo(accessToken string) (*models.GoogleUserInfo, error) {
	config.LoadEnv()
	userInfoURL := os.Getenv("USERINFO")

	client := oauth.AppConfig.GoogleLoginConfig.Client(context.Background(), &oauth2.Token{AccessToken: accessToken})
	resp, err := client.Get(userInfoURL)

	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("failed to fetch user info: " + resp.Status)
	}

	var userInfo models.GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	return &userInfo, nil
}
