package services

import (
	"paperGrader/internal/adapters/response"
	"paperGrader/internal/core/repositories"
	"paperGrader/internal/models"

	"github.com/google/uuid"
)

// Primary port
type InstructorService interface {
	// v1 add assignment to course with out Files(Json)
	CreateAssignment(CourseID uuid.UUID, assignment *models.Assignment) error
	CreateAssignmentWithFiles(CourseID uuid.UUID, assignment *models.Assignment, files []models.AssignmentFile, uploads []models.Upload, assignmentSections []models.AssignmentSection) error

	GetAssignmentNameTemplate(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileName string, err error)
	GetPDFTemplateWithURL(CourseID uuid.UUID, AssignmentID uuid.UUID) (templateURL string, err error)
	GetFileFormSubmission(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileNames []string, fileURLs []string, err error)
	GetAssignmentDetails(CourseID uuid.UUID, AssignmentID uuid.UUID) (map[string]interface{}, error)

	CreateAssignmentFile(file *models.AssignmentFile) error
	UpdateAssignmentAndAssignmentSection(CourseID uuid.UUID, AssignmentID uuid.UUID, assignment *models.Assignment, sections []models.AssignmentSection) error

	GetRosterByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)
	GetRosterSectionByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)
	GetRosterByCourseIDAndSectionID(CourseID uuid.UUID, SectionID uuid.UUID) ([]map[string]interface{}, error)
	GetPersonalDataByIDAndCourseID(PersonalDataID uuid.UUID, CourseID uuid.UUID) ([]map[string]interface{}, error)

	CreateSingleUserRoster(personalData *models.PersonalData, enrollment *models.EnrollmentList) error
	CreateMultipleUserRoster(personalData []models.PersonalData, enrollmentLists []models.EnrollmentList) error
	GetColumnsAndDataFromUploadedFile(fileBytes []byte) (map[string]interface{}, error)

	GetCoursesByUserID(UserID uuid.UUID) ([]response.CoursesResponse, error)
	GetCourseByCourseID(CourseID uuid.UUID) (*response.CourseResponse, error)

	GetInsAssignmentByCourseID(CourseID uuid.UUID) ([]response.InsAssignmentResponse, error)
	GetAssignmentsByCourseID(CourseID uuid.UUID) ([]response.AssignmentsResponse, error)
	GetActiveAssignmentsByCourseID(CourseID uuid.UUID) ([]response.AssignmentActiveResponse, error)
	GetAssignmentByCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) (*response.AssignmentResponse, error)

	GetInstructorsNameByCourseID(courseID uuid.UUID) ([]response.InstructorListResponse, error)

	GetSubmissionListByCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.SubmissionResponse, error)

	CreateBoundingBoxesAndQuestions(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox, rubricData map[string]interface{}) error
	GetBoundingBoxesByAssignmentTemplate(AssignmentID uuid.UUID) ([]response.BoundingBoxTemplateResponse, error)
	UpdateBoundingBoxes(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox) error
	DeleteBoundingBoxes(AssignmentID uuid.UUID, boundingBoxIDs []uuid.UUID) error
}

type InstructorServiceImpl struct {
	repo        repositories.InstructorRepository
	courseRepo  repositories.CourseRepository
	minioRepo   repositories.MinIORepository
	sectionRepo repositories.SectionRepository
}

