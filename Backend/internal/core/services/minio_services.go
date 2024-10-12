package services

import (
	"mime/multipart"
	"paperGrader/internal/core/repositories"
)

// Primary port
type MinIOService interface {
	CreateFileToMinIO(file multipart.File, userGroupName, userName string, fileName string) error
}

type MinIOServiceImpl struct {
	repo repositories.MinIORepository
}

// func instance business logic call
func NewMinIOService(repo repositories.MinIORepository) MinIOService {
	return &MinIOServiceImpl{
		repo: repo,
	}
}

func (s *MinIOServiceImpl) CreateFileToMinIO(file multipart.File, userGroupName, userName, fileName string) error {
	if err := s.repo.SaveFileToMinIO(file, userGroupName, userName, fileName); err != nil {
		return err
	}
	return nil
}
