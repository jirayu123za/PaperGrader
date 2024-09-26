package adapters

import (
	"paperGrader/internal/models"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Secondary adapters
type GormInstructorRepository struct {
	db *gorm.DB
}

func NewGormInstructorRepository(db *gorm.DB) *GormInstructorRepository {
	return &GormInstructorRepository{
		db: db,
	}
}

func (r *GormInstructorRepository) AddAssignment(CourseID uuid.UUID, assignment *models.Assignment) error {
	var existingCourse *models.Course
	if result := r.db.First(&existingCourse, "course_id = ?", CourseID); result.Error != nil {
		return result.Error
	}

	assignment.CourseID = existingCourse.CourseID
	if assignment := r.db.Create(assignment); assignment.Error != nil {
		return assignment.Error
	}
	return nil
}

func (r *GormInstructorRepository) FindCoursesByUserID(UserID uuid.UUID) ([]*models.Course, error) {
	var courses []*models.Course
	if result := r.db.Find(&courses, "user_id = ?", UserID); result.Error != nil {
		return nil, result.Error
	}
	return courses, nil
}

func (r *GormInstructorRepository) FindAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error) {
	var assignments []*models.Assignment
	if result := r.db.Find(&assignments, "course_id = ?", CourseID); result.Error != nil {
		return nil, result.Error
	}
	return assignments, nil
}

func (r *GormInstructorRepository) FindActiveAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error) {
	var activeAssignments []*models.Assignment
	if result := r.db.Find(&activeAssignments, "course_id = ? AND due_date >= ? AND release_date <= ?", CourseID, time.Now(), time.Now()); result.Error != nil {
		return nil, result.Error
	}
	return nil, nil
}
