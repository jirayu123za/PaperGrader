package adapters

import (
	"fmt"
	"paperGrader/internal/core/services"
	"paperGrader/internal/core/utils"
	"paperGrader/internal/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// Primary adapters
type HttpInstructorHandler struct {
	services      services.InstructorService
	fileServices  services.FileService
	minioServices services.MinIOService
}

func NewHttpInstructorHandler(services services.InstructorService, fileServices services.FileService, minioServices services.MinIOService) *HttpInstructorHandler {
	return &HttpInstructorHandler{
		services:      services,
		fileServices:  fileServices,
		minioServices: minioServices,
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
	lateSubmissStr := c.FormValue("late_submiss")
	lateSubmiss, err := strconv.ParseBool(lateSubmissStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid value for late_submiss",
			"error":   err.Error(),
		})
	}
	groupSubmissStr := c.FormValue("group_submiss")
	groupSubmiss, err := strconv.ParseBool(groupSubmissStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid value for group_submiss",
			"error":   err.Error(),
		})
	}
	releaseDateStr := c.FormValue("release_date")
	dueDateStr := c.FormValue("due_date")

	releaseDate, err := time.Parse("01-02-2006", releaseDateStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid release_date format",
			"error":   err.Error(),
		})
	}

	dueDate, err := time.Parse("01-02-2006", dueDateStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid due_date format",
			"error":   err.Error(),
		})
	}

	var cutOffDate *time.Time
	cutOffDateStr := c.FormValue("cut_off_date")
	if cutOffDateStr != "" {
		parsedDate, err := time.Parse("01-02-2006", cutOffDateStr)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Invalid cut_off_date format",
				"error":   err.Error(),
			})
		}
		cutOffDate = &parsedDate
	} else {
		cutOffDate = nil
	}

	// Handle files uploaded
	formFiles, err := c.MultipartForm()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Failed to get files from form-data",
			"error":   err.Error(),
		})
	}

	assignment := models.Assignment{
		CourseID:              courseID,
		AssignmentName:        assignmentName,
		AssignmentDescription: assignmentDescription,
		SubmissBy:             submissBy,
		LateSubmiss:           lateSubmiss,
		GroupSubmiss:          groupSubmiss,
		ReleaseDate:           releaseDate,
		DueDate:               dueDate,
		CutOffDate:            cutOffDate,
	}

	if err := h.services.CreateAssignment(courseID, &assignment); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create assignment",
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

	// Call service to create assignment and upload file
	if err := h.services.CreateAssignmentWithFiles(courseID, &assignment, assignmentFiles, uploads); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create assignment and save file",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":         "Assignment was created and files saved to bucket",
		"assignment":      assignment,
		"assignment_file": assignmentFiles,
		"upload":          uploads,
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

	var response []map[string]interface{}
	for _, user := range users {
		response = append(response, map[string]interface{}{
			"user_id":           user["user_id"],
			"full_name":         user["first_name"].(string) + " " + user["last_name"].(string),
			"email":             user["email"],
			"user_group_name":   user["user_group_name"],
			"submissions_count": user["submission_count"],
		})
	}
	// Modify the response to only return ...
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Roster is retrieved",
		"roster":  response,
	})
}

// handler Insert student or instructor to course
func (h *HttpInstructorHandler) CreateSingleUserRoster(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	email := c.FormValue("email")
	userGroupName := c.FormValue("user_group_name")

	if err := h.services.CreateSingleUserRoster(courseID, email, userGroupName); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to add user to course",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "User was added to course",
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

	// Modify the response to only return ...
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Courses are retrieved",
		"courses": courses,
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

	var response []map[string]interface{}
	for _, assignment := range assignments {
		releaseDate := assignment.ReleaseDate.Format("02-01-2006")
		dueDate := assignment.DueDate.Format("02-01-2006")
		cutOffDate := ""
		if assignment.CutOffDate != nil {
			cutOffDate = assignment.CutOffDate.Format("02-01-2006")
		}

		response = append(response, map[string]interface{}{
			"assignment_id":           assignment.AssignmentID,
			"assignment_name":         assignment.AssignmentName,
			"assignment_release_date": releaseDate,
			"assignment_due_date":     dueDate,
			"assignment_cut_off_date": cutOffDate,
		})
	}

	// Modify the response to only return ...
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":     "Assignments are retrieved",
		"assignments": response,
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

	var response []map[string]interface{}
	for _, activeAssignment := range activeAssignments {

		releaseDate := activeAssignment.ReleaseDate.Format("02-01-2006")
		dueDate := activeAssignment.DueDate.Format("02-01-2006")
		cutOffDate := ""
		if activeAssignment.CutOffDate != nil {
			cutOffDate = activeAssignment.CutOffDate.Format("02-01-2006")
		}

		response = append(response, map[string]interface{}{
			"assignment_id":           activeAssignment.AssignmentID,
			"assignment_name":         activeAssignment.AssignmentName,
			"assignment_release_date": releaseDate,
			"assignment_due_date":     dueDate,
			"assignment_cut_off_date": cutOffDate,
		})
	}

	// Modify the response to only return ...
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":            "Active assignments are retrieved",
		"active_assignments": response,
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
			"instructor_id":   ins.UserID,
			"instructor_name": ins.FirstName + " " + ins.LastName,
		})
	}

	// Modify the response to only return ...
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":     "Instructors are retrieved",
		"instructors": response,
	})
}
