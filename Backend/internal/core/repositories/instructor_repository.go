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
	FindAssignmentDetails(CourseID uuid.UUID, AssignmentID uuid.UUID) (map[string]interface{}, error)

	AddAssignmentFile(file *models.AssignmentFile) error
	ModifyAssignmentAndAssignmentSection(CourseID uuid.UUID, AssignmentID uuid.UUID, assignment *models.Assignment, sectionsIDs []uuid.UUID, assignmentSectionIDs []uuid.UUID) error

	// CRUD operations for Roster of a course
	FindRosterByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)
	FindRosterSectionByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)
	FindRosterByCourseIDAndSectionID(CourseID uuid.UUID, SectionID uuid.UUID) ([]map[string]interface{}, error)
	FindPersonalDataByIDAndCourseID(PersonalDataID uuid.UUID, CourseID uuid.UUID) ([]map[string]interface{}, error)

	AddSingleUserRoster(personalData *models.PersonalData, enrollment *models.EnrollmentList) error
	AddMultipleUserRoster(personalData []models.PersonalData, enrollmentLists []models.EnrollmentList) error
	FindColumnsAndDataFromUploadedFile(fileBytes []byte) (map[string]interface{}, error)

	FindUserByEmail(email string) (map[string]interface{}, error)

	FindCoursesByUserID(UserID uuid.UUID) ([]map[string]interface{}, error)
	FindCourseByCourseID(CourseID uuid.UUID) (map[string]interface{}, error)

	FindInsAssignmentByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)

	FindAssignmentsByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)
	FindActiveAssignmentsByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)
	FindAssignmentByCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]map[string]interface{}, error)

	FindInstructorsNameByCourseID(courseID uuid.UUID) ([]*models.PersonalData, error)
}
