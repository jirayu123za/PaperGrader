package services

import (
	"encoding/json"
	"fmt"
	"os"
	"paperGrader/internal/adapters/response"
	"paperGrader/internal/core/repositories"
	"paperGrader/internal/core/utils"
	"paperGrader/internal/models"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

// Primary port
type InstructorService interface {
	// CRUD operations for Assignments
	CreateAssignment(CourseID uuid.UUID, assignment *models.Assignment) error
	CreateAssignmentWithFiles(request response.CreateAssignmentRequest) (response.CreateAssignmentResponse, error)
	CreateAssignmentFile(file *models.AssignmentFile) error

	GetAssignmentNameTemplate(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileName string, err error)
	GetPDFTemplateWithURL(CourseID uuid.UUID, AssignmentID uuid.UUID) (templateURL string, err error)
	GetFileFormSubmission(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileNames []string, fileURLs []string, err error)

	UpdateAssignmentSetting(CourseID uuid.UUID, AssignmentID uuid.UUID, assignment *models.Assignment) error
	UpdateAssignmentTimeSettings(CourseID uuid.UUID, AssignmentID uuid.UUID, sections []models.AssignmentSection) error
	UpdateAssignmentPublishedGrade(CourseID uuid.UUID, payload response.UpdateAssignmentPublishedGradeRequest) error
	UpdateAssignmentPublishedAssignment(CourseID uuid.UUID, payload response.UpdateAssignmentPublishedAssignmentRequest) error

	// CRUD operations for Roster
	GetRosterByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)
	GetRosterSectionByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error)
	GetRosterByCourseIDAndSectionID(CourseID uuid.UUID, SectionID uuid.UUID) ([]map[string]interface{}, error)
	GetPersonalDataByIDAndCourseID(PersonalDataID uuid.UUID, CourseID uuid.UUID) ([]map[string]interface{}, error)

	CreateSingleUserRoster(courseID uuid.UUID, payload response.CreateSingleRosterRequest) error
	CreateMultipleUserRoster(courseID uuid.UUID, payload response.CreateMultipleRosterRequest) error
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
	CreateSubmissionFileByInstructor(submissionFile *models.Submission) error
	UpdateSubmissionList(SubmissionID uuid.UUID, AssignmentID uuid.UUID, PersonalDataID uuid.UUID, MatchedBy string) error
	GetSubmissionFiles(AssignmentID uuid.UUID) ([]response.SubmissionFilesResponse, error)
	GetSubmissionListByCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.SubmissionResponse, error)
	GetSubmissionFileURL(CourseID uuid.UUID, AssignmentID uuid.UUID, SubmissionID uuid.UUID) (submissionFileURL string, err error)
	// Part 1:
	GetSubmissionsList(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.SubmissionsListResponse, error)
	GetProcessOCRForSubmissions(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.SubmissionsOCRData, error)
	GetMapSubmissionFileURLs(submissionBoxFiles map[uuid.UUID][]string, courseID, assignmentID uuid.UUID) map[uuid.UUID][]string
	GetStudentListForSubmission(CourseID uuid.UUID, AssignmentID uuid.UUID) (response.StudentSubmissionSplitResponse, error)
	GetAssignmentTemplateCount(CourseID uuid.UUID, AssignmentID uuid.UUID) (int, error)

	// Left side bar Services
	GetProcessLeftSideBarData(CourseID uuid.UUID, AssignmentID uuid.UUID) (map[string]interface{}, error)

	//!
	CreateCroppedSubmissionBox(submission models.SubmissionBox) error

	// OCR Services
	GetStudentsListForOCR(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.StudentListForOCRResponse, error)
	GetBoundingBoxesByAssignmentTemplate(AssignmentID uuid.UUID) ([]response.BoundingBoxTemplateResponse, error)
	GetBoundingBoxesType(AssignmentID uuid.UUID) ([]response.BoundingBoxDataResponse, error)

	// R total submission ids
	GetTotalSubmissionIDsByHasGrade(AssignmentID uuid.UUID) ([]response.TotalSubmissionIDs, error)

	// Bounding Boxes Services
	CreateBoundingBoxesNameAndID(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox) error
	CreateBoundingBoxesQuestions(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox, rubricData []response.RubricQuestion) error
	UpdateBoundingBoxesNameAndID(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox) error
	UpdateBoundingBoxesQuestions(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox, rubricData []response.RubricQuestion) error
	DeleteBoundingBoxes(AssignmentID uuid.UUID, boundingBoxIDs []uuid.UUID) error

	// CRUD Questions
	GetQuestionsByAssignmentTemplate(AssignmentID uuid.UUID) (response.QuestionsTemplateResponse, error)
	GetQuestionsList(AssignmentID uuid.UUID) (response.QuestionsListResponse, error)
	GetNoSubmittedQuestionsList(AssignmentID uuid.UUID) (response.MixedQuestionsList, error)

	// Part 1: CRUD Rubric
	CreateRubricData(assignment_id uuid.UUID, rubricData response.CreateRubricRequest) error
	UpdateRubricData(assignmentID uuid.UUID, rubricData response.UpdateRubricRequest) error
	UpdateRubricIndexes(assignmentID uuid.UUID, rubricData response.UpdateRubricIndexesRequest) error
	DeleteRubricData(assignmentID uuid.UUID, rubricData response.DeleteRubricRequest) error
	GetRubricData(AssignmentID uuid.UUID, QuestionID uuid.UUID, SubQuestionID *uuid.UUID) (response.RubricResponse, error)
	// Part 2: U Rubric
	UpdateRubricSetting(assignmentID uuid.UUID, rubricData response.UpdateRubricSettingRequest) error
	UpdateRubricScoreBounds(assignmentID uuid.UUID, rubricData response.UpdateRubricScoreBoundsRequest) error
	// Part 3: R Rubric
	GetRubricAfterGraded(assignmentID uuid.UUID, submissionID uuid.UUID, questionID uuid.UUID, subQuestionID *uuid.UUID) (response.RubricResponse, error)

	// Part 1: Grade
	CreateGrade(assignmentID uuid.UUID, submissionID uuid.UUID, request response.CreateGradeRequest, userID uuid.UUID) error
	// R Submission from question
	GetSubmissionsFromQuestion(courseID uuid.UUID, assignmentID uuid.UUID, questionID uuid.UUID, subQuestionID *uuid.UUID) ([]response.SubmissionsFromQuestionResponse, error)
	// R question title
	GetQuestionTitleAndQuestionPoint(assignmentID uuid.UUID, questionID uuid.UUID, subQuestionID *uuid.UUID) (response.QuestionTitleAndQuestionPointResponse, error)

	// R Bounding Boxes data
	GetBoundingBoxesData(AssignmentID uuid.UUID) (response.BoundingBoxesDataResponse, error)

	// Part 1: Export data
	GetAssignmentsListForExport(CourseID uuid.UUID) ([]response.AssignmentsListResponse, error)
	// CreateGradesToExcelFile(request response.CreateGradeToExcelFileRequest, courseID uuid.UUID) error

	// Part:1 Assignment statistics
	GetStatisticsDataBySelectAssignment(request response.GetAssignmentStatisticsRequest, courseID uuid.UUID) (response.AssignmentStatisticsResponse, error)
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

