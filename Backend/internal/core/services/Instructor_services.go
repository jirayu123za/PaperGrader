package services

import (
	"os"
	"paperGrader/internal/adapters/response"
	"paperGrader/internal/core/repositories"
	"paperGrader/internal/core/utils"
	"paperGrader/internal/models"
	"path/filepath"
	"strings"

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
	GetColumnsAndDataFromOptionFile(fileBytes []byte) (map[string]interface{}, error)

	GetCoursesByUserID(UserID uuid.UUID) ([]response.CoursesResponse, error)
	GetCourseByCourseID(CourseID uuid.UUID) (*response.CourseResponse, error)

	GetInsAssignmentByCourseID(CourseID uuid.UUID) ([]response.InsAssignmentResponse, error)
	GetAssignmentsByCourseID(CourseID uuid.UUID) ([]response.AssignmentsResponse, error)
	GetActiveAssignmentsByCourseID(CourseID uuid.UUID) ([]response.AssignmentActiveResponse, error)
	GetAssignmentSettingsDetail(CourseID uuid.UUID, AssignmentID uuid.UUID) (*response.AssignmentSettingsResponse, error)

	GetInstructorsNameByCourseID(courseID uuid.UUID) ([]response.InstructorListResponse, error)

	CreateSubmissionFiles(submission []models.Submission) error
	CreateSubmissionAFile(submissionFile *models.Submission) error
	UpdateSubmissionList(SubmissionID uuid.UUID, AssignmentID uuid.UUID, PersonalDataID uuid.UUID, MatchedBy string) error
	GetSubmissionFiles(AssignmentID uuid.UUID) ([]response.SubmissionFilesResponse, error)
	GetSubmissionListByCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.SubmissionResponse, error)
	GetSubmissionFileURL(CourseID uuid.UUID, AssignmentID uuid.UUID, SubmissionID uuid.UUID) (submissionFileURL string, err error)
	// Part: 1
	GetSubmissionsList(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.SubmissionsListResponse, error)
	GetProcessOCRForSubmissions(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.SubmissionsOCRData, error)
	GetMapSubmissionFileURLs(submissionBoxFiles map[uuid.UUID][]string, courseID, assignmentID uuid.UUID) map[uuid.UUID][]string
	GetStudentListForSubmission(CourseID uuid.UUID, AssignmentID uuid.UUID) (response.StudentSubmissionSplitResponse, error)
	GetAssignmentTemplateCount(CourseID uuid.UUID, AssignmentID uuid.UUID) (int, error)

	//!
	CreateCroppedSubmissionBox(submission models.SubmissionBox) error

	//! OCR Services
	GetStudentsListForOCR(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.StudentListForOCRResponse, error)
	GetBoundingBoxesByAssignmentTemplate(AssignmentID uuid.UUID) ([]response.BoundingBoxTemplateResponse, error)
	GetBoundingBoxesType(AssignmentID uuid.UUID) ([]response.SubmissionBoxPositionResponse, error)

	// Bounding Boxes Services
	CreateBoundingBoxesNameAndID(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox) error
	CreateBoundingBoxesQuestions(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox, rubricData []response.RubricQuestion) error
	UpdateBoundingBoxesNameAndID(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox) error
	UpdateBoundingBoxesQuestions(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox, rubricData []response.RubricQuestion) error
	DeleteBoundingBoxes(AssignmentID uuid.UUID, boundingBoxIDs []uuid.UUID) error

	// CRUD Questions
	GetQuestionsByAssignmentTemplate(AssignmentID uuid.UUID) (response.QuestionsTemplateResponse, error)

	// CRUD Rubric
	// CreateRubric(AssignmentID uuid.UUID, rubric *models.Rubric) error
	// GetRubricData(AssignmentID uuid.UUID) ([]response.RubricDataResp, error)
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

