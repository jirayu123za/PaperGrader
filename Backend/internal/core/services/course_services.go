package services

import (
	"paperGrader/internal/core/repositories"
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

// Primary port
type CourseService interface {
	// CRUD operations for Courses
	CreateCourse(Course *models.Course) error
	GetCourseByID(CourseID uuid.UUID) (*models.Course, error)
	GetCourses() ([]*models.Course, error)
	UpdateCourse(Course *models.Course) error
	DeleteCourse(Course *models.Course) error

	// using jwt
	/*
		GetCourseByUserID(UserID uuid.UUID) ([]*models.Course, error)
		GetNameByUserID(UserID uuid.UUID) (string, error)
		GetUserGroupByUserID(UserID uuid.UUID) (string, error)
		GetAssignmentByUserID(UserID uuid.UUID) ([]*models.Assignment, error)
	*/

	// CRD operations for Instructor lists
	CreateInstructorList(CourseID uuid.UUID, InstructorList *models.InstructorList) error
	GetInstructorsList() ([]*models.InstructorList, error)
	GetInstructorsListByCourseID(CourseID uuid.UUID) ([]*models.InstructorList, error)
	GetInstructorsListByListID(ListID uuid.UUID) (*models.InstructorList, error)
	DeleteInstructorList(InstructorList *models.InstructorList) error
}

type CourseServiceImpl struct {
	repo repositories.CourseRepository
}

// func instance business logic call
func NewCourseService(repo repositories.CourseRepository) CourseService {
	return &CourseServiceImpl{
		repo: repo,
	}
}

func (s *CourseServiceImpl) CreateCourse(Course *models.Course) error {
	if err := s.repo.AddCourse(Course); err != nil {
		return err
	}
	return nil
}

func (s *CourseServiceImpl) GetCourseByID(CourseID uuid.UUID) (*models.Course, error) {
	Course, err := s.repo.FindCourseByID(CourseID)
	if err != nil {
		return nil, err
	}
	return Course, nil
}

func (s *CourseServiceImpl) GetCourses() ([]*models.Course, error) {
	Courses, err := s.repo.FindCourses()
	if err != nil {
		return nil, err
	}
	return Courses, nil
}

func (s *CourseServiceImpl) UpdateCourse(Course *models.Course) error {
	existingCourses, err := s.repo.FindCourseByID(Course.CourseID)
	if err != nil {
		return err
	}

	existingCourses.CourseName = Course.CourseName
	//existingCourses.CourseDescription = Course.CourseDescription

	if err := s.repo.ModifyCourse(existingCourses); err != nil {
		return err
	}
	return nil
}

func (s *CourseServiceImpl) DeleteCourse(Course *models.Course) error {
	deleteCourse, err := s.repo.FindCourseByID(Course.CourseID)
	if err != nil {
		return err
	}

	if err := s.repo.RemoveCourse(deleteCourse); err != nil {
		return err
	}
	return nil
}

// Under line here be CourseServiceImpl of Instructor list
func (s *CourseServiceImpl) CreateInstructorList(CourseID uuid.UUID, InstructorList *models.InstructorList) error {
	if err := s.repo.AddInstructorList(CourseID, InstructorList); err != nil {
		return err
	}
	return nil
}

func (s *CourseServiceImpl) GetInstructorsList() ([]*models.InstructorList, error) {
	InstructorLists, err := s.repo.FindInstructorsList()
	if err != nil {
		return nil, err
	}
	return InstructorLists, nil
}

func (s *CourseServiceImpl) GetInstructorsListByCourseID(CourseID uuid.UUID) ([]*models.InstructorList, error) {
	InstructorLists, err := s.repo.FindInstructorsListByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return InstructorLists, nil
}

func (s *CourseServiceImpl) GetInstructorsListByListID(ListID uuid.UUID) (*models.InstructorList, error) {
	InstructorLists, err := s.repo.FindInstructorsListByListID(ListID)
	if err != nil {
		return nil, err
	}
	return InstructorLists, nil
}

func (s *CourseServiceImpl) DeleteInstructorList(InstructorList *models.InstructorList) error {
	deleteInstructorList, err := s.repo.FindInstructorsListByListID(InstructorList.ListID)
	if err != nil {
		return err
	}

	if err := s.repo.RemoveInstructorList(deleteInstructorList); err != nil {
		return err
	}
	return nil
}
