package services

import (
	"paperGrader/internal/core/repositories"
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

// Primary port
type StudentService interface {
	GetPersonalDataIDByUserID(UserID uuid.UUID) (uuid.UUID, error)
	CreateSubmissionFile(submission *models.Submission) error

	GetCoursesAndAssignments(UserID uuid.UUID) ([]map[string]interface{}, error)
	GetAssignmentNamesWithCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileNames []string, err error)
	GetPDFFileNamesAndURLs(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileNames []string, fileURLs []string, err error)
	GetCoursesByUserID(UserID uuid.UUID) ([]map[string]interface{}, error)
	GetAssignmentsByCourseID(CourseID uuid.UUID, UserID uuid.UUID) ([]map[string]interface{}, error)
	GetCourseByCourseID(CourseID uuid.UUID) (map[string]interface{}, error)

	// File services
	GetSubmissionFileFormMinIO(AssignmentID uuid.UUID, CourseID uuid.UUID, UserID uuid.UUID) (fileURL string, err error)
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

func (s *StudentServiceImpl) GetPersonalDataIDByUserID(UserID uuid.UUID) (uuid.UUID, error) {
	return s.repo.FindPersonalDataIDByUserID(UserID)
}

func (s *StudentServiceImpl) CreateSubmissionFile(submission *models.Submission) error {
	if err := s.repo.AddSubmissionFile(submission); err != nil {
		return err
	}
	return nil
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

func (s *StudentServiceImpl) GetCoursesByUserID(UserID uuid.UUID) ([]map[string]interface{}, error) {
	courses, err := s.repo.FindCoursesByUserID(UserID)
	if err != nil {
		return nil, err
	}
	return courses, nil
}

func (s *StudentServiceImpl) GetAssignmentsByCourseID(CourseID uuid.UUID, UserID uuid.UUID) ([]map[string]interface{}, error) {
	assignments, err := s.repo.FindAssignmentsByCourseID(CourseID, UserID)
	if err != nil {
		return nil, err
	}
	return assignments, nil
}

func (s *StudentServiceImpl) GetCourseByCourseID(CourseID uuid.UUID) (map[string]interface{}, error) {
	course, err := s.repo.FindCourseByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return course, nil
}

// File services
func (s *StudentServiceImpl) GetSubmissionFileFormMinIO(AssignmentID uuid.UUID, CourseID uuid.UUID, UserID uuid.UUID) (fileURL string, err error) {
	fileName, err := s.repo.FindSubmissionFileName(AssignmentID, CourseID, UserID)
	if err != nil {
		return "", err
	}

	fileURL, err = s.minioRepo.FindFileFromMinIO(CourseID.String(), AssignmentID.String(), fileName)
	if err != nil {
		return "", err
	}
	return fileURL, nil
}
