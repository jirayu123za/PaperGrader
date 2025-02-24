package adapters

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"paperGrader/internal/core/services"
	"paperGrader/internal/core/utils"
	"paperGrader/internal/models"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Primary adapters
type HttpInstructorHandler struct {
	services        services.InstructorService
	minioServices   services.MinIOService
	sectionServices services.SectionService
}

func NewHttpInstructorHandler(services services.InstructorService, minioServices services.MinIOService, sectionServices services.SectionService) *HttpInstructorHandler {
	return &HttpInstructorHandler{
		services:        services,
		minioServices:   minioServices,
		sectionServices: sectionServices,
	}
}

// News Create assignment to course with Files(FromData)
func (h *HttpInstructorHandler) CreateAssignmentWithFiles(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	userID, err := utils.GetUserIDFromJWT(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid user_id in JWT",
			"error":   err.Error(),
		})
	}

	assignmentName := c.FormValue("assignment_name")
	assignmentDescription := c.FormValue("assignment_description")
	submissBy := c.FormValue("submiss_by")

	assignment := models.Assignment{
		CourseID:              courseID,
		AssignmentName:        assignmentName,
		AssignmentDescription: assignmentDescription,
		SubmissBy:             submissBy,
	}

	if err := h.services.CreateAssignment(courseID, &assignment); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create assignment",
			"error":   err.Error(),
		})
	}

	var sectionIDs []uuid.UUID
	sectionsName := c.FormValue("sections")
	if sectionsName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "sections name cannot be empty",
		})
	}

	sectionsSplit := strings.Split(sectionsName, ",")
	for _, sectionName := range sectionsSplit {
		sectionName = strings.TrimSpace(sectionName)
		if sectionName == "" {
			continue
		}

		var section models.Section

		err := h.sectionServices.GetSectionByCourseAndName(courseID, sectionName, &section)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				newSection := models.Section{
					CourseID:    courseID,
					SectionName: sectionName,
				}
				if err := h.sectionServices.CreateSections(&newSection); err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"message": "Failed to create section",
						"error":   err.Error(),
					})
				}
				sectionIDs = append(sectionIDs, newSection.SectionID)
			} else {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"message": "Failed to query section",
					"error":   err.Error(),
				})
			}
		} else {
			sectionIDs = append(sectionIDs, section.SectionID)
		}
	}

	var assignmentSections []models.AssignmentSection
	for _, secID := range sectionIDs {
		assignmentSection := models.AssignmentSection{
			SectionID: secID,
		}
		assignmentSections = append(assignmentSections, assignmentSection)
	}

	// Handle files uploaded
	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Failed to parse form data",
		})
	}

	files := form.File["files"]
	if len(files) == 0 {
		return c.Status(400).JSON(fiber.Map{
			"error": "No files uploaded",
		})
	}

	var assignmentFiles []models.AssignmentFile
	var uploads []models.Upload
	for i, file := range files {
		isTemplateStr := c.FormValue(fmt.Sprintf("is_template[%d]", i))
		isTemplate, err := strconv.ParseBool(isTemplateStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Invalid is_template value",
				"error":   err.Error(),
			})
		}

		assignmentFile := models.AssignmentFile{
			AssignmentFileName: file.Filename,
			AssignmentID:       assignment.AssignmentID,
			IsTemplate:         isTemplate,
		}

		if err := h.services.CreateAssignmentFile(&assignmentFile); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to save assignment file",
				"error":   err.Error(),
			})
		}

		upload := models.Upload{
			UserID:           userID,
			AssignmentFileID: assignmentFile.AssignmentFileID,
			CreatedAt:        time.Now(),
		}

		assignmentFiles = append(assignmentFiles, assignmentFile)
		uploads = append(uploads, upload)

		// structure folder bucket -> course_id -> assignment_id -> file name(version)
		fileContent, err := file.Open()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to open file",
				"error":   err.Error(),
			})
		}
		defer fileContent.Close()

		if err := h.minioServices.CreateFileToMinIO(fileContent, courseID.String(), assignment.AssignmentID.String(), file.Filename); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to save the file",
				"error":   err.Error(),
			})
		}
	}

	if err := h.services.CreateAssignmentWithFiles(courseID, &assignment, assignmentFiles, uploads, assignmentSections); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create assignment and save files",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":            "Assignment was created and files saved to bucket",
		"assignment":         assignment,
		"assignment_file":    assignmentFiles,
		"upload":             uploads,
		"assignment_section": assignmentSections,
	})
}

