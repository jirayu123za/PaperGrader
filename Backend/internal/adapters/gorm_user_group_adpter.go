package adapters

import (
	"paperGrader/internal/models"

	"gorm.io/gorm"
)

// Secondary adapters
type GormUserGroupRepository struct {
	db *gorm.DB
}

func NewGormUserGroupRepository(db *gorm.DB) *GormUserGroupRepository {
	return &GormUserGroupRepository{
		db: db,
	}
}

func (r *GormUserGroupRepository) AddUserGroup(UserGroup *models.UserGroup) error {
	// Implement the logic to AddUserGroup to the database using GORM.
	if userGroup := r.db.Create(UserGroup); userGroup.Error != nil {
		return userGroup.Error
	}
	return nil
}

func (r *GormUserGroupRepository) FindUserGroupByID(UserGroupID uint) (*models.UserGroup, error) {
	var userGroup *models.UserGroup
	if result := r.db.Preload("Users").First(&userGroup, UserGroupID); result.Error != nil {
		return nil, result.Error
	}
	return userGroup, nil
}

func (r *GormUserGroupRepository) FindUserGroups() ([]*models.UserGroup, error) {
	var userGroups []*models.UserGroup
	if result := r.db.Preload("Users").Find(&userGroups); result.Error != nil {
		return nil, result.Error
	}
	return userGroups, nil
}

func (r *GormUserGroupRepository) ModifyUserGroup(UserGroup *models.UserGroup) error {
	var existingUserGroup *models.UserGroup
	if result := r.db.First(&existingUserGroup, "group_id = ?", UserGroup.GroupID); result.Error != nil {
		return result.Error
	}

	existingUserGroup.GroupName = UserGroup.GroupName

	if result := r.db.Save(&existingUserGroup); result.Error != nil {
		return result.Error
	}
	return nil
}

func (r *GormUserGroupRepository) RemoveUserGroup(UserGroup *models.UserGroup) error {
	var findUserGroup *models.UserGroup
	if result := r.db.First(&findUserGroup, UserGroup.GroupID); result.Error != nil {
		return result.Error
	}

	if result := r.db.Delete(&findUserGroup); result.Error != nil {
		return result.Error
	}
	return nil
}
