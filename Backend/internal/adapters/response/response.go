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
	SubmissBy             string    `json:"submiss_by"`
	GradingType           string    `json:"grading_type"`
	LateSubmiss           bool      `json:"late_submiss"`
	Published             bool      `json:"published"`
	Regrades              bool      `json:"regrades"`
	GroupSubmiss          bool      `json:"group_submiss"`
}

type AssignmentSection struct {
	AssignmentSectionID uuid.UUID  `json:"assignment_section_id"`
	ReleaseDate         *time.Time `json:"release_date"`
	DueDate             *time.Time `json:"due_date"`
	CutOffDate          *time.Time `json:"cut_off_date"`
	SectionID           uuid.UUID  `json:"section_id"`
	SectionName         string     `json:"section_name"`
}

type AssignmentResponse struct {
	Assignment         Assignment          `json:"assignment"`
	AssignmentSections []AssignmentSection `json:"assignment_sections"`
}

// Struct for Active Assignment(one structs)
type AssignmentActiveResponse struct {
	AssignmentID          uuid.UUID  `json:"assignment_id"`
	AssignmentName        string     `json:"assignment_name"`
	AssignmentDescription string     `json:"assignment_description"`
	SubmissBy             string     `json:"submiss_by"`
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
	SubmissBy             string     `json:"submiss_by"`
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
	SubmissBy             string                      `json:"submiss_by"`
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
	BoundingBoxID       uuid.UUID `json:"bounding_box_id"`
	BoundingBoxPosition string    `json:"bounding_box_position"`
	BoundingBoxType     string    `json:"bounding_box_type"`
	BoundingBoxPage     uint      `json:"bounding_box_page"`
}

// Struct for Get Questions By Assignment Template
type QuestionsTemplateResponse struct {
	RubricID   uuid.UUID              `json:"rubric_id"`
	RubricData map[string]interface{} `json:"rubric_data"`
}

type PersonalDataIDResponse struct {
	PersonalDataID uuid.UUID `json:"personal_data_id"`
}

type StudentListForSubmissionResponse struct {
	PersonalDataID uuid.UUID `json:"personal_data_id"`
	FullName       string    `json:"full_name"`
	Email          string    `json:"email"`
	StudentCode    string    `json:"student_code"`
	HasSubmission  bool      `json:"has_submission"`
}

type SubmissionFilesResponse struct {
	SubmissionID       uuid.UUID `json:"submission_id"`
	SubmissionFileName string    `json:"submission_file_name"`
	SubmittedAt        time.Time `json:"submitted_at"`
}

type SubmissionListForManagementResponse struct {
	SubmissionID       uuid.UUID `json:"submission_id"`
	SectionName        string    `json:"section_name"`
	FullName           string    `json:"full_name"`
	StudentCode        string    `json:"student_code"`
	HasAssigned        bool      `json:"has_assigned"`
	SubmittedAt        time.Time `json:"submitted_at"`
	SubmissionBoxFiles string    `json:"submission_box_files"`
	SubmissionBoxURLs  []string  `json:"submission_box_urls"`
}

type SubmissionListForManagementDB struct {
	SubmissionID       uuid.UUID `json:"submission_id"`
	SectionName        string    `json:"section_name"`
	FullName           string    `json:"full_name"`
	StudentCode        string    `json:"student_code"`
	HasAssigned        bool      `json:"has_assigned"`
	SubmittedAt        time.Time `json:"submitted_at"`
	SubmissionBoxFiles string    `json:"submission_box_files"`
}

type SubmissionBoxPositionResponse struct {
	BoundingBoxType     string `json:"bounding_box_type"`
	BoundingBoxPosition string `json:"bounding_box_position"`
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

type MatchAllSubmissionOCRResponse struct {
	SubmissionID   uuid.UUID  `json:"submission_id"`
	IsMatch        bool       `json:"is_match"`
	HasAssigned    bool       `json:"has_assigned"`
	PersonalDataID *uuid.UUID `json:"personal_data_id"`
	BestMatchName  string     `json:"best_match_name"`
	BestMatchID    string     `json:"best_match_id"`
	Similarity     float64    `json:"similarity"`
	SubmittedAt    string     `json:"submitted_at"`
	URLNameFile    string     `json:"url_name_file"`
	URLIDFile      string     `json:"url_id_file"`
}

type SubmissionIDResp struct {
	SubmissionID uuid.UUID `json:"submission_id"`
	HasAssigned  bool      `json:"has_assigned"`
	SubmittedAt  time.Time `json:"submitted_at"`
}
