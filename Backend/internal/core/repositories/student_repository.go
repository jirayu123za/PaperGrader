package repositories

import "github.com/google/uuid"

type StudentRepository interface {
	// find all courses and assignments for a student
	FindCoursesAndAssignments(UserID uuid.UUID) ([]map[string]interface{}, error)
	FindAssignmentNamesWithCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileNames []string, err error)
}
