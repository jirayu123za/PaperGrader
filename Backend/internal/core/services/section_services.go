package services

import (
	"paperGrader/internal/core/repositories"
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

// Primary port
type SectionService interface {
	// CRUD operations for Sections
	CreateSection(CourseID uuid.UUID, sections interface{}) error
	GetSectionsDetailsByCourseID(CourseID uuid.UUID) ([]*models.Section, error)
	GetSectionIDsByCourseID(CourseID uuid.UUID) ([]uuid.UUID, error)
	GetSectionsNameByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)

	CreateSections(section *models.Section) error
	GetSectionByCourseAndName(courseID uuid.UUID, sectionName string, section *models.Section) error
}

type SectionServiceImpl struct {
	repo repositories.SectionRepository
}

// func instance business logic call
func NewSectionService(repo repositories.SectionRepository) SectionService {
	return &SectionServiceImpl{
		repo: repo,
	}
}

// Create a new sections for a course
func (s *SectionServiceImpl) CreateSection(CourseID uuid.UUID, sections interface{}) error {
	if err := s.repo.AddSection(CourseID, sections); err != nil {
		return err
	}
	return nil
}

// Find all sections details for a course
func (s *SectionServiceImpl) GetSectionsDetailsByCourseID(CourseID uuid.UUID) ([]*models.Section, error) {
	sections, err := s.repo.FindSectionsDetailsByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return sections, nil
}

func (s *SectionServiceImpl) GetSectionIDsByCourseID(CourseID uuid.UUID) ([]uuid.UUID, error) {
	sectionIDs, err := s.repo.FindSectionIDsByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return sectionIDs, nil
}

func (s *SectionServiceImpl) GetSectionsNameByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error) {
	sections, err := s.repo.FindSectionsNameByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return sections, nil
}

func (s *SectionServiceImpl) GetSectionByCourseAndName(courseID uuid.UUID, sectionName string, section *models.Section) error {
	if err := s.repo.FindSectionByCourseAndName(courseID, sectionName, section); err != nil {
		return err
	}
	return nil
}

func (s *SectionServiceImpl) CreateSections(section *models.Section) error {
	if err := s.repo.AddSections(section); err != nil {
		return err
	}
	return nil
}
