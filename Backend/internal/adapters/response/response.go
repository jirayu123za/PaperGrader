package response

import (
	"mime/multipart"
	"paperGrader/internal/models"
	"time"

	"github.com/google/uuid"
)

type SubmissionResponse struct {
	SubmissionID   uuid.UUID `json:"submission_id"`
	SubmittedAt    time.Time `json:"submitted_at"`
	PersonalDataID uuid.UUID `json:"personal_data_id"`
	StudentCode    string    `json:"student_code"`
	FullName       string    `json:"full_name"`
	Email          string    `json:"email"`
	SectionName    string    `json:"section_name"`
}

// Struct for Assignment settings(three structs)
type Assignment struct {
	AssignmentID          uuid.UUID `json:"assignment_id"`
	AssignmentName        string    `json:"assignment_name"`
	AssignmentDescription string    `json:"assignment_description"`
	SubmittedBy           string    `json:"submitted_by"`
	LateSubmitted         bool      `json:"late_submitted"`
	Regrades              bool      `json:"regrades"`
	GroupSubmitted        bool      `json:"group_submitted"`
}

type AssignmentSection struct {
	AssignmentSectionID uuid.UUID  `json:"assignment_section_id"`
	SectionID           uuid.UUID  `json:"section_id"`
	SectionName         string     `json:"section_name"`
	PublishedGrade      bool       `json:"published_grade"`
	ReleaseDate         *time.Time `json:"release_date"`
	DueDate             *time.Time `json:"due_date"`
	CutOffDate          *time.Time `json:"cut_off_date"`
}

type AssignmentSettingsResponse struct {
	Assignment         Assignment          `json:"assignment"`
	AssignmentSections []AssignmentSection `json:"assignment_sections"`
}

// Struct for Active Assignment(one structs)
type AssignmentActiveResponse struct {
	AssignmentID          uuid.UUID  `json:"assignment_id"`
	AssignmentName        string     `json:"assignment_name"`
	AssignmentDescription string     `json:"assignment_description"`
	SubmittedBy           string     `json:"submitted_by"`
	Regrades              bool       `json:"regrades"`
	SectionName           string     `json:"section_name"`
	CreatedAt             time.Time  `json:"created_at"`
	AssignmentReleaseDate *time.Time `json:"assignment_release_date"`
	AssignmentDueDate     *time.Time `json:"assignment_due_date"`
	AssignmentCutOffDate  *time.Time `json:"assignment_cut_off_date"`
}

// Struct for GetAssignmentsByCourseID(one structs)
type AssignmentsResponse struct {
	AssignmentID          uuid.UUID  `json:"assignment_id"`
	AssignmentName        string     `json:"assignment_name"`
	SubmittedBy           string     `json:"submitted_by"`
	PublishedGrade        bool       `json:"published_grade"`
	Regrades              bool       `json:"regrades"`
	AssignmentReleaseDate *time.Time `json:"assignment_release_date"`
	AssignmentDueDate     *time.Time `json:"assignment_due_date"`
}

// Struct for GetInsAssignmentByCourseID(two structs)
type AssignmentSectionResponse struct {
	AssignmentID        uuid.UUID  `json:"assignment_id"`
	AssignmentSectionID uuid.UUID  `json:"assignment_section_id"`
	SectionID           uuid.UUID  `json:"section_id"`
	SectionName         string     `json:"section_name"`
	PublishedGrade      bool       `json:"published_grade"`
	PublishedAssignment bool       `json:"published_assignment"`
	ReleaseDate         *time.Time `json:"release_date"`
	DueDate             *time.Time `json:"due_date"`
	CutOffDate          *time.Time `json:"cut_off_date"`
}

type InsAssignmentResponse struct {
	AssignmentID          uuid.UUID                   `json:"assignment_id"`
	AssignmentName        string                      `json:"assignment_name"`
	SubmittedBy           string                      `json:"submitted_by"`
	Regrades              bool                        `json:"regrades"`
	AssignmentReleaseDate *time.Time                  `json:"assignment_release_date"`
	AssignmentDueDate     *time.Time                  `json:"assignment_due_date"`
	AssignmentSections    []AssignmentSectionResponse `json:"assignment_sections" gorm:"-"`
}

