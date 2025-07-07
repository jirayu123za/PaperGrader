package response

import (
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
	GradingType           string    `json:"grading_type"`
	LateSubmitted         bool      `json:"late_submitted"`
	Published             bool      `json:"published"`
	Regrades              bool      `json:"regrades"`
	GroupSubmitted        bool      `json:"group_submitted"`
}

type AssignmentSection struct {
	AssignmentSectionID uuid.UUID  `json:"assignment_section_id"`
	ReleaseDate         *time.Time `json:"release_date"`
	DueDate             *time.Time `json:"due_date"`
	CutOffDate          *time.Time `json:"cut_off_date"`
	SectionID           uuid.UUID  `json:"section_id"`
	SectionName         string     `json:"section_name"`
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
	Published             bool       `json:"published"`
	Regrades              bool       `json:"regrades"`
	CreatedAt             time.Time  `json:"created_at"`
	AssignmentReleaseDate time.Time  `json:"assignment_release_date"`
	AssignmentDueDate     *time.Time `json:"assignment_due_date"`
	AssignmentCutOffDate  *time.Time `json:"assignment_cut_off_date"`
}

// Struct for GetAssignmentsByCourseID(one structs)
type AssignmentsResponse struct {
	AssignmentID          uuid.UUID  `json:"assignment_id"`
	AssignmentName        string     `json:"assignment_name"`
	SubmittedBy           string     `json:"submitted_by"`
	Published             bool       `json:"published"`
	Regrades              bool       `json:"regrades"`
	AssignmentReleaseDate *time.Time `json:"assignment_release_date"`
	AssignmentDueDate     *time.Time `json:"assignment_due_date"`
}

// Struct for GetInsAssignmentByCourseID(two structs)
type AssignmentSectionResponse struct {
	AssignmentID        uuid.UUID  `json:"assignment_id"`
	AssignmentSectionID uuid.UUID  `json:"assignment_section_id"`
	ReleaseDate         *time.Time `json:"release_date"`
	DueDate             *time.Time `json:"due_date"`
	CutOffDate          *time.Time `json:"cut_off_date"`
	SectionID           uuid.UUID  `json:"section_id"`
	SectionName         string     `json:"section_name"`
}

type InsAssignmentResponse struct {
	AssignmentID          uuid.UUID                   `json:"assignment_id"`
	AssignmentName        string                      `json:"assignment_name"`
	SubmittedBy           string                      `json:"submitted_by"`
	Published             bool                        `json:"published"`
	Regrades              bool                        `json:"regrades"`
	AssignmentReleaseDate *time.Time                  `json:"assignment_release_date"`
	AssignmentDueDate     *time.Time                  `json:"assignment_due_date"`
	AssignmentSections    []AssignmentSectionResponse `json:"assignment_sections" gorm:"-"`
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
	QuestionPoint int            `json:"question_point"`
	SubQuestions  []SubQuestions `json:"sub_questions,omitempty"`
}

type SubQuestions struct {
	SubQuestionID    uuid.UUID `json:"sub_question_id"`
	SubQuestionTitle string    `json:"sub_question_title"`
	SubQuestionPoint int       `json:"sub_question_point"`
}

// Part 2: Get Questions List By Assignment Template
type UngradedSubmissions []struct {
	SubmissionID uuid.UUID
}

// Part 3: Get Questions List By Assignment Template
type SubQuestion struct {
	SubQuestionID    uuid.UUID  `json:"sub_question_id"`
	SubQuestionTitle string     `json:"sub_question_title"`
	SubQuestionPoint int        `json:"sub_question_point"`
	SubmissionID     *uuid.UUID `json:"submission_id"`
}

type Question struct {
	QuestionID    uuid.UUID     `json:"question_id"`
	QuestionTitle string        `json:"question_title"`
	QuestionPoint int           `json:"question_point"`
	SubmissionID  *uuid.UUID    `json:"submission_id"`
	SubQuestions  []SubQuestion `json:"sub_questions,omitempty"`
}

type QuestionNoSubmission struct {
	QuestionID    uuid.UUID     `json:"question_id"`
	QuestionTitle string        `json:"question_title"`
	QuestionPoint int           `json:"question_point"`
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
}

type RubricSubQuestion struct {
	SubQuestionID    *uuid.UUID `json:"sub_question_id,omitempty"`
	BoundingBoxID    *uuid.UUID `json:"bounding_box_id,omitempty"`
	SubQuestionTitle string     `json:"sub_question_title"`
	SubQuestionPoint float64    `json:"sub_question_point"`
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

// Query submissions from question
type SubmissionsFromQuestionResponse struct {
	SubmissionID uuid.UUID        `json:"submission_id"`
	UserName     FullNameAndEmail `json:"user_name"`
	SectionName  string           `json:"section_name"`
	// Under line: This mock data
	GradedBy    string `json:"graded_by"`
	Score       int    `json:"score"`
	GradeStatus bool   `json:"grade_status"`
}

type FullNameAndEmail struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
}

type SubmissionsFromQuestionRaw struct {
	SubmissionID uuid.UUID `json:"submission_id"`
	FirstName    string    `json:"first_name"`
	LastName     string    `json:"last_name"`
	Email        string    `json:"email"`
	SectionName  string    `json:"section_name"`
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
