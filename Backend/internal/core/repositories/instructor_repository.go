package repositories

import (
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

// Secondary ports
type InstructorRepository interface {
	// v1 add assignment to course with out Files(Json)
	AddAssignment(CourseID uuid.UUID, assignment *models.Assignment) error
	// v2 add assignment to course with Files(FromData)
	AddAssignmentWithFiles(CourseID uuid.UUID, assignment *models.Assignment) error

	FindCoursesByUserID(UserID uuid.UUID) ([]*models.Course, error)
	FindAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error)
	FindActiveAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error)
	FindInstructorsNameByCourseID(CourseID uuid.UUID) ([]*models.User, error)
}
