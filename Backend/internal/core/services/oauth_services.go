package services

import (
	"os"
	"paperGrader/internal/config"
	"paperGrader/internal/core/repositories"
	"paperGrader/internal/models"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
)

// Primary port
type OAuthService interface {
	GetGoogleLoginURL(state string) string
	GetGoogleToken(code string) (*oauth2.Token, error)
	GetGoogleUserInfo(accessToken string) (*models.GoogleUserInfo, error)
	GenerateGoogleJWT(googleUser *models.GoogleUserInfo) (string, error)
	GenerateUserJWT(userID uuid.UUID, groupID uint) (string, error)
}

type OAuthServiceImpl struct {
	repo repositories.OAuthRepository
}

func NewOAuthService(repo repositories.OAuthRepository) OAuthService {
	return &OAuthServiceImpl{
		repo: repo,
	}
}

func (s *OAuthServiceImpl) GetGoogleLoginURL(state string) string {
	return s.repo.GetGoogleLoginURL(state)
}

func (s *OAuthServiceImpl) GetGoogleToken(code string) (*oauth2.Token, error) {
	return s.repo.GetGoogleToken(code)
}

func (s *OAuthServiceImpl) GetGoogleUserInfo(accessToken string) (*models.GoogleUserInfo, error) {
	googleUser, err := s.repo.GetGoogleUserInfo(accessToken)
	if err != nil {
		return nil, err
	}
	return googleUser, nil
}

func (s *OAuthServiceImpl) GenerateGoogleJWT(googleUser *models.GoogleUserInfo) (string, error) {
	config.LoadEnv()
	jwtSecret := os.Getenv("JWT_SECRET")

	claims := jwt.MapClaims{
		"googleID":  googleUser.GoogleID,
		"email":     googleUser.Email,
		"fullName":  googleUser.FullName,
		"firstName": googleUser.FirstName,
		"lastName":  googleUser.LastName,
		"exp":       time.Now().Add(time.Hour * 1).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(jwtSecret))
}

func (s *OAuthServiceImpl) GenerateUserJWT(userID uuid.UUID, groupID uint) (string, error) {
	config.LoadEnv()
	jwtSecret := os.Getenv("JWT_SECRET")

	claims := jwt.MapClaims{
		"user_id":  userID.String(),
		"group_id": groupID,
		"exp":      time.Now().Add(time.Hour * 1).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(jwtSecret))
}
