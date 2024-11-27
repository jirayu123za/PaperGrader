package adapters

import (
	"paperGrader/internal/models"

	"github.com/google/uuid"
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

func (r *GormUserRepository) FindPersonByUserID(userID uuid.UUID) ([]map[string]interface{}, error) {
	var personalData []map[string]interface{}

	if err := r.db.Table("users").
		Select("users.student_id, users.first_name, users.last_name, users.email, user_groups.group_name AS user_group_name").
		Joins("LEFT JOIN user_groups ON users.group_id = user_groups.group_id").
		Where("users.user_id = ? AND users.deleted_at IS NULL", userID).
		Scan(&personalData).Error; err != nil {
		return nil, err
	}
	return personalData, nil
}

func (r *GormUserRepository) RemoveJWT(token string) error {
	return nil
}