func (h *HttpInstructorHandler) UpdateAssignmentAndAssignmentSection(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	assignmentName := c.FormValue("assignment_name")
	assignmentDescription := c.FormValue("assignment_description")
	submissBy := c.FormValue("submiss_by")
	gradingType := c.FormValue("grading_type")
	lateSubmissStr := c.FormValue("allowLateSubmissions")
	lateSubmiss, err := strconv.ParseBool(lateSubmissStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid allowLateSubmission value",
			"error":   err.Error(),
		})
	}
	groupSubmissStr := c.FormValue("enableGroupSubmission")
	groupSubmiss, err := strconv.ParseBool(groupSubmissStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid enableGroupSubmission value",
			"error":   err.Error(),
		})
	}
	publishGradesStr := c.FormValue("published")
	publishGrades, err := strconv.ParseBool(publishGradesStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid published value",
			"error":   err.Error(),
		})
	}
	regradesStr := c.FormValue("enableRegrades")
	regrades, err := strconv.ParseBool(regradesStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid enableRegrades value",
			"error":   err.Error(),
		})
	}

	assignment := models.Assignment{
		AssignmentName:        assignmentName,
		AssignmentDescription: assignmentDescription,
		SubmissBy:             submissBy,
		GradingType:           gradingType,
		LateSubmiss:           lateSubmiss,
		GroupSubmiss:          groupSubmiss,
		Published:             publishGrades,
		Regrades:              regrades,
	}

	sectionsData := c.FormValue("sections")
	var sectionsIDs []uuid.UUID
	if err := json.Unmarshal([]byte(sectionsData), &sectionsIDs); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid sections format",
			"error":   err.Error(),
		})
	}

	releaseDateStr := c.FormValue("releaseDate")
	releaseDate, err := utils.ParseDate(releaseDateStr, time.RFC3339)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid release_date format",
			"error":   err.Error(),
		})
	}

	dueDateStr := c.FormValue("dueDate")
	dueDate, err := utils.ParseDate(dueDateStr, time.RFC3339)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid due_date format",
			"error":   err.Error(),
		})
	}

	cutOffDateStr := c.FormValue("cutOffDate")
	cutOffDate, err := utils.ParseDate(cutOffDateStr, time.RFC3339)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid cut_off_date format",
			"error":   err.Error(),
		})
	}

	fmt.Printf("Received ReleaseDate: %s\n", c.FormValue("releaseDate"))
	fmt.Printf("Received DueDate: %s\n", c.FormValue("dueDate"))
	fmt.Printf("Received CutOffDate: %s\n", c.FormValue("cutOffDate"))

	var sections []models.AssignmentSection
	for _, sectionID := range sectionsIDs {
		sections = append(sections, models.AssignmentSection{
			SectionID:   sectionID,
			ReleaseDate: releaseDate,
			DueDate:     dueDate,
			CutOffDate:  cutOffDate,
		})
	}

	for _, section := range sections {
		fmt.Printf("Section ID: %v, ReleaseDate: %v, DueDate: %v, CutOffDate: %v\n",
			section.SectionID, section.ReleaseDate, section.DueDate, section.CutOffDate)
	}

	if err := h.services.UpdateAssignmentAndAssignmentSection(courseID, assignmentID, &assignment, sections); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to update assignment and sections",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Assignment and sections were updated successfully",
	})
}

func (h *HttpInstructorHandler) GetPDFTemplateWithURL(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	templateURL, err := h.services.GetPDFTemplateWithURL(courseID, assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get template URL",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Template URL is retrieved",
		"url":     templateURL,
	})
}

// !
func (h *HttpInstructorHandler) GetFileFormSubmission(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	fileNames, fileURLs, err := h.services.GetFileFormSubmission(courseID, assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get files",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Files are retrieved",
		"files":   fileNames,
		"urls":    fileURLs,
	})
}

