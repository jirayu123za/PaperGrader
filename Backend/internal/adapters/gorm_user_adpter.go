package adapters

import (
	"paperGrader/internal/models"

	"gorm.io/gorm"
)

// Secondary adapters
type GormUserRepository struct {
	db *gorm.DB
}

func NewGormUserRepository(db *gorm.DB) *GormUserRepository {
	return &GormUserRepository{
		db: db,
	}
}

func (r *GormUserRepository) SaveUser(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *GormUserRepository) FindUserByGoogleID(googleID string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("google_id = ?", googleID).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *GormUserRepository) RemoveJWT(token string) error {
	return nil
}
