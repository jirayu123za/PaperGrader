package repositories

import (
	"encoding/json"
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

	AddAssignmentFile(file *models.AssignmentFile) error
	ModifyAssignmentSetting(CourseID uuid.UUID, AssignmentID uuid.UUID, assignment *models.Assignment) error
	ModifyAssignmentTimeSettings(CourseID uuid.UUID, AssignmentID uuid.UUID, sections []models.AssignmentSection) error
	ModifyAssignmentGradePublished(CourseID uuid.UUID, payload response.UpdateAssignmentPublishedGradeRequest) error
	ModifyAssignmentPublishedAssignment(CourseID uuid.UUID, payload response.UpdateAssignmentPublishedAssignmentRequest) error

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
	FindAssignmentSettingsDetail(CourseID uuid.UUID, AssignmentID uuid.UUID) (*response.AssignmentSettingsResponse, error)

	FindInstructorsNameByCourseID(courseID uuid.UUID) ([]response.InstructorListResponse, error)

	// CRUD operations for Left side bar
	FindProcessLeftSideBarData(CourseID uuid.UUID, AssignmentID uuid.UUID) (map[string]interface{}, error)

	// CRUD operations for Submissions
	AddSubmissionFiles(submission []models.Submission) error
	AddSubmissionFileByInstructor(submissionFile *models.Submission) error
	ModifySubmissionList(SubmissionID uuid.UUID, AssignmentID uuid.UUID, PersonalDataID uuid.UUID, MatchedBy string) error
	FindSubmissionFiles(AssignmentID uuid.UUID) ([]response.SubmissionFilesResponse, error)
	FindSubmissionListByCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.SubmissionResponse, error)
	FindSubmissionFileName(AssignmentID uuid.UUID, SubmissionID uuid.UUID) (fileName string, err error)
	// Part:1
	FindSubmissionsList(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.SubmissionsList, error)

	FindStudentListForSubmission(CourseID uuid.UUID, AssignmentID uuid.UUID) (response.StudentSubmissionSplitResponse, error)
	FindAssignmentTemplateName(AssignmentID uuid.UUID) (string, error)

	//! CRUD SubmissionBox
	ADDCroppedSubmissionBox(submission models.SubmissionBox) error
	FindSubmissionBoxBySubmissionID(submissionIDs []uuid.UUID) (map[uuid.UUID][]string, error)

	//! CRUD OCR
	FindStudentsListForOCR(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.StudentListForOCRResponse, error)
	FindSubmissionBoxesForOCR(AssignmentID uuid.UUID) ([]response.GroupSubmissionBoxesForOCR, error)
	FindBoundingBoxesType(AssignmentID uuid.UUID) ([]response.BoundingBoxDataResponse, error)
	FindBoundingBoxesByAssignmentTemplate(AssignmentID uuid.UUID) ([]response.BoundingBoxTemplateResponse, error)

	// CRUD BoundingBox
	AddBoundingBoxesNameAndID(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox) error
	AddBoundingBoxesQuestions(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox, rubricData []response.RubricQuestion) error
	ModifyBoundingBoxesNameAndID(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox) error
	ModifyBoundingBoxesQuestions(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox, rubricData []response.RubricQuestion) error
	RemoveBoundingBoxes(AssignmentID uuid.UUID, boundingBoxIDs []uuid.UUID) error

	// C total submission ids
	FindTotalSubmissionIDsByHasGrade(AssignmentID uuid.UUID) ([]response.TotalSubmissionIDs, error)

	// CRUD Questions
	FindQuestionsByAssignmentTemplate(AssignmentID uuid.UUID) (response.QuestionsTemplateResponse, error)
	FindQuestionsList(AssignmentID uuid.UUID) (response.QuestionsListResponse, error)
	FindNoSubmittedQuestionsList(AssignmentID uuid.UUID) (response.MixedQuestionsList, error)

	// CRUD Rubric
	// First: main Question
	FindRubricsExists(assignmentID uuid.UUID, questionID uuid.UUID, initRubricsJSON []byte) error
	AddRubricDetailsToMainQuestion(assignmentID uuid.UUID, questionID uuid.UUID, newDetails []byte) error
	AddRubricToMainQuestion(assignmentID uuid.UUID, questionID uuid.UUID, rubricData json.RawMessage) error
	// First: sub Question
	FindSubQuestionRubricExists(assignmentID uuid.UUID, questionID uuid.UUID, subQuestionID uuid.UUID, initRubricsJSON []byte) error
	AddRubricDetailsToSubQuestion(assignmentID uuid.UUID, questionID uuid.UUID, subQuestionID uuid.UUID, newDetails []byte) error
	AddRubricToSubQuestion(assignmentID uuid.UUID, questionID uuid.UUID, subQuestionID uuid.UUID, rubricData json.RawMessage) error
	// Second: rubric
	FindRubricDataByAssignmentID(assignmentID uuid.UUID) (map[string]interface{}, error)
	ModifyRubricData(assignmentID uuid.UUID, rubricData json.RawMessage) error
	// Third: rubric
	FindSubmissionIDsByAssignmentID(assignmentID uuid.UUID) ([]uuid.UUID, error)
	// Fourth: rubric
	FindRubricAfterGraded(assignmentID uuid.UUID, submissionID uuid.UUID, questionID uuid.UUID, subQuestionID *uuid.UUID) (response.RubricResponse, error)
	// etc..
	FindRubricByQuestionID(AssignmentID uuid.UUID, QuestionID uuid.UUID) (response.RubricResponse, error)
	FindRubricBySubQuestionID(AssignmentID uuid.UUID, QuestionID uuid.UUID, SubQuestionID *uuid.UUID) (response.RubricResponse, error)
	ModifyRubricDataOrHardDelete(assignmentID uuid.UUID, rubricData json.RawMessage) error
	// R submissions from question
	FindSubmissionsFromQuestion(courseID uuid.UUID, assignmentID uuid.UUID, questionID uuid.UUID, subQuestionID *uuid.UUID) ([]response.SubmissionsFromQuestionResponse, error)
	// R question title
	FindQuestionTitleAndQuestionPoint(assignmentID uuid.UUID, questionID uuid.UUID, subQuestionID *uuid.UUID) (response.QuestionTitleAndQuestionPointResponse, error)

	// R Bounding Boxes data
	FindBoundingBoxesData(AssignmentID uuid.UUID) (response.BoundingBoxesDataResponse, error)

	// CRUD Grade
	AddGradeData(assignmentID uuid.UUID, submissionID uuid.UUID, gradeData json.RawMessage) error
	FindExistingGradeData(assignmentID uuid.UUID, submissionID uuid.UUID) (bool, error)
	FindGradeData(assignmentID uuid.UUID, submissionID uuid.UUID) (map[string]interface{}, error)
	ModifyGradeData(assignmentID uuid.UUID, submissionID uuid.UUID, updateGradeData json.RawMessage) error
	// Second: Grade
	// First: main Question
	AddRubricToMainQuestionInGrade(assignmentID uuid.UUID, submissionID uuid.UUID, questionID uuid.UUID, rubricData json.RawMessage) error
	// Second: sub Question
	AddRubricToSubQuestionInGrade(assignmentID uuid.UUID, submissionID uuid.UUID, questionID uuid.UUID, subQuestionID uuid.UUID, rubricData json.RawMessage) error

	// Part:1 Export data
	FindAssignmentsListForExport(CourseID uuid.UUID) ([]response.AssignmentsListResponse, error)
	// AddGradesToExcelFile(request response.CreateGradeToExcelFileRequest, courseID uuid.UUID) error

	// Part:1 Assignment statistics
	FindGradeIDsHasGradedBySectionIDs(AssignmentID uuid.UUID, SectionIDs []uuid.UUID) ([]uuid.UUID, error)
	FindAssignmentStatsCore(req response.GetAssignmentStatisticsRequest, courseID uuid.UUID, gradeIDs []uuid.UUID) (response.StatsCore, error)
	FindQuestionsListStatisticsWithMeans(assignmentID uuid.UUID, qMean map[uuid.UUID]float64, sqMean map[uuid.UUID]float64) (response.QuestionsListStatsResponse, error)
	FindQuestionsListStatisticsWithCore(assignmentID uuid.UUID, core response.StatsCore) (response.QuestionsListStatsResponse, error)
	// Part:2 Statistics review grade
	FindSubmissionScoresForAssignment(courseID uuid.UUID, assignmentID uuid.UUID) ([]float64, float64, error)
	FindSubmissionsStatisticsTable(courseID uuid.UUID, assignmentID uuid.UUID) ([]response.SubmissionStatisticsTableResponse, error)

	// Part:3 Sections statistics
	FindSectionListForStatistics(courseID uuid.UUID, req response.SectionStatisticsRequest) ([]response.SectionListForStatisticsResponse, error)
}