// Service to create a new assignment
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

// New services create assignment with files
func (s *InstructorServiceImpl) CreateAssignmentWithFiles(request response.CreateAssignmentRequest) (response.CreateAssignmentResponse, error) {
	var response response.CreateAssignmentResponse

	course, err := s.courseRepo.FindCourseByID(request.CourseID)
	if err != nil {
		return response, fmt.Errorf("course not found: %w", err)
	}

	assignment := models.Assignment{
		CourseID:              course.CourseID,
		AssignmentName:        request.AssignmentName,
		AssignmentDescription: request.AssignmentDescription,
		SubmittedBy:           request.SubmittedBy,
	}
	if err := s.repo.AddAssignment(request.CourseID, &assignment); err != nil {
		return response, err
	}

	response.Assignment = assignment
	var assignmentSections []models.AssignmentSection
	for _, sectionName := range request.SectionNames {
		sectionName = strings.TrimSpace(sectionName)
		section, found, err := s.sectionRepo.FindSectionByCourseIDAndSectionName(request.CourseID, sectionName)
		if err != nil {
			return response, err
		}
		var secID uuid.UUID
		if found {
			secID = section.SectionID
		} else {
			newSection := models.Section{
				CourseID:    request.CourseID,
				SectionName: sectionName,
			}

			if err := s.sectionRepo.AddSections(&newSection); err != nil {
				return response, fmt.Errorf("create section failed: %w", err)
			}
			secID = newSection.SectionID
		}
		assignmentSections = append(assignmentSections, models.AssignmentSection{
			AssignmentID: assignment.AssignmentID,
			SectionID:    secID,
		})
	}
	response.AssignmentSections = assignmentSections

	var assignmentFiles []models.AssignmentFile
	var uploads []models.Upload
	for i, fileHeader := range request.Files {
		assignmentFile := models.AssignmentFile{
			AssignmentID:       assignment.AssignmentID,
			AssignmentFileName: fileHeader.Filename,
			IsTemplate:         request.IsTemplateFlags[i],
		}
		if err := s.repo.AddAssignmentFile(&assignmentFile); err != nil {
			return response, fmt.Errorf("create assignment file failed: %w", err)
		}

		upload := models.Upload{
			UserID:           request.UserID,
			AssignmentFileID: assignmentFile.AssignmentFileID,
			CreatedAt:        time.Now(),
		}
		uploads = append(uploads, upload)
		assignmentFiles = append(assignmentFiles, assignmentFile)

		fileContent, err := fileHeader.Open()
		if err != nil {
			return response, fmt.Errorf("open file failed: %w", err)
		}
		defer fileContent.Close()

		if err := s.minioRepo.AddFileToMinIO(fileContent, request.CourseID.String(), assignment.AssignmentID.String(), fileHeader.Filename); err != nil {
			return response, fmt.Errorf("upload to MinIO failed: %w", err)
		}
	}
	response.AssignmentFiles = assignmentFiles
	response.Uploads = uploads

	if err := s.repo.AddAssignmentWithFiles(request.CourseID, &assignment, assignmentFiles, uploads, assignmentSections); err != nil {
		return response, fmt.Errorf("final db save failed: %w", err)
	}

	return response, nil
}

