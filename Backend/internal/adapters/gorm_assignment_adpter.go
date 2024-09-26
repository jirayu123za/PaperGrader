package adapters

import (
	"paperGrader/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Secondary adapters
type GormAssignmentRepository struct {
	db *gorm.DB
}

func NewGormAssignmentRepository(db *gorm.DB) *GormAssignmentRepository {
	return &GormAssignmentRepository{
		db: db,
	}
}

func (r *GormAssignmentRepository) AddAssignment(CourseID uuid.UUID, Assignment *models.Assignment) error {
	// Implement the logic to AddAssignment to the database using GORM.
	var findCourse *models.Course
	if result := r.db.First(&findCourse, "course_id = ?", CourseID); result.Error != nil {
		return result.Error
	}
	Assignment.CourseID = CourseID
	if assignment := r.db.Create(Assignment); assignment.Error != nil {
		return assignment.Error
	}
	return nil
}

func (r *GormAssignmentRepository) FindAssignmentByAssignmentID(AssignmentID uuid.UUID) (*models.Assignment, error) {
	var assignment *models.Assignment
	if result := r.db.First(&assignment, "assignment_id = ?", AssignmentID); result.Error != nil {
		return nil, result.Error
	}
	return assignment, nil
}

func (r *GormAssignmentRepository) FindAssignments() ([]*models.Assignment, error) {
	var assignments []*models.Assignment
	if result := r.db.Find(&assignments); result.Error != nil {
		return nil, result.Error
	}
	return assignments, nil
}

func (r *GormAssignmentRepository) FindAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error) {
	var assignments []*models.Assignment
	if result := r.db.Find(&assignments, "course_id = ?", CourseID); result.Error != nil {
		return nil, result.Error
	}
	return assignments, nil
}

func (r *GormAssignmentRepository) ModifyAssignment(assignment *models.Assignment) error {
	var existingAssignment *models.Assignment
	if result := r.db.Find(&existingAssignment, "assignment_id = ?", assignment.AssignmentID); result.Error != nil {
		return result.Error
	}

	existingAssignment.AssignmentName = assignment.AssignmentName
	//existingAssignment.AssignmentDescription = Assignment.AssignmentDescription
	existingAssignment.SubmissBy = assignment.SubmissBy
	existingAssignment.ReleaseDate = assignment.ReleaseDate
	existingAssignment.DueDate = assignment.DueDate
	existingAssignment.LateSubmiss = assignment.LateSubmiss
	existingAssignment.GroupSubmiss = assignment.GroupSubmiss

	if result := r.db.Save(&existingAssignment); result.Error != nil {
		return result.Error
	}
	return nil
}

func (r *GormAssignmentRepository) RemoveAssignment(AssignmentID uuid.UUID) error {
	var findAssignment *models.Assignment
	if result := r.db.First(&findAssignment, "assignment_id = ?", AssignmentID); result.Error != nil {
		return result.Error
	}

	if result := r.db.Delete(&findAssignment); result.Error != nil {
		return result.Error
	}
	return nil
}