func (h *HttpInstructorHandler) GetAssignmentDetails(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	assignment_details, err := h.services.GetAssignmentDetails(courseID, assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get assignment details",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":            "Assignment details are retrieved",
		"assignment_details": assignment_details,
	})
}

// handler Get instructors and students by course id
func (h *HttpInstructorHandler) GetRosterByCourseID(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	users, err := h.services.GetRosterByCourseID(courseID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get roster",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Roster is retrieved",
		"roster":  users,
	})
}

// handler Get sections by course id
func (h *HttpInstructorHandler) GetRosterSectionByCourseID(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	sections, err := h.services.GetRosterSectionByCourseID(courseID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get sections",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":  "Sections are retrieved",
		"sections": sections,
	})
}

func (h *HttpInstructorHandler) GetRosterByCourseIDAndSectionID(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	sectionIDParam := c.Query("section_id")
	sectionID, err := uuid.Parse(sectionIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid section_id",
			"error":   err.Error(),
		})
	}

	users, err := h.services.GetRosterByCourseIDAndSectionID(courseID, sectionID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get roster",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Roster of section is retrieved",
		"roster":  users,
	})
}

func (h *HttpInstructorHandler) GetPersonalDataByIDAndCourseID(c *fiber.Ctx) error {
	personalDataIDParam := c.Query("personal_data_id")
	personalDataID, err := uuid.Parse(personalDataIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid personal_data_id",
			"error":   err.Error(),
		})
	}

	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	personalData, err := h.services.GetPersonalDataByIDAndCourseID(personalDataID, courseID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get personal data",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":      "Personal data is retrieved",
		"personalData": personalData,
	})
}

// handler Insert a single user to course
func (h *HttpInstructorHandler) CreateSingleUserRoster(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	roleType := c.FormValue("role_type")
	sectionsName := c.FormValue("sections")

	var sectionIDs []uuid.UUID

	if roleType != "INSTRUCTOR" && roleType != "TA" {
		if sectionsName == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "sections name cannot be empty",
			})
		}

		sectionsSplit := strings.Split(sectionsName, ",")
		for _, sectionName := range sectionsSplit {
			sectionName = strings.TrimSpace(sectionName)
			if sectionName == "" {
				continue
			}

			var section models.Section

			err := h.sectionServices.GetSectionByCourseAndName(courseID, sectionName, &section)
			if err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					newSection := models.Section{
						CourseID:    courseID,
						SectionName: sectionName,
					}
					if err := h.sectionServices.CreateSections(&newSection); err != nil {
						return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
							"message": "Failed to create section",
							"error":   err.Error(),
						})
					}
					sectionIDs = append(sectionIDs, newSection.SectionID)
				} else {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"message": "Failed to query section",
						"error":   err.Error(),
					})
				}
			} else {
				sectionIDs = append(sectionIDs, section.SectionID)
			}
		}
	}

	studentCode := c.FormValue("student_code")
	var studentCodePtr *string
	if studentCode == "" {
		studentCodePtr = nil
	} else {
		studentCodePtr = &studentCode
	}
	firstName := c.FormValue("first_name")
	lastName := c.FormValue("last_name")
	email := c.FormValue("email")

	personalData := models.PersonalData{
		StudentCode: studentCodePtr,
		FirstName:   firstName,
		LastName:    lastName,
		Email:       email,
		RoleType:    roleType,
	}

	if roleType == "INSTRUCTOR" || roleType == "TA" {
		sectionIDs = append(sectionIDs, uuid.Nil)
	}

	for _, sectionID := range sectionIDs {
		var sectionIDPtr *uuid.UUID

		if sectionID != uuid.Nil {
			sectionIDPtr = &sectionID
		} else {
			sectionIDPtr = nil
		}

		enrollment := models.EnrollmentList{
			CourseID:  courseID,
			SectionID: sectionIDPtr,
		}

		if err := h.services.CreateSingleUserRoster(&personalData, &enrollment); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to add user to section",
				"error":   err.Error(),
			})
		}
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "User successfully added to the course",
	})
}

