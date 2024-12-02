package adapters

import (
	"fmt"
	"paperGrader/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Secondary adapters
type GormCourseRepository struct {
	db *gorm.DB
}

func NewGormCourseRepository(db *gorm.DB) *GormCourseRepository {
	return &GormCourseRepository{
		db: db,
	}
}

func (r *GormCourseRepository) AddCourse(Course *models.Course, personalData *models.PersonalData, enrollment *models.EnrollmentList) error {
	tx := r.db.Begin()

	if Course.CourseDescription != nil && *Course.CourseDescription == "" {
		Course.CourseDescription = nil
	}

	if course := tx.Create(Course); course.Error != nil {
		tx.Rollback()
		return course.Error
	}

	if err := tx.Create(personalData).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to create personal data: %v", err)
	}

	enrollment.PersonalDataID = personalData.PersonalDataID
	enrollment.CourseID = Course.CourseID

	if err := tx.Create(enrollment).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to create enrollment list: %v", err)
	}

	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}
	return nil
}

func (r *GormCourseRepository) FindCourseByID(courseID uuid.UUID) (*models.Course, error) {
	var course *models.Course
	if result := r.db.Preload("Assignments").
		First(&course, "course_id = ?", courseID); result.Error != nil {
		return nil, result.Error
	}
	return course, nil
}

func (r *GormCourseRepository) FindCourses() ([]*models.Course, error) {
	var courses []*models.Course
	if result := r.db.Find(&courses); result.Error != nil {
		return nil, result.Error
	}
	return courses, nil
}

func (r *GormCourseRepository) ModifyCourse(Course *models.Course) error {
	var existingCourse *models.Course
	if result := r.db.First(&existingCourse, "course_id = ?", Course.CourseID); result.Error != nil {
		return result.Error
	}

	existingCourse.CourseName = Course.CourseName
	//existingCourse.CourseDescription = Course.CourseDescription

	if result := r.db.Save(&existingCourse); result.Error != nil {
		return result.Error
	}
	return nil
}

func (r *GormCourseRepository) RemoveCourse(Course *models.Course) error {
	var findCourse *models.Course
	if result := r.db.First(&findCourse, "course_id = ?", Course.CourseID); result.Error != nil {
		return result.Error
	}

	if result := r.db.Delete(&findCourse); result.Error != nil {
		return result.Error
	}
	return nil
}
