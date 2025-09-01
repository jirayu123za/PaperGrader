package repositories

import (
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

type StudentRepository interface {
	// Find Personal ID by User ID
	FindPersonalDataIDByUserID(UserID uuid.UUID) (uuid.UUID, error)
	// submit assignment file to minio
	AddSubmissionFile(submission *models.Submission) error

	// find all courses and assignments for a student
	FindCoursesAndAssignments(UserID uuid.UUID) ([]map[string]interface{}, error)
	FindCoursesByUserID(UserID uuid.UUID) ([]map[string]interface{}, error)
	FindAssignmentNamesWithCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileNames []string, err error)
	FindAssignmentsByCourseID(CourseID uuid.UUID, UserID uuid.UUID) ([]map[string]interface{}, error)

	FindCourseByCourseID(CourseID uuid.UUID) (map[string]interface{}, error)

	// File
	FindSubmissionFileName(AssignmentID uuid.UUID, CourseID uuid.UUID, UserID uuid.UUID) (string, error)
}
