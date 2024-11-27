package repositories

import (
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

// Secondary ports
type CourseRepository interface {
	// CRUD operations for Courses
	AddCourse(Course *models.Course, personalData *models.PersonalData, enrollment *models.EnrollmentList) error
	FindCourseByID(CourseID uuid.UUID) (*models.Course, error)
	FindCourses() ([]*models.Course, error)
	ModifyCourse(Course *models.Course) error
	RemoveCourse(Course *models.Course) error
}
