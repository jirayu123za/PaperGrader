package repositories

import "paperGrader/internal/models"

type UserRepository interface {
	SaveUser(user *models.User) error
	FindUserByGoogleID(googleID string) (*models.User, error)
}
