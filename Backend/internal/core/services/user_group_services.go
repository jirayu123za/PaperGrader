package services

import (
	"paperGrader/internal/core/repositories"
	"paperGrader/internal/models"
)

// Primary port
type UserGroupService interface {
	CreateUserGroup(UserGroup *models.UserGroup) error
	GetUserGroupByID(UserGroupID uint) (*models.UserGroup, error)
	GetUserGroups() ([]*models.UserGroup, error)
	UpdateUserGroup(UserGroup *models.UserGroup) error
	DeleteUserGroup(UserGroup *models.UserGroup) error
}

type UserGroupServiceImpl struct {
	repo repositories.UserGroupRepository
}

// func instance business logic call
func NewUserGroupService(repo repositories.UserGroupRepository) UserGroupService {
	return &UserGroupServiceImpl{
		repo: repo,
	}
}

func (s *UserGroupServiceImpl) CreateUserGroup(UserGroup *models.UserGroup) error {
	if err := s.repo.AddUserGroup(UserGroup); err != nil {
		return err
	}
	return nil
}

func (s *UserGroupServiceImpl) GetUserGroupByID(UserGroupID uint) (*models.UserGroup, error) {
	UserGroup, err := s.repo.FindUserGroupByID(UserGroupID)
	if err != nil {
		return nil, err
	}
	return UserGroup, nil
}

func (s *UserGroupServiceImpl) GetUserGroups() ([]*models.UserGroup, error) {
	UserGroups, err := s.repo.FindUserGroups()
	if err != nil {
		return nil, err
	}
	return UserGroups, nil
}

func (s *UserGroupServiceImpl) UpdateUserGroup(UserGroup *models.UserGroup) error {
	existingUserGroups, err := s.repo.FindUserGroupByID(UserGroup.GroupID)
	if err != nil {
		return err
	}

	existingUserGroups.GroupName = UserGroup.GroupName

	if err := s.repo.ModifyUserGroup(existingUserGroups); err != nil {
		return err
	}
	return nil
}

func (s *UserGroupServiceImpl) DeleteUserGroup(UserGroup *models.UserGroup) error {
	deleteUserGroup, err := s.repo.FindUserGroupByID(UserGroup.GroupID)
	if err != nil {
		return err
	}

	if err := s.repo.RemoveUserGroup(deleteUserGroup); err != nil {
		return err
	}
	return nil
}
