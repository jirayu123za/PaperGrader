package services

import (
	"paperGrader/internal/core/repositories"

	"github.com/google/uuid"
)

// Primary port
type StudentService interface {
	GetCoursesAndAssignments(UserID uuid.UUID) ([]map[string]interface{}, error)
	GetAssignmentNamesWithCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileNames []string, err error)
	GetPDFFileNamesAndURLs(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileNames []string, fileURLs []string, err error)
}

type StudentServiceImpl struct {
	repo      repositories.StudentRepository
	minioRepo repositories.MinIORepository
}

// func instance business logic call
func NewStudentService(repo repositories.StudentRepository, minioRepo repositories.MinIORepository) StudentService {
	return &StudentServiceImpl{
		repo:      repo,
		minioRepo: minioRepo,
	}
}

func (s *StudentServiceImpl) GetCoursesAndAssignments(UserID uuid.UUID) ([]map[string]interface{}, error) {
	courses, err := s.repo.FindCoursesAndAssignments(UserID)
	if err != nil {
		return nil, err
	}
	return courses, nil
}

func (s *StudentServiceImpl) GetAssignmentNamesWithCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileNames []string, err error) {
	fileNames, err = s.repo.FindAssignmentNamesWithCourseIDAndAssignmentID(CourseID, AssignmentID)
	if err != nil {
		return nil, err
	}
	return fileNames, nil
}

func (s *StudentServiceImpl) GetPDFFileNamesAndURLs(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileNames []string, fileURLs []string, err error) {
	PDFileNames, err := s.repo.FindAssignmentNamesWithCourseIDAndAssignmentID(CourseID, AssignmentID)
	if err != nil {
		return nil, nil, err
	}

	courseIDSlice := []string{CourseID.String()}
	assignmentIDSlice := []string{AssignmentID.String()}

	returnFileURLs, returnFileNames, err := s.minioRepo.FindFilesAndNames(courseIDSlice, assignmentIDSlice, PDFileNames)
	if err != nil {
		return nil, nil, err
	}
	return returnFileURLs, returnFileNames, nil
}