// func instance business logic call
func NewInstructorService(repo repositories.InstructorRepository, courseRepo repositories.CourseRepository, minioRepo repositories.MinIORepository, sectionRepo repositories.SectionRepository) InstructorService {
	return &InstructorServiceImpl{
		repo:        repo,
		courseRepo:  courseRepo,
		minioRepo:   minioRepo,
		sectionRepo: sectionRepo,
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
func (s *InstructorServiceImpl) CreateAssignmentWithFiles(CourseID uuid.UUID, assignment *models.Assignment, files []models.AssignmentFile, uploads []models.Upload, assignmentSections []models.AssignmentSection) error {
	if err := s.repo.AddAssignmentWithFiles(CourseID, assignment, files, uploads, assignmentSections); err != nil {
		return err
	}
	return nil
}

func (s *InstructorServiceImpl) GetAssignmentNameTemplate(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileName string, err error) {
	templateFile, err := s.repo.FindAssignmentNameTemplate(CourseID, AssignmentID)
	if err != nil {
		return "", err
	}
	return templateFile, nil
}

func (s *InstructorServiceImpl) GetPDFTemplateWithURL(CourseID uuid.UUID, AssignmentID uuid.UUID) (templateURL string, err error) {
	assignmentName, err := s.repo.FindAssignmentNameTemplate(CourseID, AssignmentID)
	if err != nil {
		return "", err
	}

	fileTemplateURL, err := s.minioRepo.FindFileFromMinIO(CourseID.String(), AssignmentID.String(), assignmentName)
	if err != nil {
		return "", err
	}
	return fileTemplateURL, nil
}

func (s *InstructorServiceImpl) GetFileFormSubmission(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileNames []string, fileURLs []string, err error) {
	fileNames, err = s.repo.FindFileFormSubmission(CourseID, AssignmentID)
	if err != nil {
		return nil, nil, err
	}

	courseIDSlice := []string{CourseID.String()}
	assignmentIDSlice := []string{AssignmentID.String()}

	returnFileURLs, returnFileNames, err := s.minioRepo.FindFilesAndNames(courseIDSlice, assignmentIDSlice, fileNames)
	if err != nil {
		return nil, nil, err
	}
	return returnFileNames, returnFileURLs, nil
}

func (s *InstructorServiceImpl) GetAssignmentDetails(CourseID uuid.UUID, AssignmentID uuid.UUID) (map[string]interface{}, error) {
	assignment, err := s.repo.FindAssignmentDetails(CourseID, AssignmentID)
	if err != nil {
		return nil, err
	}
	return assignment, nil
}

func (s *InstructorServiceImpl) CreateAssignmentFile(file *models.AssignmentFile) error {
	return s.repo.AddAssignmentFile(file)
}

func (s *InstructorServiceImpl) UpdateAssignmentAndAssignmentSection(CourseID uuid.UUID, AssignmentID uuid.UUID, assignment *models.Assignment, sections []models.AssignmentSection) error {
	return s.repo.ModifyAssignmentAndAssignmentSection(CourseID, AssignmentID, assignment, sections)
}

// Get instructors and students by course id
func (s *InstructorServiceImpl) GetRosterByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error) {
	roster, err := s.repo.FindRosterByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return roster, nil
}

// Get sections by course id
func (s *InstructorServiceImpl) GetRosterSectionByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error) {
	rosterSection, err := s.repo.FindRosterSectionByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return rosterSection, nil
}

func (s *InstructorServiceImpl) GetRosterByCourseIDAndSectionID(CourseID uuid.UUID, SectionID uuid.UUID) ([]map[string]interface{}, error) {
	roster, err := s.repo.FindRosterByCourseIDAndSectionID(CourseID, SectionID)
	if err != nil {
		return nil, err
	}
	return roster, nil
}

func (s *InstructorServiceImpl) GetPersonalDataByIDAndCourseID(PersonalDataID uuid.UUID, CourseID uuid.UUID) ([]map[string]interface{}, error) {
	personalData, err := s.repo.FindPersonalDataByIDAndCourseID(PersonalDataID, CourseID)
	if err != nil {
		return nil, err
	}
	return personalData, nil
}

// Insert student or instructor to course
func (s *InstructorServiceImpl) CreateSingleUserRoster(personalData *models.PersonalData, enrollment *models.EnrollmentList) error {
	if err := s.repo.AddSingleUserRoster(personalData, enrollment); err != nil {
		return err
	}
	return nil
}

