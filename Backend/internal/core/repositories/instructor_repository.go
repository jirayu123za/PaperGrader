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

	// CRUD operations for Submissions
	AddSubmissionFiles(submission []models.Submission) error
	AddSubmissionAFile(submissionFile *models.Submission) error
	ModifySubmissionList(SubmissionID uuid.UUID, AssignmentID uuid.UUID, PersonalDataID uuid.UUID, MatchedBy string) error
	FindSubmissionFiles(AssignmentID uuid.UUID) ([]response.SubmissionFilesResponse, error)
	FindSubmissionListByCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.SubmissionResponse, error)
	FindSubmissionFileName(AssignmentID uuid.UUID, SubmissionID uuid.UUID) (fileName string, err error)
	// Part:1
	FindSubmissionsList(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.SubmissionsList, error)

	FindStudentListForSubmission(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.StudentListForSubmissionResponse, error)
	FindAssignmentTemplateName(AssignmentID uuid.UUID) (string, error)

	//! CRUD SubmissionBox
	ADDCroppedSubmissionBox(submission models.SubmissionBox) error
	FindSubmissionBoxBySubmissionID(submissionIDs []uuid.UUID) (map[uuid.UUID][]string, error)

	//! CRUD OCR
	FindStudentsListForOCR(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.StudentListForOCRResponse, error)
	FindSubmissionBoxesForOCR(AssignmentID uuid.UUID) ([]response.GroupSubmissionBoxesForOCR, error)

	// CRUD BoundingBox
	AddBoundingBoxesAndQuestions(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox, rubricData map[string]interface{}) error
	FindBoundingBoxesByAssignmentTemplate(AssignmentID uuid.UUID) ([]response.BoundingBoxTemplateResponse, error)
	//! For submission
	FindBoundingBoxesType(AssignmentID uuid.UUID) ([]response.SubmissionBoxPositionResponse, error)
	ModifyBoundingBoxes(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox) error
	RemoveBoundingBoxes(AssignmentID uuid.UUID, boundingBoxIDs []uuid.UUID) error

	// CRUD Questions
	FindQuestionsByAssignmentTemplate(AssignmentID uuid.UUID) (*response.QuestionsTemplateResponse, error)

	// CRUD Rubric
	// AddRubric(AssignmentID uuid.UUID, rubric *models.Rubric) error
}
