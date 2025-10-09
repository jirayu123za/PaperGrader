package services

import (
	"context"
	"errors"
	"os"
	"paperGrader/internal/adapters/response"
	"paperGrader/internal/config"
	"paperGrader/internal/core/repositories"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

// Primary port
type CMUOAuthService interface {
	// GenerateCMUOauthJWT(email string, first string, last string, studentID *string) (string, error)
	AuthorizeURL(redirectURI, state string) (string, error)
	ExchangeAndLogin(ctx context.Context, code, redirectURI string) (response.LoginResult, error)
}

type CMUOAuthServiceImpl struct {
	repo     repositories.CMUOAuthRepository
	userRepo repositories.UserRepository
}

func NewCMUOAuthService(repo repositories.CMUOAuthRepository, userRepo repositories.UserRepository) CMUOAuthService {
	return &CMUOAuthServiceImpl{
		repo:     repo,
		userRepo: userRepo,
	}
}

// Implement CMUOAuthService methods here

func (s *CMUOAuthServiceImpl) AuthorizeURL(redirectURI, state string) (string, error) {
	return s.repo.BuildAuthorizeURL(redirectURI, state)
}

func (s *CMUOAuthServiceImpl) ExchangeAndLogin(ctx context.Context, code, redirectURI string) (response.LoginResult, error) {
	if code == "" {
		return response.LoginResult{}, errors.New("code is required")
	}

	// call repository to exchange code to get access token
	token, err := s.repo.ExchangeCode(ctx, code, redirectURI)
	if err != nil {
		return response.LoginResult{}, err
	}

	// call repository to get basic info
	basicInfo, err := s.repo.GetBasicInfo(ctx, token.AccessToken)
	if err != nil {
		return response.LoginResult{}, err
	}

	// map CMU → user in our system
	// NOTE: Temporary map GoogleID = cmuitaccount(email)
	email := basicInfo.CMUITAccount
	first := basicInfo.FirstNameEN
	last := basicInfo.LastNameEN
	var studentID *string
	if basicInfo.StudentID != "" {
		studentID = &basicInfo.StudentID
	}

	// Check if the user already exists in the database
	user, err := s.userRepo.FindUserByEmail(email)
	if err != nil {
		return response.LoginResult{}, err
	}

	if user == nil {
		// User does not exist, return user info to pre-fill the sign up form
		config.LoadEnv()
		preSecret := os.Getenv("JWT_SECRET")
		if preSecret == "" {
			return response.LoginResult{}, errors.New("JWT secret is not set")
		}

		preClaims := jwt.MapClaims{
			"email":     email,
			"firstName": first,
			"lastName":  last,
			"studentID": func() string {
				if studentID == nil {
					return ""
				}
				return *studentID
			}(),
			"exp": time.Now().Add(10 * time.Minute).Unix(),
		}

		pre := jwt.NewWithClaims(jwt.SigningMethodHS256, preClaims)
		preToken, err := pre.SignedString([]byte(preSecret))
		if err != nil {
			return response.LoginResult{}, err
		}

		return response.LoginResult{
			NeedsSignUp: true,
			RedirectURL: "http://localhost:5173/?token=" + preToken,
		}, nil
	}

	// issue JWT
	claims := jwt.MapClaims{
		"user_id":  user.UserID.String(),
		"group_id": user.GroupID,
		"email":    user.Email,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	}

	config.LoadEnv()
	jwtSecret := os.Getenv("JWT_SECRET")
	j := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := j.SignedString([]byte(jwtSecret))
	if err != nil {
		return response.LoginResult{}, err
	}

	return response.LoginResult{
		JWT:          signed,
		User:         user,
		AccessToken:  token.AccessToken,
		RefreshToken: token.RefreshToken,
		ExpiresIn:    token.ExpiresIn,
	}, nil
}
