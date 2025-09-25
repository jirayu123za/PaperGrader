package adapters

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"paperGrader/internal/adapters/response"
	"paperGrader/internal/core/services"
	"paperGrader/internal/core/utils"
	"paperGrader/internal/models"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/datatypes"
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

// Http handler to create assignment to course with Files(FromData)
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

	sectionRaw := c.FormValue("sections")
	if sectionRaw == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Sections cannot be empty",
			"error":   "Sections field is required",
		})
	}
	sectionNames := strings.Split(sectionRaw, ",")

	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Failed to parse form data",
			"error":   "Failed to parse form data",
		})
	}
	files := form.File["files"]

	var isTemplateFlags []bool
	for i := range files {
		val := c.FormValue(fmt.Sprintf("is_template[%d]", i))
		flag, err := strconv.ParseBool(val)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Invalid is_template",
				"error":   err.Error(),
			})
		}
		isTemplateFlags = append(isTemplateFlags, flag)
	}

	request := response.CreateAssignmentRequest{
		CourseID:              courseID,
		AssignmentName:        c.FormValue("assignment_name"),
		AssignmentDescription: c.FormValue("assignment_description"),
		SubmittedBy:           c.FormValue("submitted_by"),
		SectionNames:          sectionNames,
		Files:                 files,
		IsTemplateFlags:       isTemplateFlags,
		UserID:                userID,
	}

	resp, err := h.services.CreateAssignmentWithFiles(request)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create assignment",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Assignment created successfully",
		"data":    resp,
	})
}

// ! new version: update assignment
func (h *HttpInstructorHandler) UpdateAssignmentSetting(c *fiber.Ctx) error {
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
	submittedBy := c.FormValue("submitted_by")
	lateSubmittedStr := c.FormValue("late_submitted")
	lateSubmitted, err := strconv.ParseBool(lateSubmittedStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid late submitted value",
			"error":   err.Error(),
		})
	}
	groupSubmittedStr := c.FormValue("group_submitted")
	groupSubmitted, err := strconv.ParseBool(groupSubmittedStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid group submitted value",
			"error":   err.Error(),
		})
	}
	regradesStr := c.FormValue("regrades")
	regrades, err := strconv.ParseBool(regradesStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid regrades value",
			"error":   err.Error(),
		})
	}

	assignment := models.Assignment{
		AssignmentName:        assignmentName,
		AssignmentDescription: assignmentDescription,
		SubmittedBy:           submittedBy,
		LateSubmitted:         lateSubmitted,
		GroupSubmitted:        groupSubmitted,
		Regrades:              regrades,
	}

	if err := h.services.UpdateAssignmentSetting(courseID, assignmentID, &assignment); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to update assignment settings",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Assignment and sections were updated successfully",
	})
}

func (h *HttpInstructorHandler) UpdateAssignmentTimeSetting(c *fiber.Ctx) error {
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

	sectionsData := c.FormValue("sections")
	var sectionsIDs []uuid.UUID
	if err := json.Unmarshal([]byte(sectionsData), &sectionsIDs); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid sections format",
			"error":   err.Error(),
		})
	}

	releaseDateStr := c.FormValue("release_date")
	releaseDate, err := time.Parse(time.RFC3339, releaseDateStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid release_date format",
			"error":   err.Error(),
		})
	}

	dueDateStr := c.FormValue("due_date")
	dueDate, err := time.Parse(time.RFC3339, dueDateStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid due_date format",
			"error":   err.Error(),
		})
	}

	cutOffDateStr := c.FormValue("cut_off_date")
	cutOffDate, err := time.Parse(time.RFC3339, cutOffDateStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid cut_off_date format",
			"error":   err.Error(),
		})
	}

	fmt.Printf("Received ReleaseDate: %s\n", c.FormValue("release_date"))
	fmt.Printf("Received DueDate: %s\n", c.FormValue("due_date"))
	fmt.Printf("Received CutOffDate: %s\n", c.FormValue("cut_off_date"))

	fmt.Printf("Parsed ReleaseDate: %v\n", releaseDate)
	fmt.Printf("Parsed DueDate: %v\n", dueDate)
	fmt.Printf("Parsed CutOffDate: %v\n", cutOffDate)

	var sections []models.AssignmentSection
	for _, sectionID := range sectionsIDs {
		sections = append(sections, models.AssignmentSection{
			SectionID:   sectionID,
			ReleaseDate: &releaseDate,
			DueDate:     &dueDate,
			CutOffDate:  &cutOffDate,
		})
	}

	for _, section := range sections {
		fmt.Printf("Section ID: %v, ReleaseDate: %v, DueDate: %v, CutOffDate: %v\n",
			section.SectionID, section.ReleaseDate, section.DueDate, section.CutOffDate)
	}

	if err := h.services.UpdateAssignmentTimeSettings(courseID, assignmentID, sections); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to update assignment time settings",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Assignments time settings were updated successfully",
	})
}