func (h *HttpInstructorHandler) CreateMultipleUserRoster(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	data := c.FormValue("data")
	if data == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Missing 'data' field in the request",
		})
	}

	var inputData struct {
		FirstName   []string `json:"first_name"`
		LastName    []string `json:"last_name"`
		Email       []string `json:"email"`
		StudentCode []string `json:"student_code"`
		Section     []string `json:"section"`
		RoleType    string   `json:"role_type"`
	}

	if err := json.Unmarshal([]byte(data), &inputData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid JSON format in 'data'",
			"error":   err.Error(),
		})
	}

	if len(inputData.FirstName) == 0 || len(inputData.LastName) == 0 || len(inputData.Email) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Missing required fields in 'data'",
		})
	}

	if len(inputData.FirstName) != len(inputData.LastName) || len(inputData.FirstName) != len(inputData.Email) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Inconsistent array lengths in 'data'",
		})
	}

	for i := range inputData.FirstName {
		studentCode := inputData.StudentCode[i]
		sectionName := inputData.Section[i]

		var sectionIDs []uuid.UUID
		if inputData.RoleType != "INSTRUCTOR" && inputData.RoleType != "TA" {
			if sectionName == "" {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"message": "sections name cannot be empty",
				})
			}

			var section models.Section
			err := h.sectionServices.GetSectionByCourseAndName(courseID, sectionName, &section)
			if err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					newSection := models.Section{
						CourseID:    courseID,
						SectionName: sectionName,
					}
					if err := h.sectionServices.CreateSections(&newSection); err != nil {
						return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
							"message": "Failed to create section",
							"error":   err.Error(),
						})
					}
					sectionIDs = append(sectionIDs, newSection.SectionID)
				} else {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"message": "Failed to query section",
						"error":   err.Error(),
					})
				}
			} else {
				sectionIDs = append(sectionIDs, section.SectionID)
			}
		}

		var studentCodePtr *string
		if studentCode == "" {
			studentCodePtr = nil
		} else {
			studentCodePtr = &studentCode
		}

		personalData := models.PersonalData{
			StudentCode: studentCodePtr,
			FirstName:   inputData.FirstName[i],
			LastName:    inputData.LastName[i],
			Email:       inputData.Email[i],
			RoleType:    inputData.RoleType,
		}

		if inputData.RoleType == "INSTRUCTOR" || inputData.RoleType == "TA" {
			sectionIDs = append(sectionIDs, uuid.Nil)
		}

		for _, sectionID := range sectionIDs {
			var sectionIDPtr *uuid.UUID

			if sectionID != uuid.Nil {
				sectionIDPtr = &sectionID
			} else {
				sectionIDPtr = nil
			}

			enrollment := models.EnrollmentList{
				CourseID:  courseID,
				SectionID: sectionIDPtr,
			}

			if err := h.services.CreateSingleUserRoster(&personalData, &enrollment); err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"message": "Failed to add user to section",
					"error":   err.Error(),
				})
			}
		}
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Users successfully added to the course",
	})
}

func (h *HttpInstructorHandler) GetColumnsAndDataFromUploadedFile(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "File is required",
			"error":   err.Error(),
		})
	}

	fileContent, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to open file",
			"error":   err.Error(),
		})
	}
	defer fileContent.Close()

	fileBytes := make([]byte, file.Size)
	_, err = fileContent.Read(fileBytes)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to read file",
			"error":   err.Error(),
		})
	}

	data, err := h.services.GetColumnsAndDataFromUploadedFile(fileBytes)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to process file",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "File data retrieved successfully",
		"result":  data,
	})
}

func (h *HttpInstructorHandler) GetColumnsAndDataFromOptionFile(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "File is required",
			"error":   err.Error(),
		})
	}

	fileContent, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to open file",
			"error":   err.Error(),
		})
	}
	defer fileContent.Close()

	fileBytes := make([]byte, file.Size)
	_, err = fileContent.Read(fileBytes)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to read file",
			"error":   err.Error(),
		})
	}

	data, err := h.services.GetColumnsAndDataFromOptionFile(fileBytes)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to process file",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "File data retrieved successfully",
		"result":  data,
	})
}

