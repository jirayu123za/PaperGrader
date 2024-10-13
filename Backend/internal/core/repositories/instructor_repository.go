package repositories

import (
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

// Secondary ports
type InstructorRepository interface {
	// Add assignment to course with out Files(Json)
	AddAssignment(CourseID uuid.UUID, assignment *models.Assignment) error
	// News add assignment to course with Files(FromData)
	AddAssignmentWithFiles(CourseID uuid.UUID, assignment *models.Assignment, files []models.AssignmentFile, uploads []models.Upload) error

	AddAssignmentFile(file *models.AssignmentFile) error

	// Find instructors and students by course id
	FindRosterByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)

	FindCoursesByUserID(UserID uuid.UUID) ([]*models.Course, error)
	FindAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error)
	FindActiveAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error)
	FindInstructorsNameByCourseID(CourseID uuid.UUID) ([]*models.User, error)
}
