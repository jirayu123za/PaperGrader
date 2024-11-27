package services

import (
	"paperGrader/internal/core/repositories"
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

// Primary port
type CourseService interface {
	// CRUD operations for Courses
	CreateCourse(course *models.Course, personalData *models.PersonalData, enrollment *models.EnrollmentList) error
	GetCourseByID(CourseID uuid.UUID) (*models.Course, error)
	GetCourses() ([]*models.Course, error)
	UpdateCourse(Course *models.Course) error
	DeleteCourse(Course *models.Course) error
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

func (s *CourseServiceImpl) CreateCourse(course *models.Course, personalData *models.PersonalData, enrollment *models.EnrollmentList) error {
	if err := s.repo.AddCourse(course, personalData, enrollment); err != nil {
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