func (h *HttpInstructorHandler) GetCoursesByUserID(c *fiber.Ctx) error {
	userID, err := utils.GetUserIDFromJWT(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid user_id in JWT",
			"error":   err.Error(),
		})
	}

	courses, err := h.services.GetCoursesByUserID(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get courses",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Courses are retrieved",
		"courses": courses,
	})
}

func (h *HttpInstructorHandler) GetCourseByCourseID(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	course, err := h.services.GetCourseByCourseID(courseID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get course",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Course is retrieved",
		"course":  course,
	})
}

func (h *HttpInstructorHandler) GetInsAssignmentByCourseID(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	assignments, err := h.services.GetInsAssignmentByCourseID(courseID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get assignments",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":         "Assignments are retrieved",
		"ins_assignments": assignments,
	})
}

func (h *HttpInstructorHandler) GetAssignmentsByCourseID(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	assignments, err := h.services.GetAssignmentsByCourseID(courseID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get assignments",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":     "Assignments are retrieved",
		"assignments": assignments,
	})
}

func (h *HttpInstructorHandler) GetActiveAssignmentsByCourseID(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	activeAssignments, err := h.services.GetActiveAssignmentsByCourseID(courseID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get active assignments",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":            "Active assignments are retrieved",
		"active_assignments": activeAssignments,
	})
}

func (h *HttpInstructorHandler) GetAssignmentByCourseIDAndAssignmentID(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	assignment, err := h.services.GetAssignmentByCourseIDAndAssignmentID(courseID, assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get assignment",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":            "Assignment is retrieved",
		"assignment_setting": assignment,
	})
}

func (h *HttpInstructorHandler) GetInstructorsNameByCourseID(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	instructors, err := h.services.GetInstructorsNameByCourseID(courseID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get instructors",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":     "Instructors are retrieved",
		"instructors": instructors,
	})
}

func (h *HttpInstructorHandler) CreateSubmissionFiles(c *fiber.Ctx) error {
	userID, err := utils.GetUserIDFromJWT(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid user_id in JWT",
			"error":   err.Error(),
		})
	}

	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Failed to get multipart form",
			"error":   err.Error(),
		})
	}

	files := form.File["files"]
	if len(files) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "No files uploaded",
		})
	}

	var submissions []models.Submission
	for _, file := range files {
		versionedFileName := fmt.Sprintf("%s_%s", uuid.New().String(), file.Filename)

		submissions = append(submissions, models.Submission{
			SubmittedBy:        userID,
			BelongsTo:          uuid.NullUUID{UUID: uuid.Nil, Valid: false},
			AssignmentID:       assignmentID,
			SubmissionFileName: versionedFileName,
			SubmittedAt:        time.Now(),
		})

		fileContent, err := file.Open()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to open file",
				"error":   err.Error(),
			})
		}
		defer fileContent.Close()

		if err := h.minioServices.CreateFileToMinIO(fileContent, courseID.String(), assignmentID.String(), versionedFileName); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to upload file",
				"error":   err.Error(),
			})
		}
	}

	if err := h.services.CreateSubmissionFiles(submissions); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create submission files",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Create submissions files is successfully",
	})
}

func (h *HttpInstructorHandler) UpdateSubmissionList(c *fiber.Ctx) error {
	submissionIDParam := c.Query("submission_id")
	submissionID, err := uuid.Parse(submissionIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid submission_id",
			"error":   err.Error(),
		})
	}

	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	personalDataIDParam := c.Query("personal_data_id")
	personalDataID, err := uuid.Parse(personalDataIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid personal_data_id",
			"error":   err.Error(),
		})
	}

	if err := h.services.UpdateSubmissionList(submissionID, assignmentID, personalDataID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to update submission",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Submission is updated",
	})
}

func (h *HttpInstructorHandler) GetSubmissionFiles(c *fiber.Ctx) error {
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	submissions, err := h.services.GetSubmissionFiles(assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get submission files",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":     "Submission files are retrieved",
		"submissions": submissions,
	})
}

