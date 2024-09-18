package services

import (
	"paperGrader/internal/core/repositories"
	"paperGrader/internal/models"
)

// Primary port
type UserService interface {
	CreateUser(user *models.User) error
	GetUserByGoogleID(googleID string) (*models.User, error)
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
