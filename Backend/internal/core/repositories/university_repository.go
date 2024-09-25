package repositories

import (
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

type UniversityRepository interface {
	// CRUD operations
	AddUniversity(university *models.University) error
	FindUniversityByID(universityID uuid.UUID) (*models.University, error)
	FindUniversities() ([]*models.University, error)
	ModifyUniversity(university *models.University) error
	RemoveUniversity(university *models.University) error
}
