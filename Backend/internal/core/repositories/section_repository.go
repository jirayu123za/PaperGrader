package repositories

import (
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

type SectionRepository interface {
	// CRUD operations for Sections
	AddSection(CourseID uuid.UUID, sections interface{}) error

	FindSectionsDetailsByCourseID(CourseID uuid.UUID) ([]*models.Section, error)
	FindSectionIDsByCourseID(CourseID uuid.UUID) ([]uuid.UUID, error)
	FindSectionsNameByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)
	FindSectionsByAssignmentID(AssignmentID uuid.UUID) ([]map[string]interface{}, error)

	AddSections(section *models.Section) error
	FindSectionByCourseAndName(courseID uuid.UUID, sectionName string, section *models.Section) error
}
