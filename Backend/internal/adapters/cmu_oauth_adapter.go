package adapters

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"os"
	"paperGrader/internal/adapters/response"
	"paperGrader/internal/config"
	"strings"
	"time"
)

type CMUOAuthRepository struct {
	http *http.Client
}

func NewCMUOAuthRepository() *CMUOAuthRepository {
	return &CMUOAuthRepository{&http.Client{Timeout: 12 * time.Second}}
}

// Implement OAuthRepository methods here
func (r *CMUOAuthRepository) BuildAuthorizeURL(redirectURI, state string) (string, error) {
	// Implement the logic to build the CMU OAuth authorize URL
	config.LoadEnv()
	cmuRedirectURL := os.Getenv("CMU_REDIRECT_URL")
	if redirectURI == "" {
		redirectURI = cmuRedirectURL
	}
	if redirectURI == "" {
		return "", errors.New("redirect uri is required")
	}

	cmuClientID := os.Getenv("CMU_CLIENT_ID")
	cmuScope := os.Getenv("CMU_SCOPE")
	cmuAuthURL := os.Getenv("CMU_AUTH_URL")
	if cmuClientID == "" || cmuScope == "" || cmuAuthURL == "" {
		return "", errors.New("CMU OAuth configuration is not set properly")
	}

	q := url.Values{}
	q.Set("response_type", "code")
	q.Set("client_id", cmuClientID)
	q.Set("redirect_uri", redirectURI)
	q.Set("scope", cmuScope)
	if state != "" {
		q.Set("state", state)
	}
	return cmuAuthURL + "?" + q.Encode(), nil
}

func (r *CMUOAuthRepository) ExchangeCode(ctx context.Context, code, redirectURI string) (response.CMUTokenResponse, error) {
	// Implement the logic to exchange code for access token
	config.LoadEnv()
	cmuRedirectURL := os.Getenv("CMU_REDIRECT_URL")
	if redirectURI == "" {
		redirectURI = cmuRedirectURL
	}
	if redirectURI == "" {
		return response.CMUTokenResponse{}, errors.New("redirect uri is required")
	}

	cmuClientID := os.Getenv("CMU_CLIENT_ID")
	cmuClientSecret := os.Getenv("CMU_CLIENT_SECRET")
	cmuTokenURL := os.Getenv("CMU_TOKEN_URL")
	if cmuClientID == "" || cmuClientSecret == "" || cmuTokenURL == "" {
		return response.CMUTokenResponse{}, errors.New("CMU OAuth configuration is not set properly")
	}

	form := url.Values{}
	form.Set("grant_type", "authorization_code")
	form.Set("code", code)
	form.Set("redirect_uri", redirectURI)
	form.Set("client_id", cmuClientID)
	form.Set("client_secret", cmuClientSecret)

	req, _ := http.NewRequestWithContext(ctx, http.MethodPost, cmuTokenURL, strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := r.http.Do(req)
	if err != nil {
		return response.CMUTokenResponse{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return response.CMUTokenResponse{}, errors.New("token exchange failed")
	}
	var token response.CMUTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&token); err != nil {
		return response.CMUTokenResponse{}, err
	}
	return token, nil
}

func (r *CMUOAuthRepository) GetBasicInfo(ctx context.Context, accessToken string) (response.CMUBasicInfo, error) {
	// Implement the logic to get basic user info from CMU OAuth
	config.LoadEnv()
	userInfoURL := os.Getenv("CMU_USERINFO_URL")
	if userInfoURL == "" {
		return response.CMUBasicInfo{}, errors.New("CMU_USERINFO_URL not set")
	}

	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, userInfoURL, nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := r.http.Do(req)
	if err != nil {
		return response.CMUBasicInfo{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return response.CMUBasicInfo{}, errors.New("get basic info failed")
	}

	var basicInfo response.CMUBasicInfo
	if err := json.NewDecoder(resp.Body).Decode(&basicInfo); err != nil {
		return response.CMUBasicInfo{}, err
	}
	return basicInfo, nil
}
