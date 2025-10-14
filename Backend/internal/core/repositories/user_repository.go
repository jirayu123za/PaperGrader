package repositories

import (
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

type UserRepository interface {
	SaveUser(user *models.User) error
	FindUserByEmail(email string) (*models.User, error)
	FindUserByGoogleID(googleID string) (*models.User, error)
	FindPersonByUserID(userID uuid.UUID) ([]map[string]interface{}, error)
}