func (h *HttpInstructorHandler) GetSubmissionListByCourseIDAndAssignmentID(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	submissions, err := h.services.GetSubmissionListByCourseIDAndAssignmentID(courseID, assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get submission list",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":     "Submission list is retrieved",
		"submissions": submissions,
	})
}

func (h *HttpInstructorHandler) GetSubmissionFileURL(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}
	submissionIDParam := c.Query("submission_id")
	submissionID, err := uuid.Parse(submissionIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid submission_id",
			"error":   err.Error(),
		})
	}

	submissionFileURL, err := h.services.GetSubmissionFileURL(courseID, assignmentID, submissionID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get submission file URL",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":             "Submission file URL is retrieved",
		"submission_file_url": submissionFileURL,
	})
}

func (h *HttpInstructorHandler) GetSubmissionsListForManagement(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	submissionsList, err := h.services.GetSubmissionsListForManagement(courseID, assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get submissions list",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":     "Submissions list is retrieved",
		"submissions": submissionsList,
	})
}

func (h *HttpInstructorHandler) GetStudentListForSubmission(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	students, err := h.services.GetStudentListForSubmission(courseID, assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get student list",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":  "Student list is retrieved",
		"students": students,
	})
}

func (h *HttpInstructorHandler) GetAssignmentTemplateCount(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	pageCount, err := h.services.GetAssignmentTemplateCount(courseID, assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get assignment template count",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Assignment template count is retrieved",
		"page":    pageCount,
	})
}

func (h *HttpInstructorHandler) CreateSubmissionAFile(c *fiber.Ctx) error {
	userID, err := utils.GetUserIDFromJWT(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid user_id in JWT",
			"error":   err.Error(),
		})
	}

	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	pagePerSubmission, err := h.services.GetAssignmentTemplateCount(courseID, assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get assignment template count",
			"error":   err.Error(),
		})
	}

	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Failed to parse form data",
			"error":   err.Error(),
		})
	}

	files := form.File["files"]
	if len(files) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "No files uploaded",
		})
	}

	var submissions []models.Submission

	for _, fileHeader := range files {
		srcFile, err := fileHeader.Open()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to open file",
				"error":   err.Error(),
			})
		}
		defer srcFile.Close()

		tempDir := os.TempDir()
		tempFilePath := filepath.Join(tempDir, fmt.Sprintf("%s.pdf", uuid.New().String()))
		tempFile, err := os.Create(tempFilePath)

		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to create temp file",
				"error":   err.Error(),
			})
		}
		defer os.Remove(tempFilePath)
		defer tempFile.Close()

		_, err = io.Copy(tempFile, srcFile)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to copy file content",
				"error":   err.Error(),
			})
		}

		submissionPageCount, err := utils.GetPDFPageCount(tempFilePath)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to get PDF page count",
				"error":   err.Error(),
			})
		}

		numSubmissions := submissionPageCount / pagePerSubmission
		if submissionPageCount%pagePerSubmission > 0 {
			numSubmissions++
		}

		fileNameWithoutExt := strings.TrimSuffix(fileHeader.Filename, filepath.Ext(fileHeader.Filename))

		for i := 0; i < numSubmissions; i++ {
			startPage := (i * pagePerSubmission) + 1
			endPage := startPage + pagePerSubmission - 1
			if endPage > submissionPageCount {
				endPage = submissionPageCount
			}

			mergedFilePath, err := utils.ExtractPDFPages(tempFilePath, startPage, endPage)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"message": "Failed to process PDF pages",
					"error":   err.Error(),
				})
			}
			defer os.Remove(mergedFilePath)

			mergedFile, err := os.Open(mergedFilePath)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"message": "Failed to open merged PDF file",
					"error":   err.Error(),
				})
			}
			defer mergedFile.Close()

			submissionFileName := fmt.Sprintf("%s_submission_%d%s", fileNameWithoutExt, i+1, filepath.Ext(fileHeader.Filename))

			err = h.minioServices.CreateFileToMinIO(mergedFile, courseID.String(), assignmentID.String(), submissionFileName)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"message": "Failed to upload merged PDF file",
					"error":   err.Error(),
				})
			}

			submissions = append(submissions, models.Submission{
				SubmittedBy:        userID,
				AssignmentID:       assignmentID,
				SubmissionFileName: submissionFileName,
				SubmittedAt:        time.Now(),
			})
		}
	}

	if err := h.services.CreateSubmissionAFile(submissions); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create submission files",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Submission files created successfully",
	})
}

