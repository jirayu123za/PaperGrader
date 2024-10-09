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
	if err := r.db.
		Joins("JOIN instructor_lists ON instructor_lists.course_id = courses.course_id").
		Where("instructor_lists.user_id = ?", UserID).
		Find(&courses).Error; err != nil {
		return nil, err
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
	currentDate := time.Now().Format("02-01-2006")

	if result := r.db.Find(&activeAssignments, "course_id = ? AND due_date >= ? AND release_date <= ? AND cut_off_date > ?", CourseID, currentDate, currentDate, currentDate); result.Error != nil {
		return nil, result.Error
	}
	return activeAssignments, nil
}

func (r *GormInstructorRepository) FindInstructorsNameByCourseID(CourseID uuid.UUID) ([]*models.User, error) {
	var instructors []*models.User
	if err := r.db.
		Joins("JOIN instructor_lists ON instructor_lists.user_id = users.user_id").
		Where("instructor_lists.course_id = ?", CourseID).
		Find(&instructors).Error; err != nil {
		return nil, err
	}
	return instructors, nil
}
