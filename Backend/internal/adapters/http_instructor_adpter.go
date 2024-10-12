package adapters

import (
	"fmt"
	"paperGrader/internal/core/services"
	"paperGrader/internal/core/utils"
	"paperGrader/internal/models"

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

// v1
func (h *HttpInstructorHandler) CreateAssignment(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error() + ": " + courseIDParam,
		})
	}

	var assignment models.Assignment
	if err := c.BodyParser(&assignment); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Failed to parse request body",
			"error":   err.Error(),
		})
	}

	fmt.Printf("Received assignment: %+v\n", assignment)
	fmt.Printf("Received assignment: %+v\n", c.BodyParser(&assignment))

	/*
		fileHeader, err := c.FormFile("templateFile")
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Failed to get file from request",
				"error":   err.Error(),
			})
		}

		fileContent, err := fileHeader.Open()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to open file",
				"error":   err.Error(),
			})
		}
		defer fileContent.Close()

		file := &models.File{
			Name: fileHeader.Filename,
		}
		if err := h.fileServices.CreateFile(file, fileContent); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to save file to bucket",
				"error":   err.Error(),
			})
		}
	*/

	/*
		assignmentFile := &models.AssignmentFile{
			AssignmentID: assignment.AssignmentID,
			//AssignmentFileName: file.Name,
		}

		if err := h.assignmentFileService.CreateAssignmentFile(assignmentFile); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to create assignment file record",
				"error":   err.Error(),
			})
		}
	*/
	if err := h.services.CreateAssignment(courseID, &assignment); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create assignment",
			"error":   err.Error(),
		})
	}

	/*
		assignmentFile := &models.AssignmentFile{
			AssignmentID: assignment.AssignmentID,
			//AssignmentFileName: file.Name,
		}

		if err := h.assignmentFileService.CreateAssignmentFile(assignmentFile); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to create assignment file record",
				"error":   err.Error(),
			})
		}
	*/

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":    "Assignment created and file saved to bucket",
		"assignment": assignment,
		//"file_url":   file.URL,
	})
}

// v2
/*
func (h *HttpInstructorHandler) CreateAssignmentWithFile(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	var assignment models.Assignment
	if err := c.BodyParser(&assignment); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Failed to parse request body",
			"error":   err.Error(),
		})
	}

	// Handle File Upload
	userGroupName := c.FormValue("user_group_name")
	userName := c.FormValue("user_name")

	fileHeader, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Failed to get file from request",
			"error":   err.Error(),
		})
	}

	file, err := fileHeader.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to open file",
			"error":   err.Error(),
		})
	}
	defer file.Close()

	fileName := filepath.Base(fileHeader.Filename)

	// Call service to create assignment and upload file
	if err := h.services.CreateAssignmentWithFile(courseID, &assignment, file, userGroupName, userName, fileName); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create assignment and save file",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":    "Assignment created and file saved to bucket",
		"assignment": assignment,
	})
}
*/

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
		cutOffDate := assignment.CutOffDate.Format("02-01-2006")

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
		cutOffDate := activeAssignment.CutOffDate.Format("02-01-2006")

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
