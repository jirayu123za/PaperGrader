package services

import (
	"paperGrader/internal/core/repositories"
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

// Primary port
type UniversityService interface {
	CreateUniversity(university *models.University) error
	GetUniversityByID(universityID uuid.UUID) (*models.University, error)
	GetUniversities() ([]*models.University, error)
	UpdateUniversity(universities *models.University) error
	DeleteUniversity(university *models.University) error
}

type UniversityServiceImpl struct {
	repo repositories.UniversityRepository
}

// func instance business logic call
func NewUniversityService(repo repositories.UniversityRepository) UniversityService {
	return &UniversityServiceImpl{
		repo: repo,
	}
}

func (s *UniversityServiceImpl) CreateUniversity(university *models.University) error {
	return s.repo.AddUniversity(university)
}

func (s *UniversityServiceImpl) GetUniversityByID(universityID uuid.UUID) (*models.University, error) {
	university, err := s.repo.FindUniversityByID(universityID)
	if err != nil {
		return nil, err
	}
	return university, nil
}

func (s *UniversityServiceImpl) GetUniversities() ([]*models.University, error) {
	universities, err := s.repo.FindUniversities()
	if err != nil {
		return nil, err
	}
	return universities, nil
}

func (s *UniversityServiceImpl) UpdateUniversity(university *models.University) error {
	existingUniversity, err := s.repo.FindUniversityByID(university.UniversityID)
	if err != nil {
		return err
	}
	existingUniversity.UniversityName = university.UniversityName

	if err := s.repo.ModifyUniversity(existingUniversity); err != nil {
		return err
	}
	return nil
}

func (s *UniversityServiceImpl) DeleteUniversity(university *models.University) error {
	existingUniversity, err := s.repo.FindUniversityByID(university.UniversityID)
	if err != nil {
		return err
	}

	if err := s.repo.RemoveUniversity(existingUniversity); err != nil {
		return err
	}
	return nil
}
