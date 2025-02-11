package adapters

import (
	"paperGrader/internal/adapters/response"
	"paperGrader/internal/models"

	"github.com/google/uuid"
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
			sections.section_name
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
		`, UserID).
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

func (r *GormStudentRepository) FindAssignmentsByCourseID(courseID uuid.UUID) (map[string]interface{}, error) {
	var assignments map[string]interface{}
	if err := r.db.
		Table("assignments").
		Select(`
			DISTINCT ON (assignments.assignment_id) 
			assignments.assignment_id,
			assignments.assignment_name,
			assignments.assignment_description,
			assignment_sections.release_date,
			assignment_sections.due_date,
			assignment_sections.cut_off_date
		`).
		Joins("JOIN assignment_sections ON assignments.assignment_id = assignment_sections.assignment_id").
		Where("assignments.course_id = ? AND assignments.deleted_at IS NULL AND assignment_sections.deleted_at IS NULL", courseID).
		Order("assignments.assignment_id, assignment_sections.release_date ASC").
		Find(&assignments).Error; err != nil {
		return nil, err
	}
	return assignments, nil
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
