package services

import (
	"paperGrader/internal/core/repositories"
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

// Primary port
type InstructorService interface {
	// v1 add assignment to course with out Files(Json)
	CreateAssignment(CourseID uuid.UUID, assignment *models.Assignment) error
	CreateAssignmentWithFiles(CourseID uuid.UUID, assignment *models.Assignment, files []models.AssignmentFile, uploads []models.Upload) error

	CreateAssignmentFile(file *models.AssignmentFile) error

	// Get instructors and students by course id
	GetRosterByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)

	GetCoursesByUserID(UserID uuid.UUID) ([]*models.Course, error)
	GetAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error)
	GetActiveAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error)
	GetInstructorsNameByCourseID(CourseID uuid.UUID) ([]*models.User, error)
}

type InstructorServiceImpl struct {
	repo       repositories.InstructorRepository
	courseRepo repositories.CourseRepository
}

// func instance business logic call
func NewInstructorService(repo repositories.InstructorRepository, courseRepo repositories.CourseRepository) InstructorService {
	return &InstructorServiceImpl{
		repo:       repo,
		courseRepo: courseRepo,
	}
}

// v1 add assignment to course with out Files(Json)
func (s *InstructorServiceImpl) CreateAssignment(CourseID uuid.UUID, assignment *models.Assignment) error {
	existingCourse, err := s.courseRepo.FindCourseByID(CourseID)
	if err != nil {
		return err
	}

	if err := s.repo.AddAssignment(existingCourse.CourseID, assignment); err != nil {
		return err
	}
	return nil
}

// News Create assignment to course with Files(FromData)
func (s *InstructorServiceImpl) CreateAssignmentWithFiles(CourseID uuid.UUID, assignment *models.Assignment, files []models.AssignmentFile, uploads []models.Upload) error {
	if err := s.repo.AddAssignmentWithFiles(CourseID, assignment, files, uploads); err != nil {
		return err
	}
	return nil
}

func (s *InstructorServiceImpl) CreateAssignmentFile(file *models.AssignmentFile) error {
	return s.repo.AddAssignmentFile(file)
}

// Get instructors and students by course id
func (s *InstructorServiceImpl) GetRosterByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error) {
	roster, err := s.repo.FindRosterByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return roster, nil
}

func (s *InstructorServiceImpl) GetCoursesByUserID(UserID uuid.UUID) ([]*models.Course, error) {
	courses, err := s.repo.FindCoursesByUserID(UserID)
	if err != nil {
		return nil, err
	}
	return courses, nil
}

func (s *InstructorServiceImpl) GetAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error) {
	assignments, err := s.repo.FindAssignmentsByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return assignments, nil
}

func (s *InstructorServiceImpl) GetActiveAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error) {
	activeAssignments, err := s.repo.FindActiveAssignmentsByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return activeAssignments, nil
}

func (s *InstructorServiceImpl) GetInstructorsNameByCourseID(CourseID uuid.UUID) ([]*models.User, error) {
	instructors, err := s.repo.FindInstructorsNameByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return instructors, nil
}
