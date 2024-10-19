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
	FindAssignmentNameTemplate(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileName string, err error)
	//! Find assignment file form student submission
	FindFileFormSubmission(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileNames []string, err error)

	AddAssignmentFile(file *models.AssignmentFile) error

	// Find instructors and students by course id
	FindRosterByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)
	// Add student or instructor to course
	FindUserByEmail(email string) (map[string]interface{}, error)
	FindInstructorExists(userID uuid.UUID, CourseID uuid.UUID) (bool, error)
	FindStudentExists(userID, courseID uuid.UUID) (bool, error)
	AddInstructorToCourse(userID uuid.UUID, courseID uuid.UUID) error
	AddStudentToCourse(userID uuid.UUID, courseID uuid.UUID) error

	FindCoursesByUserID(UserID uuid.UUID) ([]map[string]interface{}, error)
	FindAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error)
	FindActiveAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error)
	FindInstructorsNameByCourseID(CourseID uuid.UUID) ([]*models.User, error)
}
