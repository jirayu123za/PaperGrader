package services

import (
	"paperGrader/internal/core/repositories"
	"paperGrader/internal/models"
)

// Primary port
type UserService interface {
	CreateUser(user *models.User) error
	GetUserByGoogleID(googleID string) (*models.User, error)
	SignUpOrSignInUser(googleUserInfo *models.GoogleUserInfo) (*models.User, error)
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

func (s *UserServiceImpl) SignUpOrSignInUser(googleUserInfo *models.GoogleUserInfo) (*models.User, error) {
	user, err := s.repo.FindUserByGoogleID(googleUserInfo.GoogleID)
	if err != nil || user == nil {
		// User does not exist, return nil to indicate new user sign up
		return nil, nil
	}

	return user, nil
}
