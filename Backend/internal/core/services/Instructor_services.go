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
	// v2 add assignment to course with Files(FromData)
	//CreateAssignmentWithFile(CourseID uuid.UUID, assignment *models.Assignment, file multipart.File, userGroupName, userName, fileName string) error

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

// v2 add assignment to course with Files(FromData)
/*
func (s *InstructorServiceImpl) CreateAssignmentWithFile(CourseID uuid.UUID, assignment *models.Assignment, file multipart.File, userGroupName, userName, fileName string) error {
	// create assignment first
	if err := s.repo.AddAssignmentWithFiles(CourseID, assignment); err != nil {
		return err
	}

	// save file to MinIO
	if err := s.minioRepo.SaveFileToMinIO(file, userGroupName, userName, fileName); err != nil {
		return err
	}

	assignmentFile := &AssignmentFile{
		AssignmentID:       assignment.AssignmentID,
		AssignmentFileName: fileName,
		CreatedAt:          time.Now(),
	}

	// insert data to assignment_files
	if err := s.repo.AddAssignmentFile(assignmentFile); err != nil {
		return err
	}

	// insert data to uploads
	upload := &Upload{
		UserID:           assignment.UserID,
		AssignmentFileID: assignmentFile.AssignmentFileID,
		CreatedAt:        time.Now(),
	}

	if err := s.repo.AddUpload(upload); err != nil {
		return err
	}
	return nil
}
*/

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
