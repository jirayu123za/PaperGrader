package services

import (
	"paperGrader/internal/core/repositories"

	"github.com/google/uuid"
)

// Primary port
type StudentService interface {
	GetCoursesAndAssignments(UserID uuid.UUID) ([]map[string]interface{}, error)
}

type StudentServiceImpl struct {
	repo repositories.StudentRepository
}

// func instance business logic call
func NewStudentService(repo repositories.StudentRepository) StudentService {
	return &StudentServiceImpl{
		repo: repo,
	}
}

func (s *StudentServiceImpl) GetCoursesAndAssignments(UserID uuid.UUID) ([]map[string]interface{}, error) {
	courses, err := s.repo.FindCoursesAndAssignments(UserID)
	if err != nil {
		return nil, err
	}
	return courses, nil
}
