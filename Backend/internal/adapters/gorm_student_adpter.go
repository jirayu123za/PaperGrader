package adapters

import (
	"encoding/json"
	"paperGrader/internal/adapters/response"
	"paperGrader/internal/models"
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// Secondary adapters
type GormStudentRepository struct {
	db *gorm.DB
}

func NewGormStudentRepository(db *gorm.DB) *GormStudentRepository {
	return &GormStudentRepository{
		db: db,
	}
}

func (r *GormStudentRepository) FindPersonalDataIDByUserID(UserID uuid.UUID) (uuid.UUID, error) {
	var result response.PersonalDataIDResponse
	if err := r.db.
		Table("personal_data").
		Select("personal_data.personal_data_id").
		Joins("JOIN users ON users.email = personal_data.email").
		Where("users.user_id = ?", UserID).
		Where("personal_data.deleted_at IS NULL").
		First(&result).Error; err != nil {
		return uuid.Nil, err
	}
	return result.PersonalDataID, nil
}

func (r *GormStudentRepository) AddSubmissionFile(submission *models.Submission) error {
	if result := r.db.Create(submission); result.Error != nil {
		return result.Error
	}
	return nil
}

// find all courses and assignments for a student
func (r *GormStudentRepository) FindCoursesAndAssignments(UserID uuid.UUID) ([]map[string]interface{}, error) {
	var courses []map[string]interface{}

	if err := r.db.
		Table("courses").
		Select(`
			courses.course_id, 
			courses.course_name, 
			courses.course_code, 
			assignments.assignment_id, 
			assignments.assignment_name, 
			assignments.assignment_description, 
			assignment_sections.due_date, 
			assignment_sections.release_date, 
			assignment_sections.cut_off_date,
			sections.section_name,
			EXISTS (
				SELECT 1 
				FROM submissions s
				WHERE s.assignment_id = assignments.assignment_id
				  AND s.submitted_by = users.user_id
				  AND s.deleted_at IS NULL
			) AS has_submitted
		`).
		Joins("JOIN enrollment_lists ON enrollment_lists.course_id = courses.course_id").
		Joins("JOIN sections ON sections.section_id = enrollment_lists.section_id").
		Joins("JOIN assignment_sections ON sections.section_id = assignment_sections.section_id").
		Joins("JOIN assignments ON assignments.assignment_id = assignment_sections.assignment_id").
		Joins("JOIN personal_data ON personal_data.personal_data_id = enrollment_lists.personal_data_id").
		Joins("JOIN users ON users.email = personal_data.email").
		Where(`
			users.user_id = ? 
			AND courses.deleted_at IS NULL 
			AND assignments.deleted_at IS NULL 
			AND enrollment_lists.deleted_at IS NULL
			AND assignment_sections.deleted_at IS NULL
			AND sections.deleted_at IS NULL
			AND assignment_sections.due_date IS NOT NULL 
			AND assignment_sections.release_date IS NOT NULL
			AND assignments.submitted_by = ?
		`, UserID, "student").
		Find(&courses).Error; err != nil {
		return nil, err
	}
	return courses, nil
}

func (r *GormStudentRepository) FindCoursesByUserID(UserID uuid.UUID) ([]map[string]interface{}, error) {
	var courses []map[string]interface{}
	if err := r.db.Table("courses").
		Table("courses").
		Select("courses.course_id, courses.course_name, courses.course_code, courses.course_description, courses.semester, courses.academic_year, courses.entry_code, COUNT(assignments.assignment_id) AS total_assignments").
		Joins("JOIN enrollment_lists ON enrollment_lists.course_id = courses.course_id").
		Joins("JOIN personal_data ON personal_data.personal_data_id = enrollment_lists.personal_data_id").
		Joins("JOIN users ON users.email = personal_data.email").
		Joins("LEFT JOIN assignments ON assignments.course_id = courses.course_id").
		Where("users.user_id = ?", UserID).
		Where("courses.deleted_at IS NULL").
		Group("courses.course_id").
		Find(&courses).Error; err != nil {
		return nil, err
	}

	return courses, nil
}

func (r *GormStudentRepository) FindAssignmentNamesWithCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileNames []string, err error) {
	var assignmentFiles []models.AssignmentFile
	if err := r.db.Table("assignment_files").
		Select("assignment_files.assignment_file_name").
		Joins("JOIN assignments ON assignments.assignment_id = assignment_files.assignment_id").
		Where("assignments.course_id = ? AND assignment_files.assignment_id = ? AND assignment_files.deleted_at IS NULL", CourseID, AssignmentID).
		Scan(&assignmentFiles).Error; err != nil {
		return nil, err
	}

	for _, assignmentFile := range assignmentFiles {
		fileNames = append(fileNames, assignmentFile.AssignmentFileName)
	}

	return fileNames, nil
}

