package services

import (
	"paperGrader/internal/core/repositories"
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

// Primary port
type UserService interface {
	CreateUser(user *models.User) error
	GetUserByGoogleID(googleID string) (*models.User, error)
	GetPersonByUserID(userID uuid.UUID) ([]map[string]interface{}, error)
	SignUpOrSignInUser(googleUserInfo *models.GoogleUserInfo) (*models.User, error)
	Logout(token string) error
}

type UserServiceImpl struct {
	repo repositories.UserRepository
}

// func instance business logic call
func NewUserService(repo repositories.UserRepository) UserService {
	return &UserServiceImpl{
		repo: repo,
	}
}

func (s *UserServiceImpl) CreateUser(user *models.User) error {
	return s.repo.SaveUser(user)
}

func (s *UserServiceImpl) GetUserByGoogleID(googleID string) (*models.User, error) {
	user, err := s.repo.FindUserByGoogleID(googleID)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *UserServiceImpl) GetPersonByUserID(userID uuid.UUID) ([]map[string]interface{}, error) {
	personalData, err := s.repo.FindPersonByUserID(userID)
	if err != nil {
		return nil, err
	}
	return personalData, nil
}

func (s *UserServiceImpl) SignUpOrSignInUser(googleUserInfo *models.GoogleUserInfo) (*models.User, error) {
	user, err := s.repo.FindUserByGoogleID(googleUserInfo.GoogleID)
	if err != nil || user == nil {
		return nil, nil
	}

	return user, nil
}

func (s *UserServiceImpl) Logout(token string) error {
	err := s.repo.RemoveJWT(token)
	if err != nil {
		return err
	}
	return nil
}