func (h *HttpInstructorHandler) CreateBoundingBoxesAndQuestions(c *fiber.Ctx) error {
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	var request struct {
		BoundingBoxes []struct {
			BoundingBoxPosition string `json:"bounding_box_position"`
			BoundingBoxType     string `json:"bounding_box_type"`
			BoundingBoxPage     uint   `json:"bounding_box_page"`
		} `json:"bounding_boxes"`
		QuestionsData map[string]interface{} `json:"questions_data"`
	}

	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid JSON format",
			"error":   err.Error(),
		})
	}

	var boundingBoxes []models.BoundingBox
	for _, reqBox := range request.BoundingBoxes {
		boundingBox := models.BoundingBox{
			AssignmentID:        assignmentID,
			BoundingBoxPosition: reqBox.BoundingBoxPosition,
			BoundingBoxType:     models.BoundingBoxType(reqBox.BoundingBoxType),
			BoundingBoxPage:     reqBox.BoundingBoxPage,
			BoundingBoxID:       uuid.New(),
		}
		boundingBoxes = append(boundingBoxes, boundingBox)
	}

	if err := h.services.CreateBoundingBoxesAndQuestions(assignmentID, boundingBoxes, request.QuestionsData); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create bounding boxes and questions",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":        "Bounding boxes and questions are created",
		"bounding_boxes": boundingBoxes,
		"questions_data": request.QuestionsData,
	})
}

func (h *HttpInstructorHandler) GetBoundingBoxesByAssignmentTemplate(c *fiber.Ctx) error {
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	boundingBoxes, err := h.services.GetBoundingBoxesByAssignmentTemplate(assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get bounding boxes",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":        "Bounding boxes are retrieved",
		"bounding_boxes": boundingBoxes,
	})
}

func (h *HttpInstructorHandler) UpdateBoundingBoxes(c *fiber.Ctx) error {
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	var request struct {
		BoundingBoxes []struct {
			BoundingBoxPosition string `json:"bounding_box_position"`
			BoundingBoxType     string `json:"bounding_box_type"`
			BoundingBoxPage     uint   `json:"bounding_box_page"`
		} `json:"bounding_boxes"`
	}

	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid JSON format",
			"error":   err.Error(),
		})
	}

	var boundingBoxes []models.BoundingBox
	for _, reqBox := range request.BoundingBoxes {
		boundingBox := models.BoundingBox{
			AssignmentID:        assignmentID,
			BoundingBoxPosition: reqBox.BoundingBoxPosition,
			BoundingBoxType:     models.BoundingBoxType(reqBox.BoundingBoxType),
			BoundingBoxPage:     reqBox.BoundingBoxPage,
		}
		boundingBoxes = append(boundingBoxes, boundingBox)
	}

	if err := h.services.UpdateBoundingBoxes(assignmentID, boundingBoxes); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to update bounding boxes",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":        "Bounding boxes are updated",
		"bounding_boxes": request.BoundingBoxes,
	})
}

func (h *HttpInstructorHandler) DeleteBoundingBoxes(c *fiber.Ctx) error {
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	var boundingBoxIDs []uuid.UUID
	if err := c.BodyParser(&boundingBoxIDs); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid JSON format",
			"error":   err.Error(),
		})
	}

	if err := h.services.DeleteBoundingBoxes(assignmentID, boundingBoxIDs); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to delete bounding boxes",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Bounding boxes are deleted",
	})
}

func (h *HttpInstructorHandler) GetQuestionsByAssignmentTemplate(c *fiber.Ctx) error {
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	questionsResp, err := h.services.GetQuestionsByAssignmentTemplate(assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get questions",
			"error":   err.Error(),
		})
	}

	if questionsResp.RubricID == uuid.Nil {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message":   "No questions found",
			"questions": []interface{}{},
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":   "Questions are retrieved",
		"questions": questionsResp,
	})
}