func (r *GormStudentRepository) FindAssignmentsByCourseID(courseID uuid.UUID, userID uuid.UUID) ([]map[string]interface{}, error) {
	rows := make([]map[string]interface{}, 0)
	now := time.Now().UTC()

	enrolledSections := r.db.
		Table("enrollment_lists AS el").
		Select("el.section_id").
		Joins(`JOIN personal_data AS pd ON pd.personal_data_id = el.personal_data_id AND pd.deleted_at IS NULL`).
		Joins(`JOIN users AS u ON u.email = pd.email AND u.deleted_at IS NULL`).
		Where(`el.course_id = ? AND u.user_id = ? AND el.deleted_at IS NULL`, courseID, userID)

	personalDataIDSub := r.db.
		Table("personal_data AS pd").
		Select("pd.personal_data_id").
		Joins(`JOIN users AS u ON u.email = pd.email AND u.deleted_at IS NULL`).
		Where(`u.user_id = ? AND pd.deleted_at IS NULL`, userID)

	var hasSection int64
	if err := r.db.Table("(?) AS s", enrolledSections).Count(&hasSection).Error; err != nil {
		return nil, err
	}
	if hasSection == 0 {
		return rows, nil
	}

	sActive := r.db.
		Table("assignment_sections AS s").
		Select("s.assignment_id, s.section_id, s.published_assignment, s.release_date, s.due_date, s.cut_off_date").
		Where("s.deleted_at IS NULL").
		Where("s.section_id IN (?)", enrolledSections).
		Where(`
			s.published_assignment = TRUE
			OR (
				s.release_date IS NOT NULL AND s.release_date <= ?
				AND (
					s.due_date IS NULL OR s.due_date > ?
					OR (s.cut_off_date IS NOT NULL AND s.cut_off_date > ?)
				)
			)
		`, now, now, now)

	best := r.db.
		Table("(?) AS s", sActive).
		Select(`
			DISTINCT ON (s.assignment_id)
			s.assignment_id,
			s.release_date  AS release_date,
			s.due_date      AS due_date,
			s.cut_off_date  AS cut_off_date
		`).
		Order("s.assignment_id, s.published_assignment DESC, s.release_date ASC NULLS LAST")

	latestSubmission := r.db.
		Table("submissions AS s").
		Select(`
			DISTINCT ON (s.assignment_id)
			s.assignment_id,
			s.submission_id,
			s.submitted_at
		`).
		Where("s.deleted_at IS NULL").
		Where("s.belongs_to IN (?)", personalDataIDSub).
		Order("s.assignment_id, s.submitted_at DESC, s.submission_id DESC")

	// main query
	q := r.db.
		Table("assignments AS a").
		Joins("JOIN (?) AS b ON b.assignment_id = a.assignment_id", best).
		Joins("LEFT JOIN (?) AS ls ON ls.assignment_id = a.assignment_id", latestSubmission).
		Where("a.course_id = ? AND a.deleted_at IS NULL AND COALESCE(a.submitted_by, 'student') = ?", courseID, "student").
		Select(`
			a.assignment_id,
			a.assignment_name,
			a.assignment_description,
			b.release_date  AS release_date,
			b.due_date      AS due_date,
			b.cut_off_date  AS cut_off_date,
			(ls.submission_id IS NOT NULL) AS has_submitted,
			ls.submission_id AS submission_id,
			ls.submitted_at  AS last_submitted_at
		`).
		Order("b.release_date ASC NULLS LAST, a.assignment_id ASC")

	if err := q.Scan(&rows).Error; err != nil {
		return nil, err
	}
	return rows, nil
}

func (r *GormStudentRepository) FindCourseByCourseID(CourseID uuid.UUID) (map[string]interface{}, error) {
	var course map[string]interface{}
	if err := r.db.
		Table("courses").
		Select("courses.course_id, courses.course_name, courses.course_code, courses.course_description, courses.semester, courses.academic_year, courses.entry_code").
		Where("courses.course_id = ? AND courses.deleted_at IS NULL", CourseID).
		Find(&course).Error; err != nil {
		return nil, err
	}
	return course, nil
}

