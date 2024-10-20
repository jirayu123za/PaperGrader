package adapters

import (
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

func (r *GormStudentRepository) AddSubmissionFile(submission *models.Submission) error {
	if result := r.db.Create(submission); result.Error != nil {
		return result.Error
	}
	return nil
}

// find all courses and assignments for a student
func (r *GormStudentRepository) FindCoursesAndAssignments(UserID uuid.UUID) ([]map[string]interface{}, error) {
	var courses []map[string]interface{}
	query := `
		SELECT c.course_id, c.course_name, c.course_code,
				a.assignment_id, a.assignment_name, a.assignment_description, a.due_date, a.release_date, a.submiss_by
		FROM courses c
		JOIN assignments a ON c.course_id = a.course_id
		JOIN enrollments e ON c.course_id = e.course_id
		WHERE e.user_id = ? 
		AND e.deleted_at IS NULL 
		AND c.deleted_at IS NULL 
		AND a.deleted_at IS NULL 
		AND (COALESCE(a.cut_off_date, a.due_date) > NOW())
	`
	if result := r.db.Raw(query, UserID).Scan(&courses); result.Error != nil {
		return nil, result.Error
	}
	return courses, nil
}

func (r *GormStudentRepository) FindCoursesByUserID(UserID uuid.UUID) ([]map[string]interface{}, error) {
	var courses []map[string]interface{}
	if err := r.db.Table("courses").
		Select("courses.course_id, courses.course_name, courses.course_code, courses.course_description, courses.semester, courses.academic_year, courses.entry_code, COUNT(assignments.assignment_id) AS total_assignments").
		Joins("JOIN enrollments ON courses.course_id = enrollments.course_id").
		Joins("LEFT JOIN assignments ON assignments.course_id = courses.course_id").
		Where("enrollments.user_id = ? AND enrollments.deleted_at IS NULL AND courses.deleted_at IS NULL", UserID).
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

func (r *GormStudentRepository) FindAssignmentsByCourseID(courseID uuid.UUID) ([]*models.Assignment, error) {
	var assignments []*models.Assignment
	if err := r.db.
		Where("course_id = ? AND deleted_at IS NULL", courseID).
		Find(&assignments).Error; err != nil {
		return nil, err
	}
	return assignments, nil
}
