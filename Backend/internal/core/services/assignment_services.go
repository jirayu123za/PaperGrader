package services

import (
	"paperGrader/internal/core/repositories"
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

// Primary port
type AssignmentService interface {
	// CRUD operations for Courses
	CreateAssignment(CourseID uuid.UUID, Assignment *models.Assignment) error
	GetAssignmentByAssignmentID(AssignmentID uuid.UUID) (*models.Assignment, error)
	GetAssignments() ([]*models.Assignment, error)
	GetAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error)
	UpdateAssignment(Assignment *models.Assignment) error
	DeleteAssignment(AssignmentID uuid.UUID) error
}

type AssignmentServiceImpl struct {
	repo       repositories.AssignmentRepository
	courseRepo repositories.CourseRepository
}

// func instance business logic call
func NewAssignmentService(repo repositories.AssignmentRepository, courseRepo repositories.CourseRepository) AssignmentService {
	return &AssignmentServiceImpl{
		repo:       repo,
		courseRepo: courseRepo,
	}
}

func (s *AssignmentServiceImpl) CreateAssignment(CourseID uuid.UUID, Assignment *models.Assignment) error {
	existingCourse, err := s.courseRepo.FindCourseByID(CourseID)
	if err != nil {
		return err
	}

	if err := s.repo.AddAssignment(existingCourse.CourseID, Assignment); err != nil {
		return err
	}
	return nil
}

func (s *AssignmentServiceImpl) GetAssignmentByAssignmentID(AssignmentID uuid.UUID) (*models.Assignment, error) {
	assignment, err := s.repo.FindAssignmentByAssignmentID(AssignmentID)
	if err != nil {
		return nil, err
	}
	return assignment, nil
}

func (s *AssignmentServiceImpl) GetAssignments() ([]*models.Assignment, error) {
	Assignments, err := s.repo.FindAssignments()
	if err != nil {
		return nil, err
	}
	return Assignments, nil
}

func (s *AssignmentServiceImpl) GetAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error) {
	Assignments, err := s.repo.FindAssignmentsByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return Assignments, nil
}

func (s *AssignmentServiceImpl) UpdateAssignment(Assignment *models.Assignment) error {
	existingAssignment, err := s.repo.FindAssignmentByAssignmentID(Assignment.AssignmentID)
	if err != nil {
		return err
	}

	existingAssignment.AssignmentName = Assignment.AssignmentName
	//existingAssignment.AssignmentDescription = Assignment.AssignmentDescription
	existingAssignment.SubmissBy = Assignment.SubmissBy
	existingAssignment.ReleaseDate = Assignment.ReleaseDate
	existingAssignment.DueDate = Assignment.DueDate
	existingAssignment.LateSubmiss = Assignment.LateSubmiss
	existingAssignment.GroupSubmiss = Assignment.GroupSubmiss

	if err := s.repo.ModifyAssignment(existingAssignment); err != nil {
		return err
	}

	return nil
}

func (s *AssignmentServiceImpl) DeleteAssignment(AssignmentID uuid.UUID) error {
	existingAssignment, err := s.repo.FindAssignmentByAssignmentID(AssignmentID)
	if err != nil {
		return err
	}

	if err := s.repo.RemoveAssignment(existingAssignment.AssignmentID); err != nil {
		return err
	}
	return nil
}