func (s *InstructorServiceImpl) GetColumnsAndDataFromOptionFile(fileBytes []byte) (map[string]interface{}, error) {
	columnsAndData, err := s.repo.FindColumnsAndDataFromOptionFile(fileBytes)
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

func (s *InstructorServiceImpl) GetAssignmentSettingsDetail(CourseID uuid.UUID, AssignmentID uuid.UUID) (*response.AssignmentSettingsResponse, error) {
	assignmentSections, err := s.repo.FindAssignmentSettingsDetail(CourseID, AssignmentID)
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

func (s *InstructorServiceImpl) CreateSubmissionFiles(submission []models.Submission) error {
	if err := s.repo.AddSubmissionFiles(submission); err != nil {
		return err
	}
	return nil
}

func (s *InstructorServiceImpl) CreateSubmissionAFile(submissionFile *models.Submission) error {
	if err := s.repo.AddSubmissionAFile(submissionFile); err != nil {
		return err
	}
	return nil
}

func (s *InstructorServiceImpl) UpdateSubmissionList(SubmissionID uuid.UUID, AssignmentID uuid.UUID, PersonalDataID uuid.UUID, MatchedBy string) error {
	if err := s.repo.ModifySubmissionList(SubmissionID, AssignmentID, PersonalDataID, MatchedBy); err != nil {
		return err
	}
	return nil
}

func (s *InstructorServiceImpl) GetSubmissionFiles(AssignmentID uuid.UUID) ([]response.SubmissionFilesResponse, error) {
	submissionFiles, err := s.repo.FindSubmissionFiles(AssignmentID)
	if err != nil {
		return nil, err
	}
	return submissionFiles, nil
}

func (s *InstructorServiceImpl) GetSubmissionListByCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.SubmissionResponse, error) {
	submissionList, err := s.repo.FindSubmissionListByCourseIDAndAssignmentID(CourseID, AssignmentID)
	if err != nil {
		return nil, err
	}
	return submissionList, nil
}

func (s *InstructorServiceImpl) GetSubmissionFileURL(CourseID uuid.UUID, AssignmentID uuid.UUID, SubmissionID uuid.UUID) (submissionFileURL string, err error) {
	fileName, err := s.repo.FindSubmissionFileName(AssignmentID, SubmissionID)
	if err != nil {
		return "", err
	}

	fileURL, err := s.minioRepo.FindFileFromMinIO(CourseID.String(), AssignmentID.String(), fileName)
	if err != nil {
		return "", err
	}
	return fileURL, nil
}

func (s *InstructorServiceImpl) GetStudentListForSubmission(courseID uuid.UUID, assignmentID uuid.UUID) (response.StudentSubmissionSplitResponse, error) {
	allStudents, err := s.repo.FindStudentListForSubmission(courseID, assignmentID)
	if err != nil {
		return response.StudentSubmissionSplitResponse{}, err
	}
	return allStudents, nil
}

func (s *InstructorServiceImpl) GetAssignmentTemplateCount(CourseID uuid.UUID, AssignmentID uuid.UUID) (int, error) {
	templateName, err := s.repo.FindAssignmentTemplateName(AssignmentID)
	if err != nil {
		return 0, err
	}

	templateCount, err := s.minioRepo.FindTemplatePageCountFromMinIO(CourseID.String(), AssignmentID.String(), templateName)
	if err != nil {
		return 0, err
	}

	return templateCount, nil
}

func (s *InstructorServiceImpl) CreateCroppedSubmissionBox(submission models.SubmissionBox) error {
	if err := s.repo.ADDCroppedSubmissionBox(submission); err != nil {
		return err
	}
	return nil
}

// OCR Services implementation
// Part: 1
func (s *InstructorServiceImpl) GetSubmissionsList(courseID uuid.UUID, assignmentID uuid.UUID) ([]response.SubmissionsListResponse, error) {
	submissions, err := s.repo.FindSubmissionsList(courseID, assignmentID)
	if err != nil {
		return nil, err
	}

	submissionIDs := make([]uuid.UUID, 0, len(submissions))
	for _, sub := range submissions {
		submissionIDs = append(submissionIDs, sub.SubmissionID)
	}

	submissionBoxFiles, err := s.repo.FindSubmissionBoxBySubmissionID(submissionIDs)
	if err != nil {
		return nil, err
	}

	submissionFileURLMap := s.GetMapSubmissionFileURLs(submissionBoxFiles, courseID, assignmentID)

	result := make([]response.SubmissionsListResponse, 0, len(submissions))
	for _, sub := range submissions {
		var urlFileName, urlFileID string

		if urls, ok := submissionFileURLMap[sub.SubmissionID]; ok && len(urls) >= 2 {
			urlFileName = urls[0]
			urlFileID = urls[1]
		}

		result = append(result, response.SubmissionsListResponse{
			SubmissionID:   sub.SubmissionID,
			SectionName:    sub.SectionName,
			FullName:       sub.FullName,
			StudentCode:    sub.StudentCode,
			HasAssigned:    sub.HasAssigned,
			MatchedBy:      sub.MatchedBy,
			SubmittedAt:    sub.SubmittedAt,
			PersonalDataID: sub.PersonalDataID,
			URLFileName:    urlFileName,
			URLFileID:      urlFileID,
		})
	}
	return result, nil
}

func (s *InstructorServiceImpl) GetMapSubmissionFileURLs(submissionBoxFiles map[uuid.UUID][]string, courseID, assignmentID uuid.UUID) map[uuid.UUID][]string {
	urlMap := make(map[uuid.UUID][]string)

	for subID, fileNames := range submissionBoxFiles {
		var urls []string
		for _, fileName := range fileNames {
			url, err := s.minioRepo.FindFileURLSubmissionBoxes(courseID.String(), assignmentID.String(), fileName)
			if err != nil {
				continue
			}
			urls = append(urls, url)
		}
		urlMap[subID] = urls
	}
	return urlMap
}

func (s *InstructorServiceImpl) GetStudentsListForOCR(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.StudentListForOCRResponse, error) {
	students, err := s.repo.FindStudentsListForOCR(CourseID, AssignmentID)
	if err != nil {
		return nil, err
	}
	return students, nil
}

// Part: 2
func (s *InstructorServiceImpl) GetProcessOCRForSubmissions(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.SubmissionsOCRData, error) {
	threshold := 0.80

	// Business logic to process OCR for submissions
	// First, get students list for OCR
	students, err := s.repo.FindStudentsListForOCR(CourseID, AssignmentID)
	if err != nil {
		return nil, err
	}

	// Second, get submission boxes for OCR
	submissionBoxes, err := s.repo.FindSubmissionBoxesForOCR(AssignmentID)
	if err != nil {
		return nil, err
	}

	tempBaseDir := filepath.Join(os.TempDir(), "PDFstore")
	if err := os.MkdirAll(tempBaseDir, os.ModePerm); err != nil {
		return nil, err
	}
	defer os.RemoveAll(tempBaseDir)

	var results []response.SubmissionsOCRData
	for _, submission := range submissionBoxes {
		var ocrName, ocrCode string

		submissionDir := filepath.Join(tempBaseDir, submission.SubmissionID.String())
		if err := os.MkdirAll(submissionDir, os.ModePerm); err != nil {
			return nil, err
		}

		for _, fileName := range submission.SubmissionBoxFileName {
			url, err := s.minioRepo.FindFileURLSubmissionBoxes(CourseID.String(), AssignmentID.String(), fileName)
			if err != nil {
				continue
			}

			baseName := filepath.Base(fileName)
			tempFilePath := filepath.Join(submissionDir, baseName)
			if err := utils.DownloadFileFromURL(url, tempFilePath); err != nil {
				continue
			}

			lower := strings.ToLower(tempFilePath)

			if strings.Contains(lower, "name") {
				text, err := utils.PerformOCRThaiText(tempFilePath)
				if err != nil {
					continue
				}
				ocrName = text
			} else if strings.Contains(lower, "id") {
				text, err := utils.PerformOCRDigitsOnly(tempFilePath)
				if err != nil {
					continue
				}
				ocrCode = text
			}
		}

		match := utils.MatchOCRWithStudentList(ocrName, ocrCode, students, threshold)
		isMatch := match.Similarity >= threshold

		if isMatch && match.MatchedPersonalDataID != nil {
			if err := s.repo.ModifySubmissionList(submission.SubmissionID, AssignmentID, *match.MatchedPersonalDataID, "auto"); err != nil {
				return nil, err
			}
			students = utils.RemoveMatchedStudent(students, *match.MatchedPersonalDataID)
		} else {
			results = append(results, response.SubmissionsOCRData{
				SubmissionID:   submission.SubmissionID,
				IsMatch:        isMatch,
				PersonalDataID: match.MatchedPersonalDataID,
				BestMatchName:  match.BestMatchName,
				BestMatchID:    match.BestMatchStudentCode,
				Similarity:     match.Similarity,
			})
		}
	}
	return results, nil
}

func (s *InstructorServiceImpl) GetBoundingBoxesByAssignmentTemplate(AssignmentID uuid.UUID) ([]response.BoundingBoxTemplateResponse, error) {
	boundingBoxes, err := s.repo.FindBoundingBoxesByAssignmentTemplate(AssignmentID)
	if err != nil {
		return nil, err
	}
	return boundingBoxes, nil
}

func (s *InstructorServiceImpl) GetBoundingBoxesType(AssignmentID uuid.UUID) ([]response.SubmissionBoxPositionResponse, error) {
	boundingBoxes, err := s.repo.FindBoundingBoxesType(AssignmentID)
	if err != nil {
		return nil, err
	}
	return boundingBoxes, nil
}

func (s *InstructorServiceImpl) CreateBoundingBoxesNameAndID(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox) error {
	if err := s.repo.AddBoundingBoxesQuestions(AssignmentID, boundingBoxes, nil); err != nil {
		return err
	}
	return nil
}

func (s *InstructorServiceImpl) CreateBoundingBoxesQuestions(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox, rubricQuestion []response.RubricQuestion) error {
	if err := s.repo.AddBoundingBoxesQuestions(AssignmentID, boundingBoxes, rubricQuestion); err != nil {
		return err
	}
	return nil
}

func (s *InstructorServiceImpl) UpdateBoundingBoxesNameAndID(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox) error {
	if err := s.repo.ModifyBoundingBoxesNameAndID(AssignmentID, boundingBoxes); err != nil {
		return err
	}
	return nil
}

func (s *InstructorServiceImpl) UpdateBoundingBoxesQuestions(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox, rubricData []response.RubricQuestion) error {
	if err := s.repo.ModifyBoundingBoxesQuestions(AssignmentID, boundingBoxes, rubricData); err != nil {
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

func (s *InstructorServiceImpl) GetQuestionsByAssignmentTemplate(AssignmentID uuid.UUID) (response.QuestionsTemplateResponse, error) {
	questions, err := s.repo.FindQuestionsByAssignmentTemplate(AssignmentID)
	if err != nil {
		return response.QuestionsTemplateResponse{}, err
	}
	return questions, nil
}

// func (s *InstructorServiceImpl) CreateRubric(AssignmentID uuid.UUID, rubric *models.Rubric) error {
// 	if err := s.repo.AddRubric(AssignmentID, rubric); err != nil {
// 		return err
// 	}
// 	return nil
// }

// func (s *InstructorServiceImpl) GetRubricData(AssignmentID uuid.UUID) ([]response.RubricDataResp, error) {
// 	rubricData, err := s.repo.FindRubricData(AssignmentID)
// 	if err != nil {
// 		return nil, err
// 	}
// 	return []response.RubricDataResp{rubricData}, nil
// }
