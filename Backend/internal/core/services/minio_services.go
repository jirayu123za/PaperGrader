package services

import (
	"mime/multipart"
	"paperGrader/internal/core/repositories"
)

// Primary port
type MinIOService interface {
	GetSubmissionFile(CourseID, AssignmentID, fileName string) ([]byte, error)
	CreateFileToMinIO(file multipart.File, CourseID, AssignmentID, fileName string) error
	CreateCroppedImage(CourseID, AssignmentID, fileName string, fileData []byte) error
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

func (s *MinIOServiceImpl) GetSubmissionFile(CourseID, AssignmentID, fileName string) ([]byte, error) {
	if file, err := s.repo.FindSubmissionFile(CourseID, AssignmentID, fileName); err != nil {
		return nil, err
	} else {
		return file, nil
	}
}

func (s *MinIOServiceImpl) CreateFileToMinIO(file multipart.File, CourseID, AssignmentID, fileName string) error {
	if err := s.repo.AddFileToMinIO(file, CourseID, AssignmentID, fileName); err != nil {
		return err
	}
	return nil
}

func (s *MinIOServiceImpl) CreateCroppedImage(CourseID, AssignmentID, fileName string, fileData []byte) error {
	if err := s.repo.AddCroppedImage(CourseID, AssignmentID, fileName, fileData); err != nil {
		return err
	}
	return nil
}