func (h *HttpInstructorHandler) UpdateAssignmentPublishedGrade(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	var request response.UpdateAssignmentPublishedGradeRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if err := h.services.UpdateAssignmentPublishedGrade(courseID, request); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to update assignment published grade status",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Assignment published grade status was updated successfully",
	})
}

func (h *HttpInstructorHandler) UpdateAssignmentPublishedAssignment(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	var request response.UpdateAssignmentPublishedAssignmentRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if err := h.services.UpdateAssignmentPublishedAssignment(courseID, request); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to update assignment published assignment status",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Assignment published assignment status was updated successfully",
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

func (h *HttpInstructorHandler) GetProcessLeftSideBarData(c *fiber.Ctx) error {
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

	assignment_details, err := h.services.GetProcessLeftSideBarData(courseID, assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get process left sidebar data",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":              "Process left sidebar data is retrieved",
		"process_left_sidebar": assignment_details,
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

// Http handler to insert a single user to roster
func (h *HttpInstructorHandler) CreateSingleUserRoster(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	studentCode := c.FormValue("student_code")
	var studentCodePtr *string
	if studentCode != "" {
		studentCodePtr = &studentCode
	} else {
		studentCodePtr = nil
	}

	payload := response.CreateSingleRosterRequest{
		RoleType:    c.FormValue("role_type"),
		Sections:    c.FormValue("sections"),
		StudentCode: studentCodePtr,
		FirstName:   c.FormValue("first_name"),
		LastName:    c.FormValue("last_name"),
		Email:       c.FormValue("email"),
	}

	err = h.services.CreateSingleUserRoster(courseID, payload)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
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
			"error":   "The 'data' field is required and cannot be empty",
		})
	}

	var input response.CreateMultipleRosterRequest
	if err := json.Unmarshal([]byte(data), &input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid JSON format in 'data'",
			"error":   err.Error(),
		})
	}

	if err := h.services.CreateMultipleUserRoster(courseID, input); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create roster",
			"error":   err.Error(),
		})
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

func (h *HttpInstructorHandler) GetAssignmentSettingsDetail(c *fiber.Ctx) error {
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

	assignment, err := h.services.GetAssignmentSettingsDetail(courseID, assignmentID)
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

	matchedByParam := c.Query("matched_by")

	if err := h.services.UpdateSubmissionList(submissionID, assignmentID, personalDataID, matchedByParam); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to update submission",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Submission is updated",
	})
}

// Get submission files for table submissions list
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
		"message":          "Submission files are retrieved",
		"submissions_list": submissions,
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
		"message":            "Student list is retrieved",
		"with_submission":    students.WithSubmission,
		"without_submission": students.WithoutSubmission,
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

func (h *HttpInstructorHandler) CreateSubmissionFileByInstructor(c *fiber.Ctx) error {
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

	boundingBoxData, err := h.services.GetBoundingBoxesType(assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get bounding boxes type position",
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

			if err := h.minioServices.CreateFileToMinIO(mergedFile, courseID.String(), assignmentID.String(), submissionFileName); err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"message": "Failed to upload merged PDF file",
					"error":   err.Error(),
				})
			}

			submission := models.Submission{
				SubmittedBy:        userID,
				AssignmentID:       assignmentID,
				SubmissionFileName: submissionFileName,
				MatchedBy:          nil,
				SubmittedAt:        time.Now(),
			}

			if err := h.services.CreateSubmissionFileByInstructor(&submission); err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"message": "Failed to save submission",
					"error":   err.Error(),
				})
			}

			// Under line here for cropping the submission file based on bounding boxes
			for _, bbox := range boundingBoxData {
				croppedFilePath, err := utils.CropPDFWithBoundingBox(mergedFilePath, submissionFileName, bbox.BoundingBoxType, bbox.BoundingBoxPage, bbox.PointX, bbox.PointY, bbox.Width, bbox.Height)
				if err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"message": fmt.Sprintf("Failed to crop PDF for %s", bbox.BoundingBoxType),
						"error":   err.Error(),
					})
				}

				croppedFileData, err := os.ReadFile(croppedFilePath)
				if err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"message": "Failed to read cropped file",
						"error":   err.Error(),
					})
				}

				if err := h.minioServices.CreateCroppedImage(courseID.String(), assignmentID.String(), filepath.Base(croppedFilePath), croppedFileData); err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"message": "Failed to upload cropped file",
						"error":   err.Error(),
					})
				}

				submissionBox := models.SubmissionBox{
					SubmissionID:          submission.SubmissionID,
					SubmissionBoxFileName: filepath.Base(croppedFilePath),
				}

				if err := h.services.CreateCroppedSubmissionBox(submissionBox); err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"message": "Failed to create submission box",
						"error":   err.Error(),
					})
				}
				os.Remove(croppedFilePath)
			}
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Submission files created successfully",
	})
}

