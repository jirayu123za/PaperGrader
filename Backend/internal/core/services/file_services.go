package services

import (
	"io"
	"paperGrader/internal/core/repositories"
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

// Primary port
type FileService interface {
	CreateFile(file *models.File, fileContent io.Reader) error
	GetFileByID(fileName string) (*models.File, error)
	UpdateFile(file *models.File) error
	Delete(file *models.File) error
}

type FileServiceImpl struct {
	repo repositories.FileRepository
}

// func instance business logic call
func NewFileService(repo repositories.FileRepository) FileService {
	return &FileServiceImpl{
		repo: repo,
	}
}

func (s *FileServiceImpl) CreateFile(file *models.File, fileContent io.Reader) error {
	file.ID = uuid.New()
	if err := s.repo.SaveFile(file, fileContent); err != nil {
		return err
	}
	return nil
}

func (s *FileServiceImpl) GetFileByID(fileName string) (*models.File, error) {
	file, err := s.repo.FindFileByID(fileName)
	if err != nil {
		return nil, err
	}
	return file, nil
}

func (s *FileServiceImpl) UpdateFile(file *models.File) error {
	file, err := s.repo.FindFileByID(file.Name)
	if err != nil {
		return err
	}

	if err := s.repo.RemoveFile(file); err != nil {
		return err
	}
	return nil
}

func (s *FileServiceImpl) Delete(file *models.File) error {
	deleteFile, err := s.repo.FindFileByID(file.Name)
	if err != nil {
		return err
	}

	if err := s.repo.RemoveFile(deleteFile); err != nil {
		return err
	}
	return nil
}
