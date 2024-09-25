package repositories

import (
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

type AssignmentRepository interface {
	// CRUD operations for Assignments
	AddAssignment(CourseID uuid.UUID, Assignment *models.Assignment) error
	FindAssignmentByAssignmentID(AssignmentID uuid.UUID) (*models.Assignment, error)
	FindAssignments() ([]*models.Assignment, error)
	FindAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error)
	ModifyAssignment(Assignment *models.Assignment) error
	RemoveAssignment(AssignmentID uuid.UUID) error
}
