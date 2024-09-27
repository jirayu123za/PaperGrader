package repositories

import (
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

// Secondary ports
type InstructorRepository interface {
	/*
		Course Overview(ของ user id นั้น)
		Create Course
		Assignment list all(ของคอร์ส id นั้น)
		Assignment active list(ในระยะวันปล่อยงาน และภายในวัน duedate)
	*/
	AddAssignment(CourseID uuid.UUID, assignment *models.Assignment) error
	FindCoursesByUserID(UserID uuid.UUID) ([]*models.Course, error)
	FindAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error)
	FindActiveAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error)
	FindInstructorsNameByCourseID(CourseID uuid.UUID) ([]*models.User, error)
}
