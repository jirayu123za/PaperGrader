package repositories

import (
	"paperGrader/internal/adapters/response"
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
	ModifyAssignmentAndAssignmentSection(CourseID uuid.UUID, AssignmentID uuid.UUID, assignment *models.Assignment, sections []models.AssignmentSection) error

	// CRUD operations for Roster of a course
	FindRosterByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)
	FindRosterSectionByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)
	FindRosterByCourseIDAndSectionID(CourseID uuid.UUID, SectionID uuid.UUID) ([]map[string]interface{}, error)
	FindPersonalDataByIDAndCourseID(PersonalDataID uuid.UUID, CourseID uuid.UUID) ([]map[string]interface{}, error)

	AddSingleUserRoster(personalData *models.PersonalData, enrollment *models.EnrollmentList) error
	AddMultipleUserRoster(personalData []models.PersonalData, enrollmentLists []models.EnrollmentList) error
	FindColumnsAndDataFromUploadedFile(fileBytes []byte) (map[string]interface{}, error)
	FindColumnsAndDataFromOptionFile(fileBytes []byte) (map[string]interface{}, error)

	FindUserByEmail(email string) (map[string]interface{}, error)

	FindCoursesByUserID(UserID uuid.UUID) ([]response.CoursesResponse, error)
	FindCourseByCourseID(CourseID uuid.UUID) (*response.CourseResponse, error)

	FindInsAssignmentByCourseID(CourseID uuid.UUID) ([]response.InsAssignmentResponse, error)
	FindAssignmentsByCourseID(CourseID uuid.UUID) ([]response.AssignmentsResponse, error)
	FindActiveAssignmentsByCourseID(CourseID uuid.UUID) ([]response.AssignmentActiveResponse, error)
	FindAssignmentByCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) (*response.AssignmentResponse, error)

	FindInstructorsNameByCourseID(courseID uuid.UUID) ([]response.InstructorListResponse, error)

	FindSubmissionListByCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.SubmissionResponse, error)

	// CRUD BoundingBox
	AddBoundingBoxesAndQuestions(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox, rubricData map[string]interface{}) error
	FindBoundingBoxesByAssignmentTemplate(AssignmentID uuid.UUID) ([]response.BoundingBoxTemplateResponse, error)
	ModifyBoundingBoxes(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox) error
	RemoveBoundingBoxes(AssignmentID uuid.UUID, boundingBoxIDs []uuid.UUID) error

	// CRUD Questions
	FindQuestionsByAssignmentTemplate(AssignmentID uuid.UUID) (*response.QuestionsTemplateResponse, error)
}
