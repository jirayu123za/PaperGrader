package adapters

import (
	"encoding/json"
	"errors"
	"fmt"
	"paperGrader/internal/core/services"
	"paperGrader/internal/core/utils"
	"paperGrader/internal/models"
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

	// lateSubmissStr := c.FormValue("late_submiss")
	// lateSubmiss, err := strconv.ParseBool(lateSubmissStr)
	// if err != nil {
	// 	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
	// 		"message": "Invalid value for late_submiss",
	// 		"error":   err.Error(),
	// 	})
	// }

	groupSubmissStr := c.FormValue("group_submiss")
	groupSubmiss, err := strconv.ParseBool(groupSubmissStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid value for group_submiss",
			"error":   err.Error(),
		})
	}

	assignment := models.Assignment{
		CourseID:              courseID,
		AssignmentName:        assignmentName,
		AssignmentDescription: assignmentDescription,
		SubmissBy:             submissBy,
		// LateSubmiss:           lateSubmiss,
		GroupSubmiss: groupSubmiss,
	}

	if err := h.services.CreateAssignment(courseID, &assignment); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create assignment",
			"error":   err.Error(),
		})
	}

	// sectionID, err := h.sectionServices.GetSectionIDsByCourseID(courseID)
	// if err != nil {
	// 	return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
	// 		"message": "Failed to retrieve section_id",
	// 		"error":   err.Error(),
	// 	})
	// }

	sectionIDsParam := c.FormValue("section_id")
	var sectionIDs []uuid.UUID
	if err := json.Unmarshal([]byte(sectionIDsParam), &sectionIDs); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid section_ids format",
			"error":   err.Error(),
		})
	}

	// releaseDateStr := c.FormValue("release_date")
	// dueDateStr := c.FormValue("due_date")

	// releaseDate, err := time.Parse("02/01/2006 15:04", releaseDateStr)
	// if err != nil {
	// 	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
	// 		"message": "Invalid release_date format",
	// 		"error":   err.Error(),
	// 	})
	// }

	// dueDate, err := time.Parse("02/01/2006 15:04", dueDateStr)
	// if err != nil {
	// 	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
	// 		"message": "Invalid due_date format",
	// 		"error":   err.Error(),
	// 	})
	// }

	// var cutOffDate *time.Time
	// if cutOffDateStr := c.FormValue("cut_off_date"); cutOffDateStr != "" {
	// 	parsedCutOffDate, err := time.Parse("02/01/2006 15:04", cutOffDateStr)
	// 	if err != nil {
	// 		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
	// 			"message": "Invalid cut_off_date format",
	// 			"error":   err.Error(),
	// 		})
	// 	}
	// 	cutOffDate = &parsedCutOffDate
	// }

	// var assignmentSections []models.AssignmentSection
	// for _, secID := range sectionID {
	// 	assignmentSection := models.AssignmentSection{
	// 		SectionID:   secID,
	// 		ReleaseDate: releaseDate,
	// 		DueDate:     dueDate,
	// 		CutOffDate:  cutOffDate,
	// 	}
	// 	assignmentSections = append(assignmentSections, assignmentSection)
	// }

	var releaseDate, dueDate, cutOffDate *time.Time

	var assignmentSections []models.AssignmentSection
	for _, secID := range sectionIDs {
		assignmentSection := models.AssignmentSection{
			SectionID:   secID,
			ReleaseDate: releaseDate,
			DueDate:     dueDate,
			CutOffDate:  cutOffDate,
		}
		assignmentSections = append(assignmentSections, assignmentSection)
	}

	// Handle files uploaded
	formFiles, err := c.MultipartForm()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Failed to get files from form-data",
			"error":   err.Error(),
		})
	}

	files := formFiles.File["files"]
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

func (h *HttpInstructorHandler) GetAssignmentNameTemplate(c *fiber.Ctx) error {
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

	templateFile, err := h.services.GetAssignmentNameTemplate(courseID, assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get assignment template",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":  "Assignment template is retrieved",
		"template": templateFile,
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

	firstNames := c.FormValue("first_name")
	lastNames := c.FormValue("last_name")
	emails := c.FormValue("email")
	studentCodes := c.FormValue("student_code")
	sections := c.FormValue("section")
	roleType := c.FormValue("role_type")

	firstNameArray := strings.Split(firstNames, ",")
	lastNameArray := strings.Split(lastNames, ",")
	emailArray := strings.Split(emails, ",")
	studentCodeArray := strings.Split(studentCodes, ",")
	sectionArray := strings.Split(sections, ",")

	totalEntries := len(firstNameArray)
	if totalEntries != len(lastNameArray) ||
		totalEntries != len(emailArray) ||
		totalEntries != len(studentCodeArray) ||
		totalEntries != len(sectionArray) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Data arrays must have the same length",
		})
	}

	var personalData []models.PersonalData
	var enrollmentLists []models.EnrollmentList

	for i := 0; i < totalEntries; i++ {
		firstName := strings.TrimSpace(firstNameArray[i])
		lastName := strings.TrimSpace(lastNameArray[i])
		email := strings.TrimSpace(emailArray[i])
		studentCode := strings.TrimSpace(studentCodeArray[i])
		sectionName := strings.TrimSpace(sectionArray[i])

		var sectionID *uuid.UUID
		if sectionName != "" {
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
					sectionID = &newSection.SectionID
				} else {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"message": "Failed to query section",
						"error":   err.Error(),
					})
				}
			} else {
				sectionID = &section.SectionID
			}
		}

		personalData = append(personalData, models.PersonalData{
			StudentCode: &studentCode,
			FirstName:   firstName,
			LastName:    lastName,
			Email:       email,
			RoleType:    roleType,
		})

		enrollmentLists = append(enrollmentLists, models.EnrollmentList{
			CourseID:  courseID,
			SectionID: sectionID,
		})
	}

	if err := h.services.CreateMultipleUserRoster(personalData, enrollmentLists); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to add users to roster",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Users successfully added to the roster",
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

	var response []map[string]interface{}
	for _, course := range courses {
		response = append(response, map[string]interface{}{
			"course_id":          course["course_id"],
			"course_name":        course["course_name"],
			"course_code":        course["course_code"],
			"course_description": course["course_description"],
			"semester":           course["semester"],
			"academic_year":      course["academic_year"],
			"entry_code":         course["entry_code"],
			"total_assignments":  course["total_assignments"],
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Courses are retrieved",
		"courses": response,
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

	// Modify the response to only return ...
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":            "Active assignments are retrieved",
		"active_assignments": activeAssignments,
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

	var response []map[string]interface{}
	for _, ins := range instructors {
		response = append(response, map[string]interface{}{
			"personalData_id": ins.PersonalDataID,
			"instructor_name": ins.FirstName + " " + ins.LastName,
		})
	}

	// Modify the response to only return ...
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":     "Instructors are retrieved",
		"instructors": response,
	})
}
