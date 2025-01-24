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

	GetCoursesByUserID(UserID uuid.UUID) ([]map[string]interface{}, error)
	GetCourseByCourseID(CourseID uuid.UUID) (map[string]interface{}, error)

	GetInsAssignmentByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)

	GetAssignmentsByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)
	GetActiveAssignmentsByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)
	GetAssignmentByCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) (map[string]interface{}, error)

	GetInstructorsNameByCourseID(courseID uuid.UUID) ([]*models.PersonalData, error)

	GetSubmissionListByCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.SubmissionResponse, error)
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

func (s *InstructorServiceImpl) GetCoursesByUserID(UserID uuid.UUID) ([]map[string]interface{}, error) {
	courses, err := s.repo.FindCoursesByUserID(UserID)
	if err != nil {
		return nil, err
	}
	return courses, nil
}

func (s *InstructorServiceImpl) GetCourseByCourseID(CourseID uuid.UUID) (map[string]interface{}, error) {
	course, err := s.repo.FindCourseByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return course, nil
}

func (s *InstructorServiceImpl) GetInsAssignmentByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error) {
	assignments, err := s.repo.FindInsAssignmentByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return assignments, nil
}

func (s *InstructorServiceImpl) GetAssignmentsByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error) {
	assignments, err := s.repo.FindAssignmentsByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return assignments, nil
}

func (s *InstructorServiceImpl) GetActiveAssignmentsByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error) {
	activeAssignments, err := s.repo.FindActiveAssignmentsByCourseID(CourseID)
	if err != nil {
		return nil, err
	}
	return activeAssignments, nil
}

func (s *InstructorServiceImpl) GetAssignmentByCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) (map[string]interface{}, error) {
	data, err := s.repo.FindAssignmentByCourseIDAndAssignmentID(CourseID, AssignmentID)
	if err != nil {
		return nil, err
	}

	if len(data) == 0 {
		return nil, nil
	}

	assignment := map[string]interface{}{
		"assignment_id":          data[0]["assignment_id"],
		"assignment_name":        data[0]["assignment_name"],
		"assignment_description": data[0]["assignment_description"],
		"submiss_by":             data[0]["submiss_by"],
		"grading_type":           data[0]["grading_type"],
		"late_submiss":           data[0]["late_submiss"],
		"published":              data[0]["published"],
		"regrades":               data[0]["regrades"],
		"group_submiss":          data[0]["group_submiss"],
	}

	assignmentSections := []map[string]interface{}{}
	for _, row := range data {
		section := map[string]interface{}{
			"assignment_section_id": row["assignment_section_id"],
			"release_date":          row["release_date"],
			"due_date":              row["due_date"],
			"cut_off_date":          row["cut_off_date"],
			"section_id":            row["section_id"],
			"section_name":          row["section_name"],
		}
		assignmentSections = append(assignmentSections, section)
	}

	return map[string]interface{}{
		"assignment":          assignment,
		"assignment_sections": assignmentSections,
	}, nil
}

func (s *InstructorServiceImpl) GetInstructorsNameByCourseID(courseID uuid.UUID) ([]*models.PersonalData, error) {
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