// Struct for create assignment request
type CreateAssignmentRequest struct {
	CourseID              uuid.UUID
	AssignmentName        string
	AssignmentDescription string
	SubmittedBy           string
	SectionNames          []string
	Files                 []*multipart.FileHeader
	IsTemplateFlags       []bool
	UserID                uuid.UUID
}

// Struct for create assignment response
type CreateAssignmentResponse struct {
	Assignment         models.Assignment
	AssignmentFiles    []models.AssignmentFile
	Uploads            []models.Upload
	AssignmentSections []models.AssignmentSection
}

// Struct for GetCourseByCourseID(one structs)
type CourseResponse struct {
	CourseID          uuid.UUID `json:"course_id"`
	CourseName        string    `json:"course_name"`
	CourseCode        string    `json:"course_code"`
	CourseDescription *string   `json:"course_description"`
	Semester          string    `json:"semester"`
	AcademicYear      string    `json:"academic_year"`
	EntryCode         bool      `json:"entry_code"`
}

// Struct for GetCoursesByUserID(one structs)
type CoursesResponse struct {
	CourseID          uuid.UUID  `json:"course_id"`
	CourseName        string     `json:"course_name"`
	CourseCode        string     `json:"course_code"`
	CourseDescription *string    `json:"course_description"`
	Semester          string     `json:"semester"`
	AcademicYear      string     `json:"academic_year"`
	EntryCode         bool       `json:"entry_code"`
	TotalAssignments  int        `json:"total_assignments"`
	Assignments       *string    `json:"assignments"`
	EnrollmentList    *string    `json:"enrollment_list"`
	Sections          *string    `json:"sections"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
	DeletedAt         *time.Time `json:"deleted_at"`
}

// Struct for Get InstructorsNameByCourseID(one structs)
type InstructorListResponse struct {
	PersonalDataID uuid.UUID `json:"personalData_id"`
	InstructorName string    `json:"instructor_name"`
}

// Struct for manage roster
// Part:1 Single user roster
type CreateSingleRosterRequest struct {
	RoleType    string  `form:"role_type"`
	Sections    string  `form:"sections"`
	StudentCode *string `form:"student_code"`
	FirstName   string  `form:"first_name"`
	LastName    string  `form:"last_name"`
	Email       string  `form:"email"`
}

// Part:2 Multiple user roster
type CreateMultipleRosterRequest struct {
	FirstName   []string `json:"first_name"`
	LastName    []string `json:"last_name"`
	Email       []string `json:"email"`
	StudentCode []string `json:"student_code"`
	Section     []string `json:"section"`
	RoleType    string   `json:"role_type"`
}

// Struct for Get BoundingBox By Assignment Template
type BoundingBoxTemplateResponse struct {
	BoundingBoxID   uuid.UUID `json:"bounding_box_id"`
	BoundingBoxType string    `json:"bounding_box_type"`
	BoundingBoxPage uint      `json:"bounding_box_page"`
	PointX          float64   `json:"bounding_box_point_x"`
	PointY          float64   `json:"bounding_box_point_y"`
	Width           float64   `json:"bounding_box_width"`
	Height          float64   `json:"bounding_box_height"`
}

type RubricData struct {
	RubricID   uuid.UUID
	RubricData []byte
}

// Struct for Get Questions By Assignment Template
type QuestionsTemplateResponse struct {
	RubricID      *uuid.UUID    `json:"rubric_id"`
	QuestionsData []interface{} `json:"questions_data"`
}

// Part 1: Get Questions List By Assignment Template
type RawRubricData struct {
	QuestionsData []Questions `json:"questions_data"`
}

type Questions struct {
	QuestionID    uuid.UUID      `json:"question_id"`
	QuestionTitle string         `json:"question_title"`
	QuestionPoint float64        `json:"question_point"`
	SubQuestions  []SubQuestions `json:"sub_questions,omitempty"`
}

type SubQuestions struct {
	SubQuestionID    uuid.UUID `json:"sub_question_id"`
	SubQuestionTitle string    `json:"sub_question_title"`
	SubQuestionPoint float64   `json:"sub_question_point"`
}

// Part 2: Get Questions List By Assignment Template
type UngradedSubmissions []struct {
	SubmissionID uuid.UUID
}

// Part 3: Get Questions List By Assignment Template
type SubQuestion struct {
	SubQuestionID    uuid.UUID  `json:"sub_question_id"`
	SubQuestionTitle string     `json:"sub_question_title"`
	SubQuestionPoint float64    `json:"sub_question_point"`
	SubmissionID     *uuid.UUID `json:"submission_id"`
	Progress         int        `json:"progress"`
	GradedBy         *string    `json:"graded_by"`
}

type Question struct {
	QuestionID    uuid.UUID     `json:"question_id"`
	QuestionTitle string        `json:"question_title"`
	QuestionPoint float64       `json:"question_point"`
	SubmissionID  *uuid.UUID    `json:"submission_id"`
	SubQuestions  []SubQuestion `json:"sub_questions,omitempty"`
	Progress      int           `json:"progress"`
	GradedBy      *string       `json:"graded_by"`
}

type QuestionNoSubmission struct {
	QuestionID    uuid.UUID     `json:"question_id"`
	QuestionTitle string        `json:"question_title"`
	QuestionPoint float64       `json:"question_point"`
	SubQuestions  []SubQuestion `json:"sub_questions,omitempty"`
}

type MixedQuestionsList []interface{}

type QuestionsListResponse []Questions

// type NoSubmittedQuestionsList []Question

type PersonalDataIDResponse struct {
	PersonalDataID uuid.UUID `json:"personal_data_id"`
}

type StudentListForSubmissionResponse struct {
	PersonalDataID uuid.UUID `json:"personal_data_id"`
	FullName       string    `json:"full_name"`
	Email          string    `json:"email"`
	StudentCode    string    `json:"student_code"`
	HasSubmission  bool      `json:"-"`
}

type StudentSubmissionSplitResponse struct {
	WithSubmission    []StudentListForSubmissionResponse `json:"with_submission"`
	WithoutSubmission []StudentListForSubmissionResponse `json:"without_submission"`
}

type SubmissionFilesResponse struct {
	SubmissionID       uuid.UUID `json:"submission_id"`
	SubmissionFileName string    `json:"file_name"`
	SubmittedAt        time.Time `json:"submitted_at"`
	TotalSubmissions   int       `json:"total_submissions"`
	SubmittedBy        string    `json:"submitted_by"`
	FilePrefix         string    `json:"-"`
}

type BoundingBoxDataResponse struct {
	BoundingBoxType string  `json:"bounding_box_type"`
	BoundingBoxPage uint    `json:"bounding_box_page"`
	PointX          float64 `json:"point_x"`
	PointY          float64 `json:"point_y"`
	Width           float64 `json:"width"`
	Height          float64 `json:"height"`
}

type StudentListForOCRResponse struct {
	PersonalDataID uuid.UUID `json:"personal_data_id"`
	FullName       string    `json:"full_name"`
	StudentCode    string    `json:"student_code"`
}

type SubmissionBoxesForOCR struct {
	SubmissionID          uuid.UUID `json:"submission_id"`
	SubmissionBoxFileName string    `json:"submission_box_file_name"`
}

type GroupSubmissionBoxesForOCR struct {
	SubmissionID          uuid.UUID `json:"submission_id"`
	SubmissionBoxFileName []string  `json:"submission_box_file_name"`
}

type SubmissionBoxesURLFromMinIO struct {
	SubmissionID          uuid.UUID `json:"submission_id"`
	SubmissionBoxFilesURL []string  `json:"submission_box_file_name"`
}

type MatchLog struct {
	SubmissionID          uuid.UUID
	OCRFullName           string     `json:"ocr_full_name"`
	OCRStudentCode        string     `json:"ocr_student_code"`
	BestMatchName         string     `json:"best_match_name"`
	BestMatchStudentCode  string     `json:"best_match_id"`
	MatchedPersonalDataID *uuid.UUID `json:"matched_personal_data_id"`
	Similarity            float64    `json:"similarity"`
}

// Part:1
type SubmissionsList struct {
	SubmissionID   uuid.UUID  `json:"submission_id"`
	PersonalDataID *uuid.UUID `json:"personal_data_id"`
	SectionName    string     `json:"section_name"`
	FullName       string     `json:"full_name"`
	StudentCode    string     `json:"student_code"`
	HasAssigned    bool       `json:"has_assigned"`
	MatchedBy      *string    `json:"matched_by,omitempty"`
	SubmittedAt    time.Time  `json:"submitted_at"`
}

// Part:2
type SubmissionsOCRData struct {
	SubmissionID   uuid.UUID  `json:"submission_id"`
	IsMatch        bool       `json:"is_match"`
	PersonalDataID *uuid.UUID `json:"personal_data_id"`
	BestMatchName  string     `json:"best_match_name"`
	BestMatchID    string     `json:"best_match_id"`
	Similarity     float64    `json:"similarity"`
}

// Part:3
type SubmissionsListResponse struct {
	SubmissionID   uuid.UUID  `json:"submission_id"`
	SectionName    string     `json:"section_name"`
	FullName       string     `json:"full_name"`
	StudentCode    string     `json:"student_code"`
	HasAssigned    bool       `json:"has_assigned"`
	MatchedBy      *string    `json:"matched_by,omitempty"`
	SubmittedAt    time.Time  `json:"submitted_at"`
	PersonalDataID *uuid.UUID `json:"personal_data_id"`
	URLFileName    string     `json:"url_file_name,omitempty"`
	URLFileID      string     `json:"url_file_id,omitempty"`
}

// bounding boxes
// Part:1
type BoundingBoxesRequest struct {
	BoundingBoxID *uuid.UUID `json:"bounding_box_id,omitempty"`
	PointX        float64    `json:"bounding_box_point_x"`
	PointY        float64    `json:"bounding_box_point_y"`
	Width         float64    `json:"bounding_box_width"`
	Height        float64    `json:"bounding_box_height"`
	Type          string     `json:"bounding_box_type"`
	Page          uint       `json:"bounding_box_page"`
}

// Case 1: Only name and id
type BoundingBoxesNameAndIDRequest struct {
	BoundingBoxes []BoundingBoxesRequest `json:"bounding_boxes"`
}

// Case 2: Includes questions (question, or name/id + question)
type BoundingBoxesAndQuestionsRequest struct {
	BoundingBoxes []BoundingBoxesRequest `json:"bounding_boxes"`
	QuestionsData []RubricQuestion       `json:"questions_data"`
}

type RubricQuestion struct {
	QuestionID    *uuid.UUID          `json:"question_id,omitempty"`
	BoundingBoxID *uuid.UUID          `json:"bounding_box_id,omitempty"`
	QuestionTitle string              `json:"question_title"`
	QuestionPoint float64             `json:"question_point"`
	SubQuestions  []RubricSubQuestion `json:"sub_questions,omitempty"`
	Rubrics       *RubricResponse     `json:"rubrics,omitempty"`
}

type RubricSubQuestion struct {
	SubQuestionID    *uuid.UUID      `json:"sub_question_id,omitempty"`
	BoundingBoxID    *uuid.UUID      `json:"bounding_box_id,omitempty"`
	SubQuestionTitle string          `json:"sub_question_title"`
	SubQuestionPoint float64         `json:"sub_question_point"`
	Rubrics          *RubricResponse `json:"rubrics,omitempty"`
}

// Part: 1 Rubric
// Create rubrics
type CreateRubricRequest struct {
	QuestionID    uuid.UUID   `json:"question_id"`
	SubQuestionID *uuid.UUID  `json:"sub_question_id,omitempty"`
	Rubric        RubricInput `json:"rubric"`
}

type RubricDetailInput struct {
	RubricPoint       *int    `json:"rubric_point,omitempty"`
	RubricDescription *string `json:"rubric_description,omitempty"`
}

type RubricInput struct {
	RubricSetting string              `json:"rubric_setting"`
	RubricDetails []RubricDetailInput `json:"rubric_details"`
}

// Update rubric
type UpdateRubricRequest struct {
	QuestionID    uuid.UUID    `json:"question_id"`
	SubQuestionID *uuid.UUID   `json:"sub_question_id,omitempty"`
	Rubric        RubricDetail `json:"rubric"`
}

type RubricDetail struct {
	RubricID   string          `json:"rubric_id"`
	RubricData []RubricDetails `json:"rubric_details"`
}

type RubricDetails struct {
	RubricDetailID    string  `json:"rubric_detail_id"`
	RubricPoint       float64 `json:"rubric_point"`
	RubricDescription string  `json:"rubric_description"`
}

// Update rubric indexes
type UpdateRubricIndexesRequest struct {
	QuestionID    uuid.UUID               `json:"question_id"`
	SubQuestionID *uuid.UUID              `json:"sub_question_id,omitempty"`
	Rubric        RubricDetailWithIndexes `json:"rubric"`
}

type RubricDetailWithIndexes struct {
	RubricID   string                      `json:"rubric_id"`
	RubricData []RubricDetailWithHasSelect `json:"rubric_details"`
}

// Delete rubric
type DeleteRubricRequest struct {
	QuestionID     uuid.UUID  `json:"question_id"`
	SubQuestionID  *uuid.UUID `json:"sub_question_id,omitempty"`
	RubricID       string     `json:"rubric_id"`
	RubricDetailID string     `json:"rubric_detail_id"`
}

// Query rubrics
type RubricResponse struct {
	RubricID      *uuid.UUID                  `json:"rubric_id"`
	RubricSetting string                      `json:"rubric_setting"`
	HasCeiling    bool                        `json:"has_ceiling"`
	HasFloor      bool                        `json:"has_floor"`
	RubricData    []RubricDetailWithHasSelect `json:"rubric_details"`
}

type RubricDetailWithHasSelect struct {
	RubricDetailID    string  `json:"rubric_detail_id"`
	RubricPoint       float64 `json:"rubric_point"`
	RubricDescription string  `json:"rubric_description"`
	HasSelected       bool    `json:"has_selected"`
}

// Part: 2 Rubric
// Update rubric setting
type UpdateRubricSettingRequest struct {
	QuestionID    uuid.UUID               `json:"question_id"`
	SubQuestionID *uuid.UUID              `json:"sub_question_id,omitempty"`
	Rubric        RubricDetailWithSetting `json:"rubric"`
}

type RubricDetailWithSetting struct {
	RubricID      string `json:"rubric_id"`
	RubricSetting string `json:"rubric_setting"`
	// RubricData    []RubricDetails `json:"rubric_details"`
}

type UpdateRubricScoreBoundsRequest struct {
	QuestionID    uuid.UUID                   `json:"question_id"`
	SubQuestionID *uuid.UUID                  `json:"sub_question_id,omitempty"`
	Rubric        RubricDetailWithScoreBounds `json:"rubric"`
}

type RubricDetailWithScoreBounds struct {
	RubricID   string `json:"rubric_id"`
	HasCeiling bool   `json:"has_ceiling"`
	HasFloor   bool   `json:"has_floor"`
}

// Part 1: Query submissions from question
type SubmissionsFromQuestionResponse struct {
	SubmissionID uuid.UUID        `json:"submission_id"`
	UserName     FullNameAndEmail `json:"user_name"`
	SectionName  *string          `json:"section_name"`
	GradedBy     *string          `json:"graded_by"`
	Score        *float64         `json:"score"`
	GradeStatus  bool             `json:"grade_status"`
}

type FullNameAndEmail struct {
	FirstName *string `json:"first_name"`
	LastName  *string `json:"last_name"`
	Email     *string `json:"email"`
}

type GradeDataJSON struct {
	QuestionsData []questionJSON `json:"questions_data"`
}

type questionJSON struct {
	QuestionID   string            `json:"question_id"`
	Grades       *gradesJSON       `json:"grades,omitempty"`
	Rubrics      *rubricsJSON      `json:"rubrics,omitempty"`
	SubQuestions []subQuestionJSON `json:"sub_questions,omitempty"`
}

type subQuestionJSON struct {
	SubQuestionID string       `json:"sub_question_id"`
	Grades        *gradesJSON  `json:"grades,omitempty"`
	Rubrics       *rubricsJSON `json:"rubrics,omitempty"`
}

type gradesJSON struct {
	GradedAt  *string `json:"graded_at,omitempty"`
	GradedBy  *string `json:"graded_by,omitempty"`
	HasGraded bool    `json:"has_graded"`
}

type rubricsJSON struct {
	RubricDetails []rubricDetailJSON `json:"rubric_details"`
}

type rubricDetailJSON struct {
	HasSelected bool    `json:"has_selected"`
	RubricPoint float64 `json:"rubric_point"`
}

// Part 2: Query submissions from question
type QuestionTitleAndQuestionPointResponse struct {
	QuestionTitle string  `json:"question_title"`
	QuestionPoint float64 `json:"question_point"`
}

// Query bounding boxes data
type BoundingBoxesDataResponse struct {
	BoundingBoxesData []BoundingBoxesDataRaw `json:"bounding_boxes_data"`
}

// Raw data for bounding boxes
type BoundingBoxesDataRaw struct {
	BoundingBoxID   uuid.UUID  `json:"bounding_box_id"`
	BoundingBoxPage uint       `json:"bounding_box_page"`
	PointX          float64    `json:"point_x"`
	PointY          float64    `json:"point_y"`
	Width           float64    `json:"width"`
	Height          float64    `json:"height"`
	QuestionID      *uuid.UUID `json:"question_id,omitempty"`
	SubQuestionID   *uuid.UUID `json:"sub_question_id,omitempty"`
}

// Part:1 Grade
type CreateGradeRequest struct {
	QuestionID     uuid.UUID  `json:"question_id"`
	SubQuestionID  *uuid.UUID `json:"sub_question_id,omitempty"`
	RubricID       uuid.UUID  `json:"rubric_id"`
	RubricDetailID uuid.UUID  `json:"rubric_detail_id"`
	HasSelected    bool       `json:"has_selected"`
}

type AssignmentsListResponse struct {
	AssignmentID   uuid.UUID `json:"assignment_id"`
	AssignmentName string    `json:"assignment_name"`
}

type TotalSubmissionIDs struct {
	SubmissionID uuid.UUID `json:"submission_id"`
	HasGrade     bool      `json:"has_grade"`
}

// Part:3 Grade
// ---- JSON structs for rubric/grade ----
type RubricJSON struct {
	QuestionsData []RubricQuestionJSON `json:"questions_data"`
}

type RubricQuestionJSON struct {
	QuestionID    string                  `json:"question_id"`
	QuestionTitle string                  `json:"question_title"`
	QuestionPoint float64                 `json:"question_point"`
	Rubrics       *RubricsBlockJSON       `json:"rubrics,omitempty"`       // main question
	SubQuestions  []RubricSubQuestionJSON `json:"sub_questions,omitempty"` // sub questions
}

type RubricSubQuestionJSON struct {
	SubQuestionID    string            `json:"sub_question_id"`
	SubQuestionTitle string            `json:"sub_question_title"`
	SubQuestionPoint float64           `json:"sub_question_point"`
	Rubrics          *RubricsBlockJSON `json:"rubrics,omitempty"`
}

type RubricsBlockJSON struct {
	RubricID      string             `json:"rubric_id"`
	RubricSetting string             `json:"rubric_setting"`
	HasCeiling    bool               `json:"has_ceiling"`
	HasFloor      bool               `json:"has_floor"`
	RubricDetails []RubricDetailJSON `json:"rubric_details"`
}

type RubricDetailJSON struct {
	RubricDetailID    string  `json:"rubric_detail_id"`
	RubricPoint       float64 `json:"rubric_point"`
	RubricDescription string  `json:"rubric_description"`
	HasSelected       bool    `json:"has_selected"`
}

type GradeJSON struct {
	QuestionsData []GradeQuestionJSON `json:"questions_data"`
}

type GradeQuestionJSON struct {
	QuestionID   string                 `json:"question_id"`
	Rubrics      *RubricsBlockJSON      `json:"rubrics,omitempty"`       // main
	SubQuestions []GradeSubQuestionJSON `json:"sub_questions,omitempty"` // subs
}

type GradeSubQuestionJSON struct {
	SubQuestionID string            `json:"sub_question_id"`
	Rubrics       *RubricsBlockJSON `json:"rubrics,omitempty"`
}

// Part:1 Assignment settings
// ---- JSON structs for publish status ----
type UpdateAssignmentPublishedGradeRequest struct {
	AssignmentID        uuid.UUID `json:"assignment_id"`
	AssignmentSectionID uuid.UUID `json:"assignment_section_id"`
	SectionID           uuid.UUID `json:"section_id"`
	PublishedGrade      bool      `json:"published_grade"`
}

type UpdateAssignmentPublishedAssignmentRequest struct {
	AssignmentID        uuid.UUID `json:"assignment_id"`
	AssignmentSectionID uuid.UUID `json:"assignment_section_id"`
	SectionID           uuid.UUID `json:"section_id"`
	PublishedAssignment bool      `json:"published_assignment"`
}

// Part:1 Submission from grade-submission
type SubmissionsFromGradeSubmissionResponse struct {
	QuestionsDetails  []QuestionDetails `json:"questions_details"`
	HeaderDetails     HeaderDetails     `json:"header_details"`
	AssignmentDetails AssignmentDetails `json:"assignment_details"`
	Summary           ScoreSummary      `json:"summary"`
}

type HeaderDetails struct {
	FullName string `json:"full_name"`
	NickName string `json:"nick_name"`
	Section  string `json:"section"`
}

type AssignmentDetails struct {
	AssignmentName string `json:"assignment_name"`
}

type ScoreSummary struct {
	GradeStatus          bool    `json:"grade_status"`
	TotalAssignmentPoint float64 `json:"total_assignment_point"`
	TotalSubmissionPoint float64 `json:"total_submission_point"`
}

type QuestionDetails struct {
	QuestionID    uuid.UUID           `json:"question_id"`
	QuestionTitle string              `json:"question_title"`
	QuestionPoint float64             `json:"question_point"`
	BoundingBoxID *string             `json:"bounding_box_id,omitempty"`
	Rubrics       *RubricsBlock       `json:"rubrics,omitempty"`
	SubQuestions  []SubQuestionDetail `json:"sub_questions,omitempty"`
}

type SubQuestionDetail struct {
	SubQuestionID    uuid.UUID     `json:"sub_question_id"`
	SubQuestionTitle string        `json:"sub_question_title"`
	SubQuestionPoint float64       `json:"sub_question_point"`
	BoundingBoxID    *string       `json:"bounding_box_id,omitempty"`
	Rubrics          *RubricsBlock `json:"rubrics,omitempty"`
}

type RubricsBlock struct {
	RubricID      uuid.UUID          `json:"rubric_id"`
	HasFloor      bool               `json:"has_floor"`
	HasCeiling    bool               `json:"has_ceiling"`
	RubricSetting string             `json:"rubric_setting"`
	RubricDetails []RubricDetailItem `json:"rubric_details"`
}

type RubricDetailItem struct {
	RubricDetailID    uuid.UUID `json:"rubric_detail_id"`
	HasSelected       bool      `json:"has_selected"`
	RubricPoint       float64   `json:"rubric_point"`
	RubricDescription string    `json:"rubric_description"`
}

// Part:1 Export data
// ---- JSON structs for export data ----
type CreateGradeToExcelFileRequest struct {
	AssignmentIDs []uuid.UUID `json:"assignment_ids"`
}

type LatestExportListResponse struct {
	ExportGradeID uuid.UUID  `json:"export_grade_id"`
	CourseID      uuid.UUID  `json:"course_id"`
	AssignmentID  uuid.UUID  `json:"assignment_id"`
	FileName      string     `json:"file_name"`
	FileStatus    string     `json:"file_status"`
	FileURL       string     `json:"file_url"`
	ProcessedAt   *time.Time `json:"processed_at"`
	CreatedAt     time.Time  `json:"created_at"`
	RequestedBy   string     `json:"requested_by"`
}

// Part:1 Assignment statistics
// ---- JSON structs for assignment statistics ----
type GetAssignmentStatisticsRequest struct {
	AssignmentID uuid.UUID   `json:"assignment_id"`
	SectionIDs   []uuid.UUID `json:"section_ids"`
}

type StatsCore struct {
	PercentMin           float64
	PercentMedian        float64
	PercentMax           float64
	PercentMean          float64
	PercentSD            float64
	TotalSubmissions     int64
	TotalAssignmentScore float64
	QMean                map[uuid.UUID]float64
	SQMean               map[uuid.UUID]float64
	QRubric              map[uuid.UUID][]RubricDetailCount
	SQRubric             map[uuid.UUID][]RubricDetailCount
}

type AssignmentStatisticsResponse struct {
	Minimum              float64                           `json:"minimum"`
	Median               float64                           `json:"median"`
	Maximum              float64                           `json:"maximum"`
	Mean                 float64                           `json:"mean"`
	SD                   float64                           `json:"sd"`
	TotalSubmissions     int64                             `json:"total_submission"`
	TotalAssignmentScore float64                           `json:"total_assignment_score"`
	QuestionsStatistics  []QuestionsListStatisticsResponse `json:"questions_statistics"`
}

type QuestionsListStatisticsResponse struct {
	QuestionID     uuid.UUID                       `json:"question_id"`
	QuestionNumber string                          `json:"question_number"`
	PercentMean    *float64                        `json:"percent_mean,omitempty"`
	SubQuestions   []SubQuestionStatisticsResponse `json:"sub_questions,omitempty"`
}

type SubQuestionStatisticsResponse struct {
	SubQuestionID  uuid.UUID `json:"sub_question_id"`
	QuestionNumber string    `json:"question_number"`
	PercentMean    *float64  `json:"percent_mean,omitempty"`
}

type QuestionsListStatsResponse []QuestionListStatsItem

type QuestionListStatsItem struct {
	QuestionID     uuid.UUID              `json:"question_id"`
	QuestionNumber string                 `json:"question_number"`
	QuestionTitle  string                 `json:"question_title"`
	QuestionPoint  float64                `json:"question_point"`
	PercentMean    *float64               `json:"percent_mean,omitempty"`
	Mean           *float64               `json:"mean,omitempty"`
	Rubric         *RubricStats           `json:"rubric,omitempty"`
	SubQuestions   []SubQuestionStatsItem `json:"sub_questions,omitempty"` // children (optional)
}

type SubQuestionStatsItem struct {
	SubQuestionID    uuid.UUID    `json:"sub_question_id"`
	QuestionNumber   string       `json:"question_number"`
	SubQuestionTitle string       `json:"sub_question_title"`
	SubQuestionPoint float64      `json:"sub_question_point"`
	Mean             *float64     `json:"mean,omitempty"`
	PercentMean      *float64     `json:"percent_mean,omitempty"`
	Rubric           *RubricStats `json:"rubric,omitempty"`
}

// Part:1.1 Rubric statistics
type RubricDetailCount struct {
	RubricID     uuid.UUID `json:"rubric_id"`
	Description  string    `json:"description"`
	TotalsSelect int64     `json:"totals_select"`
}

type RubricStats struct {
	TotalStudent  int64               `json:"total_student"`
	RubricsDetail []RubricDetailCount `json:"rubrics_detail"`
}

// Part:2.1 Statistics review grade
type StatisticsReviewGradeRequest struct {
	Bin uint `json:"bin"`
}

type GradeBin struct {
	Lower float64 `json:"lower"`
	Upper float64 `json:"upper"`
	Count int     `json:"count"`
	Label string  `json:"label"`
}

type StatisticsReviewGradeResponse struct {
	Minimum              float64                             `json:"minimum"`
	Median               float64                             `json:"median"`
	Maximum              float64                             `json:"maximum"`
	Mean                 float64                             `json:"mean"`
	SD                   float64                             `json:"sd"`
	TotalSubmissions     int64                               `json:"total_submission"`
	TotalAssignmentScore float64                             `json:"total_assignment_score"`
	SubmissionScores     []float64                           `json:"submission_scores"`
	GradesData           []GradeBin                          `json:"grades_data"`
	Table                []SubmissionStatisticsTableResponse `json:"table"`
}

// Part:2.2 Submission statistics table
type SubmissionStatisticsTableResponse struct {
	PersonalDataID uuid.UUID  `json:"personal_data_id"`
	StudentName    string     `json:"student_name"`
	Email          string     `json:"email"`
	Sections       string     `json:"sections"`
	Score          *float64   `json:"score"`
	Graded         bool       `json:"graded"`
	HasSubmission  bool       `json:"has_submission"`
	SubmittedAt    *time.Time `json:"submitted_at"`
}

// Part:3 Section statistics
type SectionStatisticsRequest struct {
	AssignmentID uuid.UUID `json:"assignment_id"`
}

type SectionListForStatisticsResponse struct {
	SectionID   []uuid.UUID `json:"section_id"`
	SectionName string      `json:"section_name"`
	IsAll       bool        `json:"is_all,omitempty"`
}

// Part: 1 CMU OAuth
type CMUTokenResponse struct {
	AccessToken  string `json:"access_token"`
	ExpiresIn    int64  `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	Scope        string `json:"scope"`
}

type CMUBasicInfo struct {
	CMUITAccountName string `json:"cmuitaccount_name"`
	CMUITAccount     string `json:"cmuitaccount"` // email
	StudentID        string `json:"student_id"`
	PreNameEN        string `json:"prename_EN"`
	FirstNameEN      string `json:"firstname_EN"`
	LastNameEN       string `json:"lastname_EN"`
	OrganizationEN   string `json:"organization_name_EN"`
	ITAccountTypeEN  string `json:"itaccounttype_EN"`
}

type LoginResult struct {
	JWT          string       `json:"jwt"`
	User         *models.User `json:"user"`
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	ExpiresIn    int64        `json:"expires_in"`
	NeedsSignUp  bool         `json:"needs_sign_up"`
	RedirectURL  string       `json:"redirect_url,omitempty"`
}
