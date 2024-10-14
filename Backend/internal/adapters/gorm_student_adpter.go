package adapters

import (
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

// find all courses and assignments for a student
func (r *GormStudentRepository) FindCoursesAndAssignments(UserID uuid.UUID) ([]map[string]interface{}, error) {
	var courses []map[string]interface{}
	query := `
		SELECT c.course_id, c.course_name, c.course_code, a.assignment_id, a.assignment_name, a.due_date, a.release_date
		FROM courses c
		JOIN assignments a ON c.course_id = a.course_id
		JOIN enrollments e ON c.course_id = e.course_id
		WHERE e.user_id = ? 
		AND e.deleted_at IS NULL 
		AND c.deleted_at IS NULL 
		AND a.deleted_at IS NULL 
		AND a.cut_off_date > NOW()
	`
	if result := r.db.Raw(query, UserID).Scan(&courses); result.Error != nil {
		return nil, result.Error
	}
	return courses, nil
}
