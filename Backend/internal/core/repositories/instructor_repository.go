package repositories

import (
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

// Secondary ports
type InstructorRepository interface {
	AddAssignment(CourseID uuid.UUID, assignment *models.Assignment) error
	AddAssignmentWithFiles(CourseID uuid.UUID, assignment *models.Assignment, files []models.AssignmentFile, uploads []models.Upload, assignmentSections []models.AssignmentSection) error
	FindAssignmentNameTemplate(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileName string, err error)
	FindFileFormSubmission(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileNames []string, err error)

	AddAssignmentFile(file *models.AssignmentFile) error

	FindRosterByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)
	FindRosterSectionByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)

	FindUserByEmail(email string) (map[string]interface{}, error)
	FindInstructorExists(userID uuid.UUID, CourseID uuid.UUID) (bool, error)
	FindStudentExists(userID, courseID uuid.UUID) (bool, error)
	AddInstructorToCourse(userID uuid.UUID, courseID uuid.UUID) error
	AddStudentToCourse(userID uuid.UUID, courseID uuid.UUID) error

	FindCoursesByUserID(UserID uuid.UUID) ([]map[string]interface{}, error)
	FindAssignmentsByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)
	FindActiveAssignmentsByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)
	FindInstructorsNameByCourseID(CourseID uuid.UUID) ([]*models.User, error)
}