// File
func (r *GormStudentRepository) FindSubmissionFileName(AssignmentID uuid.UUID, CourseID uuid.UUID, UserID uuid.UUID) (string, error) {
	pdSub := r.db.
		Table("personal_data AS pd").
		Select("pd.personal_data_id").
		Joins(`JOIN users AS u ON u.email = pd.email AND u.deleted_at IS NULL`).
		Joins(`JOIN enrollment_lists AS el ON el.personal_data_id = pd.personal_data_id AND el.deleted_at IS NULL`).
		Where(`u.user_id = ? AND el.course_id = ? AND pd.deleted_at IS NULL`, UserID, CourseID)

	var row struct {
		FileName string `gorm:"column:submission_file_name"`
	}

	err := r.db.
		Table("submissions AS s").
		Select("s.submission_file_name").
		Where(`
            s.assignment_id = ?
            AND s.deleted_at IS NULL
            AND s.belongs_to IN (?)
        `, AssignmentID, pdSub).
		Order(gorm.Expr("CASE WHEN s.submitted_by = ? THEN 0 ELSE 1 END ASC", UserID)).
		Order("s.submitted_at DESC").
		Limit(1).
		Scan(&row).Error
	if err != nil {
		return "", err
	}
	if row.FileName == "" {
		return "", gorm.ErrRecordNotFound
	}
	return row.FileName, nil
}

// Submission
func (r *GormStudentRepository) FindAssignmentName(CourseID uuid.UUID, AssignmentID uuid.UUID) (assignmentName string, err error) {
	var out struct {
		AssignmentName string `gorm:"column:assignment_name"`
	}

	err = r.db.
		Table("assignments").
		Select("assignment_name").
		Where("assignment_id = ? AND course_id = ? AND deleted_at IS NULL", AssignmentID, CourseID).
		Take(&out).Error
	if err != nil {
		return "", err
	}
	return out.AssignmentName, nil
}

func (r *GormStudentRepository) FindSubmissionDetails(courseID uuid.UUID, assignmentID uuid.UUID, submissionID uuid.UUID) (response.HeaderDetails, error) {
	var details response.HeaderDetails
	err := r.db.
		Table("submissions AS s").
		Joins(`LEFT JOIN assignments a ON a.assignment_id = s.assignment_id AND a.deleted_at IS NULL`).
		Joins(`LEFT JOIN personal_data pd ON pd.personal_data_id = s.belongs_to AND pd.deleted_at IS NULL`).
		Joins(`LEFT JOIN enrollment_lists el ON el.personal_data_id = pd.personal_data_id AND el.course_id = a.course_id AND el.deleted_at IS NULL`).
		Joins(`LEFT JOIN sections sec ON sec.section_id = el.section_id AND sec.deleted_at IS NULL`).
		Select(`
            COALESCE(
                NULLIF(TRIM(
                    COALESCE(pd.first_name, '') ||
                    CASE
                        WHEN COALESCE(NULLIF(pd.last_name,''),'') = '' THEN ''
                        ELSE ' ' || pd.last_name
                    END
                ), ''),
                COALESCE(pd.email,''),
                ''
            ) AS full_name,
            UPPER(
                CASE
                    WHEN COALESCE(NULLIF(TRIM(pd.first_name), ''), '') = '' THEN ''
                    WHEN COALESCE(NULLIF(TRIM(pd.last_name ), ''), '') = '' THEN SUBSTRING(TRIM(pd.first_name) FROM 1 FOR 2)
                    ELSE SUBSTRING(TRIM(pd.first_name) FROM 1 FOR 1) || SUBSTRING(TRIM(pd.last_name) FROM 1 FOR 1)
                END
            ) AS nick_name,
            COALESCE(sec.section_name, '') AS section
        `).
		Where(`s.submission_id = ? AND s.assignment_id = ? AND a.course_id = ? AND s.deleted_at IS NULL`, submissionID, assignmentID, courseID).
		Take(&details).Error

	if err != nil {
		return response.HeaderDetails{}, err
	}
	return details, nil
}

func (r *GormStudentRepository) FindRubricDataByAssignmentID(AssignmentID uuid.UUID) (map[string]interface{}, error) {
	var record struct {
		RubricData datatypes.JSON `gorm:"column:rubric_data"`
	}
	err := r.db.
		Table("rubrics").
		Where("assignment_id = ? AND deleted_at IS NULL", AssignmentID).
		Take(&record).Error
	if err != nil {
		return nil, err
	}

	var rubricData map[string]interface{}
	if err := json.Unmarshal(record.RubricData, &rubricData); err != nil {
		return nil, err
	}
	return rubricData, nil
}

func (r *GormStudentRepository) FindGradeData(assignmentID uuid.UUID, submissionID uuid.UUID) (map[string]interface{}, error) {
	var grade models.Grade
	if err := r.db.Where("submission_id = ?", submissionID).First(&grade).Error; err != nil {
		return nil, err
	}

	var data map[string]interface{}
	if err := json.Unmarshal(grade.GradeData, &data); err != nil {
		return nil, err
	}

	return data, nil
}
