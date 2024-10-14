package adapters

import (
	"fmt"
	"paperGrader/internal/core/services"
	"paperGrader/internal/core/utils"
	"paperGrader/internal/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// Primary adapters
type HttpStudentHandler struct {
	services      services.StudentService
	minioServices services.MinIOService
}

func NewHttpStudentHandler(services services.StudentService, minioServices services.MinIOService) *HttpStudentHandler {
	return &HttpStudentHandler{
		services:      services,
		minioServices: minioServices,
	}
}

func (h *HttpStudentHandler) CreateSubmissionFile(c *fiber.Ctx) error {
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

	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Failed to get file",
			"error":   err.Error(),
		})
	}

	versionedFileName := fmt.Sprintf("%s_%s", uuid.New().String(), file.Filename)

	submission := &models.Submission{
		UserID:       userID,
		AssignmentID: assignmentID,
		//SubmissionFileName: file.Filename,
		SubmissionFileName: versionedFileName,
		SubmittedAt:        time.Now(),
	}

	if err := h.services.CreateSubmissionFile(submission); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to save submission",
			"error":   err.Error(),
		})
	}

	// structure folder bucket -> course_id -> assignment_id -> file name(version)
	fileContent, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to open file",
			"error":   err.Error(),
		})
	}
	defer fileContent.Close()

	// upload file to MinIO
	if err := h.minioServices.CreateFileToMinIO(fileContent, courseID.String(), assignmentID.String() /*file.Filename*/, versionedFileName); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to upload file to MinIO",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":    "File uploaded and submission saved successfully",
		"submission": submission,
	})
}

func (h *HttpStudentHandler) GetCoursesAndAssignments(c *fiber.Ctx) error {
	userID, err := utils.GetUserIDFromJWT(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid user_id in JWT",
			"error":   err.Error(),
		})
	}

	result, err := h.services.GetCoursesAndAssignments(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get courses and assignments",
			"error":   err.Error(),
		})
	}

	for i := range result {
		if dueDate, ok := result[i]["due_date"].(time.Time); ok {
			result[i]["due_date"] = dueDate.Format("01-02-2006")
		}
		if releaseDate, ok := result[i]["release_date"].(time.Time); ok {
			result[i]["release_date"] = releaseDate.Format("01-02-2006")
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":     "Successfully fetched courses and assignments",
		"assignments": result,
	})
}

func (h *HttpStudentHandler) GetAssignmentNamesWithCourseIDAndAssignmentID(c *fiber.Ctx) error {
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

	fileNames, err := h.services.GetAssignmentNamesWithCourseIDAndAssignmentID(courseID, assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get assignment names",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Successfully fetched assignment names",
		"files":   fileNames,
	})
}

func (h *HttpStudentHandler) GetPDFFileNamesAndURLs(c *fiber.Ctx) error {
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

	fileNames, urls, err := h.services.GetPDFFileNamesAndURLs(courseID, assignmentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get PDF file names and URLs",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Successfully fetched PDF file names and URLs",
		"files":   fileNames,
		"urls":    urls,
	})
}