func (h *HttpInstructorHandler) GetBoundingBoxesTypePosition(c *fiber.Ctx) error {
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	boundingBoxesData, err := h.services.GetBoundingBoxesType(assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get bounding boxes type position",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Bounding boxes type position are retrieved",
		"result":  boundingBoxesData,
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

	var fullRequest response.BoundingBoxesAndQuestionsRequest
	if err := c.BodyParser(&fullRequest); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid JSON format",
			"error":   err.Error(),
		})
	}

	var newBoxes []models.BoundingBox
	var updateBoxes []models.BoundingBox

	for _, boundingBox := range fullRequest.BoundingBoxes {
		boxData := models.BoundingBoxData{
			PointX: boundingBox.PointX,
			PointY: boundingBox.PointY,
			Width:  boundingBox.Width,
			Height: boundingBox.Height,
			Type:   models.BoundingBoxType(boundingBox.Type),
			Page:   boundingBox.Page,
		}

		jsonData, err := json.Marshal(boxData)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Failed to marshal bounding box data",
				"error":   err.Error(),
			})
		}

		box := models.BoundingBox{
			AssignmentID:    assignmentID,
			BoundingBoxData: datatypes.JSON(jsonData),
		}

		if boundingBox.BoundingBoxID != nil {
			box.BoundingBoxID = *boundingBox.BoundingBoxID
			updateBoxes = append(updateBoxes, box)
		} else {
			box.BoundingBoxID = uuid.New()
			newBoxes = append(newBoxes, box)
		}
	}

	// Case 1: Only name and id
	if len(fullRequest.QuestionsData) == 0 {
		// Case 1: update bounding boxes with only name and id
		if len(updateBoxes) > 0 {
			if err := h.services.UpdateBoundingBoxesNameAndID(assignmentID, updateBoxes); err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"message": "Failed to update bounding boxes with only name and id",
					"error":   err.Error(),
				})
			}
		}
		// Case 2: create bounding boxes with only name and id
		if len(newBoxes) > 0 {
			if err := h.services.CreateBoundingBoxesNameAndID(assignmentID, newBoxes); err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"message": "Failed to create bounding boxes with only name and id",
					"error":   err.Error(),
				})
			}
		}
		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"message":       "Bounding boxes with only name and id are created/updated",
			"created_boxes": newBoxes,
			"updated_boxes": updateBoxes,
		})
	}

	// Case 2: Includes questions (question, or name/id + question)
	if len(updateBoxes) > 0 {
		if err := h.services.UpdateBoundingBoxesQuestions(assignmentID, updateBoxes, fullRequest.QuestionsData); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to update bounding boxes and questions",
				"error":   err.Error(),
			})
		}
	}

	if len(newBoxes) > 0 {
		if err := h.services.CreateBoundingBoxesQuestions(assignmentID, newBoxes, fullRequest.QuestionsData); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to create bounding boxes and questions",
				"error":   err.Error(),
			})
		}
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":       "Bounding boxes and questions are created/updated",
		"created_boxes": newBoxes,
		"updated_boxes": updateBoxes,
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

func (h *HttpInstructorHandler) GetAssignmentTemplateData(c *fiber.Ctx) error {
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

	questions, err := h.services.GetQuestionsByAssignmentTemplate(assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get questions",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"bounding_boxes": boundingBoxes,
		"questions":      questions,
		"message":        "Assignment template data retrieved",
	})
}

func (h *HttpInstructorHandler) GetStudentsListForOCR(c *fiber.Ctx) error {
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

	studentsList, err := h.services.GetStudentsListForOCR(courseID, assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get questions",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Mock handler GetSubmissionBoxesForOCR services",
		"result":  studentsList,
	})
}