func (s *InstructorServiceImpl) CreateMultipleUserRoster(personalData []models.PersonalData, enrollmentLists []models.EnrollmentList) error {
	if err := s.repo.AddMultipleUserRoster(personalData, enrollmentLists); err != nil {
		return err
	}
	return nil
}

func (s *InstructorServiceImpl) GetColumnsAndDataFromUploadedFile(fileBytes []byte) (map[string]interface{}, error) {
	columnsAndData, err := s.repo.FindColumnsAndDataFromUploadedFile(fileBytes)
	if err != nil {
		return nil, err
	}
	return columnsAndData, nil
}

func (s *InstructorServiceImpl) GetCoursesByUserID(UserID uuid.UUID) ([]response.CoursesResponse, error) {
	courses, err := s.repo.FindCoursesByUserID(UserID)
	if err != nil {
		return nil, err
	}
	return courses, nil
}

func (s *InstructorServiceImpl) GetCourseByCourseID(CourseID uuid.UUID) (*response.CourseResponse, error) {
	course, err := s.repo.FindCourseByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return course, nil
}

func (s *InstructorServiceImpl) GetInsAssignmentByCourseID(CourseID uuid.UUID) ([]response.InsAssignmentResponse, error) {
	assignments, err := s.repo.FindInsAssignmentByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return assignments, nil
}

func (s *InstructorServiceImpl) GetAssignmentsByCourseID(CourseID uuid.UUID) ([]response.AssignmentsResponse, error) {
	assignments, err := s.repo.FindAssignmentsByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return assignments, nil
}

func (s *InstructorServiceImpl) GetActiveAssignmentsByCourseID(CourseID uuid.UUID) ([]response.AssignmentActiveResponse, error) {
	activeAssignments, err := s.repo.FindActiveAssignmentsByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return activeAssignments, nil
}

func (s *InstructorServiceImpl) GetAssignmentByCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) (*response.AssignmentResponse, error) {
	assignmentSections, err := s.repo.FindAssignmentByCourseIDAndAssignmentID(CourseID, AssignmentID)
	if err != nil {
		return nil, err
	}
	return assignmentSections, nil
}

func (s *InstructorServiceImpl) GetInstructorsNameByCourseID(courseID uuid.UUID) ([]response.InstructorListResponse, error) {
	instructors, err := s.repo.FindInstructorsNameByCourseID(courseID)
	if err != nil {
		return nil, err
	}
	return instructors, nil
}

func (s *InstructorServiceImpl) GetSubmissionListByCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.SubmissionResponse, error) {
	submissionList, err := s.repo.FindSubmissionListByCourseIDAndAssignmentID(CourseID, AssignmentID)
	if err != nil {
		return nil, err
	}
	return submissionList, nil
}

func (s *InstructorServiceImpl) CreateBoundingBoxesAndQuestions(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox, rubricData map[string]interface{}) error {
	if err := s.repo.AddBoundingBoxesAndQuestions(AssignmentID, boundingBoxes, rubricData); err != nil {
		return err
	}
	return nil
}

func (s *InstructorServiceImpl) GetBoundingBoxesByAssignmentTemplate(AssignmentID uuid.UUID) ([]response.BoundingBoxTemplateResponse, error) {
	boundingBoxes, err := s.repo.FindBoundingBoxesByAssignmentTemplate(AssignmentID)
	if err != nil {
		return nil, err
	}
	return boundingBoxes, nil
}

func (s *InstructorServiceImpl) UpdateBoundingBoxes(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox) error {
	if err := s.repo.ModifyBoundingBoxes(AssignmentID, boundingBoxes); err != nil {
		return err
	}
	return nil
}

func (s *InstructorServiceImpl) DeleteBoundingBoxes(AssignmentID uuid.UUID, boundingBoxIDs []uuid.UUID) error {
	if err := s.repo.RemoveBoundingBoxes(AssignmentID, boundingBoxIDs); err != nil {
		return err
	}
	return nil
}