func (s *InstructorServiceImpl) CreateAssignmentFile(file *models.AssignmentFile) error {
	return s.repo.AddAssignmentFile(file)
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

func (s *InstructorServiceImpl) GetProcessLeftSideBarData(CourseID uuid.UUID, AssignmentID uuid.UUID) (map[string]interface{}, error) {
	assignment, err := s.repo.FindProcessLeftSideBarData(CourseID, AssignmentID)
	if err != nil {
		return nil, err
	}
	return assignment, nil
}

func (s *InstructorServiceImpl) UpdateAssignmentSetting(CourseID uuid.UUID, AssignmentID uuid.UUID, assignment *models.Assignment) error {
	return s.repo.ModifyAssignmentSetting(CourseID, AssignmentID, assignment)
}

func (s *InstructorServiceImpl) UpdateAssignmentTimeSettings(CourseID uuid.UUID, AssignmentID uuid.UUID, sections []models.AssignmentSection) error {
	return s.repo.ModifyAssignmentTimeSettings(CourseID, AssignmentID, sections)
}

func (s *InstructorServiceImpl) UpdateAssignmentPublishedGrade(CourseID uuid.UUID, payload response.UpdateAssignmentPublishedGradeRequest) error {
	return s.repo.ModifyAssignmentGradePublished(CourseID, payload)
}

func (s *InstructorServiceImpl) UpdateAssignmentPublishedAssignment(CourseID uuid.UUID, payload response.UpdateAssignmentPublishedAssignmentRequest) error {
	return s.repo.ModifyAssignmentPublishedAssignment(CourseID, payload)
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

// Service to create a single user roster
func (s *InstructorServiceImpl) CreateSingleUserRoster(courseID uuid.UUID, payload response.CreateSingleRosterRequest) error {
	var sectionIDs []uuid.UUID

	if payload.RoleType != "INSTRUCTOR" && payload.RoleType != "TA" {
		if payload.Sections == "" {
			return fmt.Errorf("sections cannot be empty for student role")
		}

		sectionsSplit := strings.Split(payload.Sections, ",")
		for _, sectionName := range sectionsSplit {
			sectionName = strings.TrimSpace(sectionName)
			if sectionName == "" {
				continue
			}

			section, found, err := s.sectionRepo.FindSectionByCourseIDAndSectionName(courseID, sectionName)
			if err != nil {
				return err
			}

			if !found {
				newSection := models.Section{
					CourseID:    courseID,
					SectionName: sectionName,
				}
				if err := s.sectionRepo.AddSections(&newSection); err != nil {
					return err
				}
				sectionIDs = append(sectionIDs, newSection.SectionID)
			} else {
				sectionIDs = append(sectionIDs, section.SectionID)
			}
		}
	} else {
		sectionIDs = append(sectionIDs, uuid.Nil)
	}

	personalData := models.PersonalData{
		StudentCode: payload.StudentCode,
		FirstName:   payload.FirstName,
		LastName:    payload.LastName,
		Email:       payload.Email,
		RoleType:    payload.RoleType,
	}

	for _, sectionID := range sectionIDs {
		var sectionIDPtr *uuid.UUID
		if sectionID != uuid.Nil {
			sectionIDPtr = &sectionID
		}

		enrollment := models.EnrollmentList{
			CourseID:  courseID,
			SectionID: sectionIDPtr,
		}

		if err := s.repo.AddSingleUserRoster(&personalData, &enrollment); err != nil {
			return err
		}
	}
	return nil
}

// Service to create multiple user roster
func (s *InstructorServiceImpl) CreateMultipleUserRoster(courseID uuid.UUID, payload response.CreateMultipleRosterRequest) error {
	if len(payload.FirstName) == 0 || len(payload.LastName) == 0 || len(payload.Email) == 0 {
		return fmt.Errorf("Missing required fields: FirstName, LastName, or Email")
	}

	if len(payload.FirstName) != len(payload.LastName) || len(payload.FirstName) != len(payload.Email) || len(payload.FirstName) != len(payload.Section) {
		return fmt.Errorf("FirstName, LastName, Email, and Section must have the same length")
	}

	var personalDataList []models.PersonalData
	var enrollmentList []models.EnrollmentList
	for i := range payload.FirstName {
		var sectionIDPtr *uuid.UUID

		if payload.RoleType != "INSTRUCTOR" && payload.RoleType != "TA" {
			sectionName := payload.Section[i]
			if sectionName == "" {
				return fmt.Errorf("section cannot be empty for student role")
			}

			if sectionName != "" {
				section, found, err := s.sectionRepo.FindSectionByCourseIDAndSectionName(courseID, sectionName)
				if err != nil {
					return err
				}

				if !found {
					newSection := models.Section{
						CourseID:    courseID,
						SectionName: sectionName,
					}
					if err := s.sectionRepo.AddSections(&newSection); err != nil {
						return err
					}
					sectionID := newSection.SectionID
					sectionIDPtr = &sectionID
				} else {
					sectionID := section.SectionID
					sectionIDPtr = &sectionID
				}
			}
		}

		if payload.RoleType == "INSTRUCTOR" || payload.RoleType == "TA" {
			sectionIDPtr = nil
		}

		var studentCodePtr *string
		if payload.StudentCode[i] != "" {
			studentCodePtr = &payload.StudentCode[i]
		}

		personal := models.PersonalData{
			StudentCode: studentCodePtr,
			FirstName:   payload.FirstName[i],
			LastName:    payload.LastName[i],
			Email:       payload.Email[i],
			RoleType:    payload.RoleType,
		}

		enrollment := models.EnrollmentList{
			CourseID:  courseID,
			SectionID: sectionIDPtr,
		}

		personalDataList = append(personalDataList, personal)
		enrollmentList = append(enrollmentList, enrollment)
	}
	return s.repo.AddMultipleUserRoster(personalDataList, enrollmentList)
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

func (s *InstructorServiceImpl) CreateSubmissionFileByInstructor(submissionFile *models.Submission) error {
	if err := s.repo.AddSubmissionFileByInstructor(submissionFile); err != nil {
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
	// defer os.RemoveAll(tempBaseDir)

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
				// text, err := utils.PerformOCRThaiText(tempFilePath)
				text, err := utils.PerformOCREngText(tempFilePath)
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

func (s *InstructorServiceImpl) GetBoundingBoxesType(AssignmentID uuid.UUID) ([]response.BoundingBoxDataResponse, error) {
	boundingBoxes, err := s.repo.FindBoundingBoxesType(AssignmentID)
	if err != nil {
		return nil, err
	}
	return boundingBoxes, nil
}

// Get total submission IDs by has grade
func (s *InstructorServiceImpl) GetTotalSubmissionIDsByHasGrade(AssignmentID uuid.UUID) ([]response.TotalSubmissionIDs, error) {
	submissionIDs, err := s.repo.FindTotalSubmissionIDsByHasGrade(AssignmentID)
	if err != nil {
		return nil, err
	}
	return submissionIDs, nil
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
	rubricMap, err := s.repo.FindRubricDataByAssignmentID(AssignmentID)
	if err != nil {
		return err
	}

	mergedRubricData := utils.MergeRubricsFromMap(rubricData, rubricMap)

	if err := s.repo.ModifyBoundingBoxesQuestions(AssignmentID, boundingBoxes, mergedRubricData); err != nil {
		return err
	}
	return nil
}

func (s *InstructorServiceImpl) DeleteBoundingBoxes(AssignmentID uuid.UUID, boundingBoxIDs []uuid.UUID) error {
	if err := s.repo.RemoveBoundingBoxes(AssignmentID, boundingBoxIDs); err != nil {
		return err
	}

	rubricMap, err := s.repo.FindRubricDataByAssignmentID(AssignmentID)
	if err != nil {
		return err
	}

	if rubricMap == nil {
		return nil
	}

	prunedJSON, changed, err := utils.PruneRubricByBoundingBoxes(rubricMap, boundingBoxIDs)
	if err != nil {
		return err
	}

	if !changed {
		return nil
	}

	// Marshal and update to DB
	updatedJSON, err := json.Marshal(prunedJSON)
	if err != nil {
		return err
	}

	if err := s.repo.ModifyRubricDataOrHardDelete(AssignmentID, updatedJSON); err != nil {
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

func (s *InstructorServiceImpl) GetQuestionsList(AssignmentID uuid.UUID) (response.QuestionsListResponse, error) {
	questions, err := s.repo.FindQuestionsList(AssignmentID)
	if err != nil {
		return nil, err
	}
	return questions, nil
}

func (s *InstructorServiceImpl) GetNoSubmittedQuestionsList(AssignmentID uuid.UUID) (response.MixedQuestionsList, error) {
	noSubmittedQuestions, err := s.repo.FindNoSubmittedQuestionsList(AssignmentID)
	if err != nil {
		return nil, err
	}
	return noSubmittedQuestions, nil
}

func (s *InstructorServiceImpl) CreateRubricData(assignmentID uuid.UUID, rubricData response.CreateRubricRequest) error {
	// Step 1: Create rubric object
	rubricID := uuid.New()

	var details []map[string]interface{}
	for _, d := range rubricData.Rubric.RubricDetails {
		point := 0
		if d.RubricPoint != nil {
			point = *d.RubricPoint
		}
		desc := ""
		if d.RubricDescription != nil {
			desc = *d.RubricDescription
		}

		detail := map[string]interface{}{
			"rubric_detail_id":   uuid.New(),
			"rubric_point":       point,
			"rubric_description": desc,
			"has_selected":       false,
		}
		details = append(details, detail)
	}

	rubricObject := map[string]interface{}{
		"rubric_id":      rubricID,
		"rubric_setting": rubricData.Rubric.RubricSetting,
		"has_ceiling":    false,
		"has_floor":      false,
		"rubric_details": details,
	}

	rubricBytes, err := json.Marshal(rubricObject)
	if err != nil {
		return err
	}

	// Step 2: Save rubric to rubric template table
	if rubricData.SubQuestionID != nil {
		if err := s.repo.AddRubricToSubQuestion(assignmentID, rubricData.QuestionID, *rubricData.SubQuestionID, rubricBytes); err != nil {
			return err
		}
	} else {
		if err := s.repo.AddRubricToMainQuestion(assignmentID, rubricData.QuestionID, rubricBytes); err != nil {
			return err
		}
	}

	// Step 3: If assignment already has submission, copy rubric data to grade data only has grade data
	subMissionIDs, err := s.repo.FindSubmissionIDsByAssignmentID(assignmentID)
	if err != nil {
		return err
	}

	for _, subMissionID := range subMissionIDs {
		if rubricData.SubQuestionID != nil {
			if err := s.repo.AddRubricToSubQuestionInGrade(assignmentID, subMissionID, rubricData.QuestionID, *rubricData.SubQuestionID, rubricBytes); err != nil {
				return err
			}
		} else {
			if err := s.repo.AddRubricToMainQuestionInGrade(assignmentID, subMissionID, rubricData.QuestionID, rubricBytes); err != nil {
				return err
			}
		}
	}
	return nil
}

func (s *InstructorServiceImpl) UpdateRubricData(assignmentID uuid.UUID, rubricData response.UpdateRubricRequest) error {
	// First: call repo get rubric data by assignmentID and questionID
	rubricMap, err := s.repo.FindRubricDataByAssignmentID(assignmentID)
	if err != nil {
		return err
	}

	questionsData, ok := rubricMap["questions_data"].([]interface{})
	if !ok {
		return err
	}

	for _, q := range questionsData {
		qMap := q.(map[string]interface{})
		if qMap["question_id"] == rubricData.QuestionID.String() {
			var rubricTarget map[string]interface{}

			// Sub-question rubric
			if rubricData.SubQuestionID != nil {
				subQs, ok := qMap["sub_questions"].([]interface{})
				if !ok {
					return err
				}
				for _, sq := range subQs {
					sqMap := sq.(map[string]interface{})
					if sqMap["sub_question_id"] == rubricData.SubQuestionID.String() {
						if rubrics, ok := sqMap["rubrics"].(map[string]interface{}); ok {
							rubricTarget = rubrics
						}
					}
				}
			} else {
				// Main question rubric
				if rubrics, ok := qMap["rubrics"].(map[string]interface{}); ok {
					rubricTarget = rubrics
				}
			}

			// Update rubric_detail match rubric_detail_id
			if rubricTarget != nil && rubricTarget["rubric_id"] == rubricData.Rubric.RubricID {
				details, ok := rubricTarget["rubric_details"].([]interface{})
				if !ok {
					return err
				}

			FOUND:
				for _, d := range details {
					detailMap := d.(map[string]interface{})
					currentID := fmt.Sprintf("%v", detailMap["rubric_detail_id"])

					for _, incomingDetail := range rubricData.Rubric.RubricData {
						if currentID == incomingDetail.RubricDetailID {
							detailMap["rubric_point"] = incomingDetail.RubricPoint
							detailMap["rubric_description"] = incomingDetail.RubricDescription
							break FOUND
						}

					}
				}

			}
		}
	}

	// Marshal and update to DB
	updatedJSON, err := json.Marshal(rubricMap)
	if err != nil {
		return err
	}

	if err := s.repo.ModifyRubricData(assignmentID, updatedJSON); err != nil {
		return err
	}

	// Second: If assignment already has submission, copy rubric data to grade data only has grade data
	subMissionIDs, err := s.repo.FindSubmissionIDsByAssignmentID(assignmentID)
	if err != nil {
		return err
	}

	for _, subMissionID := range subMissionIDs {
		exists, err := s.repo.FindExistingGradeData(assignmentID, subMissionID)
		if err != nil {
			return err
		}
		if !exists {
			continue
		}

		gradeData, err := s.repo.FindGradeData(assignmentID, subMissionID)
		if err != nil {
			return err
		}

		questionsData, ok := gradeData["questions_data"].([]interface{})
		if !ok {
			return err
		}

		for _, q := range questionsData {
			qMap := q.(map[string]interface{})
			if qMap["question_id"] == rubricData.QuestionID.String() {
				var rubricTarget map[string]interface{}

				// Sub-question rubric
				if rubricData.SubQuestionID != nil {
					subQs, ok := qMap["sub_questions"].([]interface{})
					if !ok {
						return err
					}
					for _, sq := range subQs {
						sqMap := sq.(map[string]interface{})
						if sqMap["sub_question_id"] == rubricData.SubQuestionID.String() {
							if rubrics, ok := sqMap["rubrics"].(map[string]interface{}); ok {
								rubricTarget = rubrics
							}
						}
					}
				} else {
					// Main question rubric
					if rubrics, ok := qMap["rubrics"].(map[string]interface{}); ok {
						rubricTarget = rubrics
					}
				}

				// Update rubric_detail match rubric_detail_id
				if rubricTarget != nil && rubricTarget["rubric_id"] == rubricData.Rubric.RubricID {
					details, ok := rubricTarget["rubric_details"].([]interface{})
					if !ok {
						return err
					}

				UPDATED:
					for _, d := range details {
						detailMap := d.(map[string]interface{})
						currentID := fmt.Sprintf("%v", detailMap["rubric_detail_id"])

						for _, incomingDetail := range rubricData.Rubric.RubricData {
							if currentID == incomingDetail.RubricDetailID {
								detailMap["rubric_point"] = incomingDetail.RubricPoint
								detailMap["rubric_description"] = incomingDetail.RubricDescription
								break UPDATED
							}

						}
					}

				}
			}
		}

		// Marshal and update to DB
		updatedJSON, err := json.Marshal(gradeData)
		if err != nil {
			return err
		}

		if err := s.repo.ModifyGradeData(assignmentID, subMissionID, updatedJSON); err != nil {
			return err
		}
	}
	return nil
}

func (s *InstructorServiceImpl) UpdateRubricIndexes(assignmentID uuid.UUID, rubricData response.UpdateRubricIndexesRequest) error {
	// First: call repo get rubric data by assignmentID and questionID
	rubricMap, err := s.repo.FindRubricDataByAssignmentID(assignmentID)
	if err != nil {
		return err
	}

	questionsData, ok := rubricMap["questions_data"].([]interface{})
	if !ok {
		return err
	}

	// business logic to update rubric indexes
	for _, q := range questionsData {
		qMap := q.(map[string]interface{})

		if qMap["question_id"] == rubricData.QuestionID.String() {
			if rubricData.SubQuestionID != nil {
				subQs, ok := qMap["sub_questions"].([]interface{})
				if !ok {
					return err
				}

				for _, sq := range subQs {
					sqMap := sq.(map[string]interface{})
					if sqMap["sub_question_id"] == rubricData.SubQuestionID.String() {

						rubricObj, ok := sqMap["rubrics"].(map[string]interface{})
						if !ok {
							rubricObj = make(map[string]interface{})
							sqMap["rubrics"] = rubricObj
						}

						rubricObj["rubric_id"] = rubricData.Rubric.RubricID

						var newDetails []map[string]interface{}
						for _, d := range rubricData.Rubric.RubricData {
							newDetails = append(newDetails, map[string]interface{}{
								"rubric_detail_id":   d.RubricDetailID,
								"rubric_point":       d.RubricPoint,
								"rubric_description": d.RubricDescription,
								"has_selected":       d.HasSelected,
							})
						}
						rubricObj["rubric_details"] = newDetails
						break
					}
				}
			} else {
				rubricObj, ok := qMap["rubrics"].(map[string]interface{})
				if !ok {
					rubricObj = make(map[string]interface{})
					qMap["rubrics"] = rubricObj
				}

				rubricObj["rubric_id"] = rubricData.Rubric.RubricID

				var newDetails []map[string]interface{}
				for _, d := range rubricData.Rubric.RubricData {
					newDetails = append(newDetails, map[string]interface{}{
						"rubric_detail_id":   d.RubricDetailID,
						"rubric_point":       d.RubricPoint,
						"rubric_description": d.RubricDescription,
						"has_selected":       d.HasSelected,
					})
				}
				rubricObj["rubric_details"] = newDetails
			}
			break
		}
	}

	// Marshal and update to DB
	updatedJSON, err := json.Marshal(rubricMap)
	if err != nil {
		return err
	}

	if err := s.repo.ModifyRubricData(assignmentID, updatedJSON); err != nil {
		return err
	}

	// Second: If assignment already has submission, copy rubric data to grade data only has grade data
	subMissionIDs, err := s.repo.FindSubmissionIDsByAssignmentID(assignmentID)
	if err != nil {
		return err
	}

	for _, subMissionID := range subMissionIDs {
		exists, err := s.repo.FindExistingGradeData(assignmentID, subMissionID)
		if err != nil {
			return err
		}

		if !exists {
			continue
		}

		gradeData, err := s.repo.FindGradeData(assignmentID, subMissionID)
		if err != nil {
			return err
		}

		questionsData, ok := gradeData["questions_data"].([]interface{})
		if !ok {
			return err
		}

		for _, q := range questionsData {
			qMap := q.(map[string]interface{})

			if qMap["question_id"] == rubricData.QuestionID.String() {
				if rubricData.SubQuestionID != nil {
					subQs, ok := qMap["sub_questions"].([]interface{})
					if !ok {
						return err
					}

					for _, sq := range subQs {
						sqMap := sq.(map[string]interface{})
						if sqMap["sub_question_id"] == rubricData.SubQuestionID.String() {

							rubricObj, ok := sqMap["rubrics"].(map[string]interface{})
							if !ok {
								rubricObj = make(map[string]interface{})
								sqMap["rubrics"] = rubricObj
							}

							existingSelected := map[string]bool{}
							if oldArr, ok := rubricObj["rubric_details"].([]interface{}); ok {
								for _, v := range oldArr {
									if m, ok := v.(map[string]interface{}); ok {
										id := fmt.Sprintf("%v", m["rubric_detail_id"])
										if sel, ok := m["has_selected"].(bool); ok {
											existingSelected[id] = sel
										}
									}
								}
							}

							newDetails := make([]map[string]interface{}, 0, len(rubricData.Rubric.RubricData))
							for _, d := range rubricData.Rubric.RubricData {
								sel := d.HasSelected
								if prev, ok := existingSelected[d.RubricDetailID]; ok {
									sel = prev
								}
								newDetails = append(newDetails, map[string]interface{}{
									"rubric_detail_id":   d.RubricDetailID,
									"rubric_point":       d.RubricPoint,
									"rubric_description": d.RubricDescription,
									"has_selected":       sel,
								})
							}
							rubricObj["rubric_id"] = rubricData.Rubric.RubricID
							rubricObj["rubric_details"] = newDetails
							break
						}
					}
				} else {
					rubricObj, ok := qMap["rubrics"].(map[string]interface{})
					if !ok {
						rubricObj = make(map[string]interface{})
						qMap["rubrics"] = rubricObj
					}

					existingSelected := map[string]bool{}
					if oldArr, ok := rubricObj["rubric_details"].([]interface{}); ok {
						for _, v := range oldArr {
							if m, ok := v.(map[string]interface{}); ok {
								id := fmt.Sprintf("%v", m["rubric_detail_id"])
								if sel, ok := m["has_selected"].(bool); ok {
									existingSelected[id] = sel
								}
							}
						}
					}

					newDetails := make([]map[string]interface{}, 0, len(rubricData.Rubric.RubricData))
					for _, d := range rubricData.Rubric.RubricData {
						sel := d.HasSelected
						if prev, ok := existingSelected[d.RubricDetailID]; ok {
							sel = prev
						}
						newDetails = append(newDetails, map[string]interface{}{
							"rubric_detail_id":   d.RubricDetailID,
							"rubric_point":       d.RubricPoint,
							"rubric_description": d.RubricDescription,
							"has_selected":       sel,
						})
					}
					rubricObj["rubric_id"] = rubricData.Rubric.RubricID
					rubricObj["rubric_details"] = newDetails
				}
				break
			}
		}

		updatedJSON, err := json.Marshal(gradeData)
		if err != nil {
			return err
		}

		if err := s.repo.ModifyGradeData(assignmentID, subMissionID, updatedJSON); err != nil {
			return err
		}
	}

	return nil
}

func (s *InstructorServiceImpl) DeleteRubricData(assignmentID uuid.UUID, rubricData response.DeleteRubricRequest) error {
	// First: call repo get rubric data by assignmentID and questionID
	rubricMap, err := s.repo.FindRubricDataByAssignmentID(assignmentID)
	if err != nil {
		return err
	}

	questionsData, ok := rubricMap["questions_data"].([]interface{})
	if !ok {
		return err
	}

	for _, q := range questionsData {
		qMap := q.(map[string]interface{})
		if qMap["question_id"] == rubricData.QuestionID.String() {

			if rubricData.SubQuestionID != nil {
				subQs, ok := qMap["sub_questions"].([]interface{})
				if !ok {
					return err
				}

				for _, sq := range subQs {
					sqMap := sq.(map[string]interface{})
					if sqMap["sub_question_id"] == rubricData.SubQuestionID.String() {
						rubrics, ok := sqMap["rubrics"].(map[string]interface{})
						if !ok || rubrics["rubric_id"] != rubricData.RubricID {
							continue
						}

						details, ok := rubrics["rubric_details"].([]interface{})
						if !ok {
							continue
						}

						var updatedDetails []interface{}
						for _, d := range details {
							if d == nil {
								continue
							}
							detailMap := d.(map[string]interface{})
							currentID := fmt.Sprintf("%v", detailMap["rubric_detail_id"])
							if currentID != rubricData.RubricDetailID {
								updatedDetails = append(updatedDetails, detailMap)
							}
						}

						if len(updatedDetails) == 0 {
							delete(sqMap, "rubrics")
						} else {
							rubrics["rubric_details"] = updatedDetails
						}
					}
				}
			} else {
				rubrics, ok := qMap["rubrics"].(map[string]interface{})
				if !ok || rubrics["rubric_id"] != rubricData.RubricID {
					continue
				}

				details, ok := rubrics["rubric_details"].([]interface{})
				if !ok {
					continue
				}

				var updatedDetails []interface{}
				for _, d := range details {
					if d == nil {
						continue
					}
					detailMap := d.(map[string]interface{})
					currentID := fmt.Sprintf("%v", detailMap["rubric_detail_id"])
					if currentID != rubricData.RubricDetailID {
						updatedDetails = append(updatedDetails, detailMap)
					}
				}

				if len(updatedDetails) == 0 {
					delete(qMap, "rubrics")
				} else {
					rubrics["rubric_details"] = updatedDetails
				}
			}
		}
	}

	// Marshal and update to
	updatedJSON, err := json.Marshal(rubricMap)
	if err != nil {
		return err
	}

	if err := s.repo.ModifyRubricData(assignmentID, updatedJSON); err != nil {
		return err
	}

	// Second: If assignment already has submission, copy rubric data to grade data only has grade data
	subMissionIDs, err := s.repo.FindSubmissionIDsByAssignmentID(assignmentID)
	if err != nil {
		return err
	}

	// Third: If assignment has submissions, copy rubric data to each submission
	for _, subMissionID := range subMissionIDs {
		exists, err := s.repo.FindExistingGradeData(assignmentID, subMissionID)
		if err != nil {
			return err
		}

		if !exists {
			continue
		}

		gradeData, err := s.repo.FindGradeData(assignmentID, subMissionID)
		if err != nil {
			return err
		}

		questionsData, ok := gradeData["questions_data"].([]interface{})
		if !ok {
			return err
		}

		for _, q := range questionsData {
			qMap := q.(map[string]interface{})
			if qMap["question_id"] == rubricData.QuestionID.String() {

				if rubricData.SubQuestionID != nil {
					subQs, ok := qMap["sub_questions"].([]interface{})
					if !ok {
						return err
					}

					for _, sq := range subQs {
						sqMap := sq.(map[string]interface{})
						if sqMap["sub_question_id"] == rubricData.SubQuestionID.String() {
							rubrics, ok := sqMap["rubrics"].(map[string]interface{})
							if !ok || rubrics["rubric_id"] != rubricData.RubricID {
								continue
							}

							details, ok := rubrics["rubric_details"].([]interface{})
							if !ok {
								continue
							}

							var updatedDetails []interface{}
							for _, d := range details {
								if d == nil {
									continue
								}
								detailMap := d.(map[string]interface{})
								currentID := fmt.Sprintf("%v", detailMap["rubric_detail_id"])
								if currentID != rubricData.RubricDetailID {
									updatedDetails = append(updatedDetails, detailMap)
								}
							}

							if len(updatedDetails) == 0 {
								delete(sqMap, "rubrics")
							} else {
								rubrics["rubric_details"] = updatedDetails
							}
						}
					}
				} else {
					rubrics, ok := qMap["rubrics"].(map[string]interface{})
					if !ok || rubrics["rubric_id"] != rubricData.RubricID {
						continue
					}

					details, ok := rubrics["rubric_details"].([]interface{})
					if !ok {
						continue
					}

					var updatedDetails []interface{}
					for _, d := range details {
						if d == nil {
							continue
						}
						detailMap := d.(map[string]interface{})
						currentID := fmt.Sprintf("%v", detailMap["rubric_detail_id"])
						if currentID != rubricData.RubricDetailID {
							updatedDetails = append(updatedDetails, detailMap)
						}
					}

					if len(updatedDetails) == 0 {
						delete(qMap, "rubrics")
					} else {
						rubrics["rubric_details"] = updatedDetails
					}
				}
			}
		}

		updatedJSON, err := json.Marshal(gradeData)
		if err != nil {
			return err
		}

		if err := s.repo.ModifyGradeData(assignmentID, subMissionID, updatedJSON); err != nil {
			return err
		}
	}

	return nil
}

// Query
func (s *InstructorServiceImpl) GetRubricData(AssignmentID uuid.UUID, QuestionID uuid.UUID, SubQuestionID *uuid.UUID) (response.RubricResponse, error) {
	if SubQuestionID != nil {
		return s.repo.FindRubricBySubQuestionID(AssignmentID, QuestionID, SubQuestionID)
	}
	return s.repo.FindRubricByQuestionID(AssignmentID, QuestionID)
}

// Update Rubric Setting
func (s *InstructorServiceImpl) UpdateRubricSetting(assignmentID uuid.UUID, rubricData response.UpdateRubricSettingRequest) error {
	// First: call repo get rubric data by assignmentID and questionID
	rubricMap, err := s.repo.FindRubricDataByAssignmentID(assignmentID)
	if err != nil {
		return err
	}

	questionsData, ok := rubricMap["questions_data"].([]interface{})
	if !ok {
		return err
	}

	for _, q := range questionsData {
		qMap := q.(map[string]interface{})
		if qMap["question_id"] == rubricData.QuestionID.String() {
			if rubricData.SubQuestionID != nil {
				subQs, ok := qMap["sub_questions"].([]interface{})
				if !ok {
					return err
				}

				for _, sq := range subQs {
					sqMap := sq.(map[string]interface{})
					if sqMap["sub_question_id"] == rubricData.SubQuestionID.String() {
						if rubrics, ok := sqMap["rubrics"].(map[string]interface{}); ok {
							if rubrics["rubric_id"] == rubricData.Rubric.RubricID {
								rubrics["rubric_setting"] = rubricData.Rubric.RubricSetting
							}
						}
					}
				}
			} else {
				if rubrics, ok := qMap["rubrics"].(map[string]interface{}); ok {
					if rubrics["rubric_id"] == rubricData.Rubric.RubricID {
						rubrics["rubric_setting"] = rubricData.Rubric.RubricSetting
					}
				}
			}
		}
	}

	// Marshal and update to DB
	updatedJSON, err := json.Marshal(rubricMap)
	if err != nil {
		return err
	}

	if err := s.repo.ModifyRubricData(assignmentID, updatedJSON); err != nil {
		return err
	}

	submissionIDs, err := s.repo.FindSubmissionIDsByAssignmentID(assignmentID)
	if err != nil {
		return err
	}

	for _, submissionID := range submissionIDs {
		exists, err := s.repo.FindExistingGradeData(assignmentID, submissionID)
		if err != nil {
			return err
		}
		if !exists {
			continue
		}

		gradeMap, err := s.repo.FindGradeData(assignmentID, submissionID)
		if err != nil {
			return err
		}

		for _, q := range gradeMap["questions_data"].([]interface{}) {
			qMap, ok := q.(map[string]interface{})
			if !ok {
				continue
			}
			if fmt.Sprintf("%v", qMap["question_id"]) != rubricData.QuestionID.String() {
				continue
			}

			if rubricData.SubQuestionID != nil {
				subQs, ok := qMap["sub_questions"].([]interface{})
				if !ok {
					return fmt.Errorf("sub_questions not found or wrong type in grade_data")
				}
				for _, sq := range subQs {
					sqMap, ok := sq.(map[string]interface{})
					if !ok {
						continue
					}
					if fmt.Sprintf("%v", sqMap["sub_question_id"]) != rubricData.SubQuestionID.String() {
						continue
					}
					if rubrics, ok := sqMap["rubrics"].(map[string]interface{}); ok {
						if fmt.Sprintf("%v", rubrics["rubric_id"]) == rubricData.Rubric.RubricID {
							rubrics["rubric_setting"] = rubricData.Rubric.RubricSetting
						}
					}
				}
			} else {
				if rubrics, ok := qMap["rubrics"].(map[string]interface{}); ok {
					if fmt.Sprintf("%v", rubrics["rubric_id"]) == rubricData.Rubric.RubricID {
						rubrics["rubric_setting"] = rubricData.Rubric.RubricSetting
					}
				}
			}
		}

		updatedGradeJSON, err := json.Marshal(gradeMap)
		if err != nil {
			return err
		}
		if err := s.repo.ModifyGradeData(assignmentID, submissionID, updatedGradeJSON); err != nil {
			return err
		}
	}

	return nil
}

// Update rubric score bounds (Ceiling and Floor)
func (s *InstructorServiceImpl) UpdateRubricScoreBounds(assignmentID uuid.UUID, rubricData response.UpdateRubricScoreBoundsRequest) error {
	// First: call repo get rubric data by assignmentID and questionID
	rubricMap, err := s.repo.FindRubricDataByAssignmentID(assignmentID)
	if err != nil {
		return err
	}

	questionsData, ok := rubricMap["questions_data"].([]interface{})
	if !ok {
		return err
	}

	for _, q := range questionsData {
		qMap := q.(map[string]interface{})
		if qMap["question_id"] == rubricData.QuestionID.String() {
			if rubricData.SubQuestionID != nil {
				subQs, ok := qMap["sub_questions"].([]interface{})
				if !ok {
					return err
				}

				for _, sq := range subQs {
					sqMap := sq.(map[string]interface{})
					if sqMap["sub_question_id"] == rubricData.SubQuestionID.String() {
						if rubrics, ok := sqMap["rubrics"].(map[string]interface{}); ok {
							if rubrics["rubric_id"] == rubricData.Rubric.RubricID {
								rubrics["has_ceiling"] = rubricData.Rubric.HasCeiling
								rubrics["has_floor"] = rubricData.Rubric.HasFloor
							}
						}
					}
				}
			} else {
				if rubrics, ok := qMap["rubrics"].(map[string]interface{}); ok {
					if rubrics["rubric_id"] == rubricData.Rubric.RubricID {
						rubrics["has_ceiling"] = rubricData.Rubric.HasCeiling
						rubrics["has_floor"] = rubricData.Rubric.HasFloor
					}
				}
			}
		}
	}

	// Marshal and update to DB
	updatedJSON, err := json.Marshal(rubricMap)
	if err != nil {
		return err
	}

	if err := s.repo.ModifyRubricData(assignmentID, updatedJSON); err != nil {
		return err
	}

	submissionIDs, err := s.repo.FindSubmissionIDsByAssignmentID(assignmentID)
	if err != nil {
		return err
	}

	for _, submissionID := range submissionIDs {
		exists, err := s.repo.FindExistingGradeData(assignmentID, submissionID)
		if err != nil {
			return err
		}
		if !exists {
			continue
		}

		gradeMap, err := s.repo.FindGradeData(assignmentID, submissionID)
		if err != nil {
			return err
		}

		gq, ok := gradeMap["questions_data"].([]interface{})
		if !ok {
			return fmt.Errorf("questions_data not found or wrong type in grade_data")
		}

		for _, q := range gq {
			qMap, ok := q.(map[string]interface{})
			if !ok {
				continue
			}
			if fmt.Sprintf("%v", qMap["question_id"]) != rubricData.QuestionID.String() {
				continue
			}

			if rubricData.SubQuestionID != nil {
				subQs, ok := qMap["sub_questions"].([]interface{})
				if !ok {
					return fmt.Errorf("sub_questions not found or wrong type in grade_data")
				}
				for _, sq := range subQs {
					sqMap, ok := sq.(map[string]interface{})
					if !ok {
						continue
					}
					if fmt.Sprintf("%v", sqMap["sub_question_id"]) != rubricData.SubQuestionID.String() {
						continue
					}
					if rubrics, ok := sqMap["rubrics"].(map[string]interface{}); ok {
						if fmt.Sprintf("%v", rubrics["rubric_id"]) == rubricData.Rubric.RubricID {
							rubrics["has_ceiling"] = rubricData.Rubric.HasCeiling
							rubrics["has_floor"] = rubricData.Rubric.HasFloor
						}
					}
				}
			} else {
				if rubrics, ok := qMap["rubrics"].(map[string]interface{}); ok {
					if fmt.Sprintf("%v", rubrics["rubric_id"]) == rubricData.Rubric.RubricID {
						rubrics["has_ceiling"] = rubricData.Rubric.HasCeiling
						rubrics["has_floor"] = rubricData.Rubric.HasFloor
					}
				}
			}
		}

		updatedGradeJSON, err := json.Marshal(gradeMap)
		if err != nil {
			return err
		}
		if err := s.repo.ModifyGradeData(assignmentID, submissionID, updatedGradeJSON); err != nil {
			return err
		}
	}

	return nil
}

// Get rubric after graded
func (s *InstructorServiceImpl) GetRubricAfterGraded(assignmentID uuid.UUID, submissionID uuid.UUID, questionID uuid.UUID, subQuestionID *uuid.UUID) (response.RubricResponse, error) {
	rubric, err := s.repo.FindRubricAfterGraded(assignmentID, submissionID, questionID, subQuestionID)
	if err != nil {
		return response.RubricResponse{}, err
	}
	return rubric, nil
}

// Submission from question
func (s *InstructorServiceImpl) GetSubmissionsFromQuestion(courseID uuid.UUID, assignmentID uuid.UUID, questionID uuid.UUID, subQuestionID *uuid.UUID) ([]response.SubmissionsFromQuestionResponse, error) {
	submissions, err := s.repo.FindSubmissionsFromQuestion(courseID, assignmentID, questionID, subQuestionID)
	if err != nil {
		return nil, err
	}
	return submissions, nil
}

// Get Question Title
func (s *InstructorServiceImpl) GetQuestionTitleAndQuestionPoint(assignmentID uuid.UUID, questionID uuid.UUID, subQuestionID *uuid.UUID) (response.QuestionTitleAndQuestionPointResponse, error) {
	result, err := s.repo.FindQuestionTitleAndQuestionPoint(assignmentID, questionID, subQuestionID)
	if err != nil {
		return response.QuestionTitleAndQuestionPointResponse{}, err
	}
	return result, nil
}

// Get Bounding Boxes data
func (s *InstructorServiceImpl) GetBoundingBoxesData(AssignmentID uuid.UUID) (response.BoundingBoxesDataResponse, error) {
	boundingBoxes, err := s.repo.FindBoundingBoxesData(AssignmentID)
	if err != nil {
		return response.BoundingBoxesDataResponse{}, err
	}
	return boundingBoxes, nil
}

// Create Grade
func (s *InstructorServiceImpl) CreateGrade(assignmentID uuid.UUID, submissionID uuid.UUID, request response.CreateGradeRequest, userID uuid.UUID) error {
	// 1. Check if grade_data already exists
	exists, err := s.repo.FindExistingGradeData(assignmentID, submissionID)
	if err != nil {
		return err
	}

	// 2. Find rubric data by assignmentID, one time only
	rubricData, err := s.repo.FindRubricDataByAssignmentID(assignmentID)
	if err != nil {
		return err
	}

	var gradeData map[string]interface{}
	if !exists {
		gradeData = rubricData
	} else {
		gradeData, err = s.repo.FindGradeData(assignmentID, submissionID)
		if err != nil {
			return err
		}
	}

	// Helper function to update rubric selection
	// 5. Update gradeData (select the rubric_detail by id and set has_selected = true)
	if err := utils.UpdateRubricSelection(gradeData, request, userID); err != nil {
		return err
	}

	// 6. Marshal to JSON
	jsonData, err := json.Marshal(gradeData)
	if err != nil {
		return err
	}

	// 7. Save to DB
	if exists {
		return s.repo.ModifyGradeData(assignmentID, submissionID, json.RawMessage(jsonData))
	} else {
		return s.repo.AddGradeData(assignmentID, submissionID, json.RawMessage(jsonData))
	}
}

// Part:1 Export data
func (s *InstructorServiceImpl) GetAssignmentsListForExport(CourseID uuid.UUID) ([]response.AssignmentsListResponse, error) {
	assignments, err := s.repo.FindAssignmentsListForExport(CourseID)
	if err != nil {
		return nil, err
	}
	return assignments, nil
}

// func (s *InstructorServiceImpl) CreateGradesToExcelFile(request response.CreateGradeToExcelFileRequest, courseID uuid.UUID) error {
// 	return nil
// }

// Part:1 Statistics data
func (s *InstructorServiceImpl) GetStatisticsDataBySelectAssignment(request response.GetAssignmentStatisticsRequest, courseID uuid.UUID) (response.AssignmentStatisticsResponse, error) {
	statisticData, err := s.repo.FindStatisticsDataBySelectAssignment(request, courseID)
	if err != nil {
		return response.AssignmentStatisticsResponse{}, err
	}
	return statisticData, nil
}