// New http handler for submission with ocr
func (h *HttpInstructorHandler) GetSubmissionsList(c *fiber.Ctx) error {
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

	submissions, err := h.services.GetSubmissionsList(courseID, assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get submission with ocr",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":     "Submissions with OCR are retrieved",
		"submissions": submissions,
	})
}

func (h *HttpInstructorHandler) GetProcessOCRForSubmissions(c *fiber.Ctx) error {
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

	ocrData, err := h.services.GetProcessOCRForSubmissions(courseID, assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get process OCR for submissions",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":  "Process OCR for submissions is retrieved",
		"ocr_data": ocrData,
	})
}

// Part: 1 Total submissions has_grade handler
func (h *HttpInstructorHandler) GetTotalSubmissionIDsByHasGrade(c *fiber.Ctx) error {
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	result, err := h.services.GetTotalSubmissionIDsByHasGrade(assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to query total submission ids",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"total_submissions": result,
	})
}

// Part:1 Rubric Handlers
func (h *HttpInstructorHandler) CreateRubric(c *fiber.Ctx) error {
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	var req response.CreateRubricRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if err := h.services.CreateRubricData(assignmentID, req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create rubric",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Rubric created successfully",
	})
}

func (h *HttpInstructorHandler) UpdateRubric(c *fiber.Ctx) error {
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	var req response.UpdateRubricRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if err := h.services.UpdateRubricData(assignmentID, req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to update rubric",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Rubric updated successfully",
	})
}

func (h *HttpInstructorHandler) UpdateRubricIndexes(c *fiber.Ctx) error {
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	var req response.UpdateRubricIndexesRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if err := h.services.UpdateRubricIndexes(assignmentID, req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to update rubric indexes",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Rubric indexes updated successfully",
	})

}

func (h *HttpInstructorHandler) DeleteRubric(c *fiber.Ctx) error {
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	var request response.DeleteRubricRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if err := h.services.DeleteRubricData(assignmentID, request); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to delete rubric",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Rubric deleted successfully",
	})
}

func (h *HttpInstructorHandler) GetRubric(c *fiber.Ctx) error {
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	questionIDParam := c.Query("question_id")
	questionID, err := uuid.Parse(questionIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid questionID",
			"error":   err.Error(),
		})
	}

	subQuestionIDParam := c.Query("sub_question_id")
	var subQuestionID *uuid.UUID
	if subQuestionIDParam != "" {
		id, err := uuid.Parse(subQuestionIDParam)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Invalid sub_question_id",
				"error":   err.Error(),
			})
		}
		if id != uuid.Nil {
			subQuestionID = &id
		}
	}

	rubric, err := h.services.GetRubricData(assignmentID, questionID, subQuestionID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get rubric",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Rubric retrieved successfully",
		"rubric":  rubric,
	})
}

func (h *HttpInstructorHandler) GetQuestionsList(c *fiber.Ctx) error {
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	questions, err := h.services.GetQuestionsList(assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get questions",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"questions": questions,
		"message":   "questions list retrieved successfully",
	})
}

func (h *HttpInstructorHandler) GetNoSubmittedQuestionsList(c *fiber.Ctx) error {
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	questions, err := h.services.GetNoSubmittedQuestionsList(assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get questions",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"questions": questions,
		"message":   "questions list retrieved successfully",
	})
}

// Part: 2 Rubric Handlers
func (h *HttpInstructorHandler) UpdateRubricSetting(c *fiber.Ctx) error {
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	var req response.UpdateRubricSettingRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if err := h.services.UpdateRubricSetting(assignmentID, req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to update rubric setting",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Rubric setting updated successfully",
	})
}

func (h *HttpInstructorHandler) UpdateRubricScoreBounds(c *fiber.Ctx) error {
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	var req response.UpdateRubricScoreBoundsRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if err := h.services.UpdateRubricScoreBounds(assignmentID, req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to update rubric score bounds",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Rubric score bounds updated successfully",
	})
}

// Part: 3 Rubric Handlers
func (h *HttpInstructorHandler) GetRubricAfterGraded(c *fiber.Ctx) error {
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

	questionIDParam := c.Query("question_id")
	questionID, err := uuid.Parse(questionIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid questionID",
			"error":   err.Error(),
		})
	}

	subQuestionIDParam := c.Query("sub_question_id")
	var subQuestionID *uuid.UUID
	if subQuestionIDParam != "" {
		id, err := uuid.Parse(subQuestionIDParam)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Invalid sub_question_id",
				"error":   err.Error(),
			})
		}
		if id != uuid.Nil {
			subQuestionID = &id
		}
	}

	rubric, err := h.services.GetRubricAfterGraded(assignmentID, submissionID, questionID, subQuestionID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get rubric",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Rubric retrieved successfully",
		"rubric":  rubric,
	})
}

