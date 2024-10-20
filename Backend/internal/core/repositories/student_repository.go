package repositories

import (
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

type StudentRepository interface {
	// submit assignment file to minio
	AddSubmissionFile(submission *models.Submission) error

	// find all courses and assignments for a student
	FindCoursesAndAssignments(UserID uuid.UUID) ([]map[string]interface{}, error)
	FindCoursesByUserID(UserID uuid.UUID) ([]map[string]interface{}, error)
	FindAssignmentNamesWithCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileNames []string, err error)
	FindAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error)
}