// Question Handlers
func (h *HttpInstructorHandler) GetSubmissionsFromQuestion(c *fiber.Ctx) error {
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

	questionIDParam := c.Query("question_id")
	questionID, err := uuid.Parse(questionIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid questionID",
			"error":   err.Error(),
		})
	}

	subQuestionIDParam := c.Query("sub_question_id")
	var subQuestionID *uuid.UUID
	if subQuestionIDParam != "" {
		id, err := uuid.Parse(subQuestionIDParam)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Invalid sub_question_id",
				"error":   err.Error(),
			})
		}
		if id != uuid.Nil {
			subQuestionID = &id
		}
	}

	submissions, err := h.services.GetSubmissionsFromQuestion(courseID, assignmentID, questionID, subQuestionID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get submissions from question",
			"error":   err.Error(),
		})
	}

	questionTitleAndQuestionPoint, err := h.services.GetQuestionTitleAndQuestionPoint(assignmentID, questionID, subQuestionID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get question title",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":          "Submissions from question are retrieved",
		"submissions_list": submissions,
		"question_data":    questionTitleAndQuestionPoint,
	})
}

// Grade review handlers
func (h *HttpInstructorHandler) GetBoundingBoxesData(c *fiber.Ctx) error {
	assignmentIDParam := c.Query("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid assignment_id",
			"error":   err.Error(),
		})
	}

	boundingBoxes, err := h.services.GetBoundingBoxesData(assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get bounding boxes",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":             "Bounding boxes data retrieved successfully",
		"bounding_boxes_data": boundingBoxes.BoundingBoxesData,
	})
}

func (h *HttpInstructorHandler) CreateGrade(c *fiber.Ctx) error {
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

	userID, err := utils.GetUserIDFromJWT(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid user_id in JWT",
			"error":   err.Error(),
		})
	}

	var request response.CreateGradeRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if err := h.services.CreateGrade(assignmentID, submissionID, request, userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create grade",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Grade created successfully",
	})
}

// Export Handlers
func (h *HttpInstructorHandler) GetAssignmentsListForExport(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	assignments, err := h.services.GetAssignmentsListForExport(courseID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get assignments list for export",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":     "Assignments list for export is retrieved",
		"assignments": assignments,
	})
}

// func (h *HttpInstructorHandler) ExportGradesToExcel(c *fiber.Ctx) error {
// 	courseIDParam := c.Query("course_id")
// 	courseID, err := uuid.Parse(courseIDParam)
// 	if err != nil {
// 		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
// 			"message": "Invalid course_id",
// 			"error":   err.Error(),
// 		})
// 	}

// 	// userID, err := utils.GetUserIDFromJWT(c)
// 	// if err != nil {
// 	// 	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
// 	// 		"message": "Invalid user_id in JWT",
// 	// 		"error":   err.Error(),
// 	// 	})
// 	// }

// 	var request response.CreateGradeToExcelFileRequest
// 	if err := c.BodyParser(&request); err != nil {
// 		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
// 			"message": "Invalid request body",
// 			"error":   err.Error(),
// 		})
// 	}

// 	if err := h.services.CreateGradesToExcelFile(request, courseID); err != nil {
// 		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
// 			"message": "Failed to export grades to Excel",
// 			"error":   err.Error(),
// 		})
// 	}

// 	return c.Status(fiber.StatusOK).JSON(fiber.Map{
// 		"message": "Grades exported to CSV successfully",
// 	})
// }

// Statistics Handlers
func (h *HttpInstructorHandler) GetStatisticsDataBySelectAssignment(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	var request response.GetAssignmentStatisticsRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	statisticData, err := h.services.GetStatisticsDataBySelectAssignment(request, courseID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get statistics data",
			"error":   err.Error(),
		})
	}

	questionsData, err := h.services.GetQuestionsList(request.AssignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get questions",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":        "Statistics data is retrieved",
		"questions_list": questionsData,
		"statistics":     statisticData,
	})
}

func (h *HttpInstructorHandler) GetStatisticsDataNoQuestions(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	var request response.GetAssignmentStatisticsRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	statisticData, err := h.services.GetStatisticsDataBySelectAssignment(request, courseID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get statistics data",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":    "Statistics data is retrieved",
		"statistics": statisticData,
	})
}
