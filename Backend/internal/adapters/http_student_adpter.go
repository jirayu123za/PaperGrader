package adapters

import (
	"paperGrader/internal/core/services"
	"paperGrader/internal/core/utils"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Primary adapters
type HttpStudentHandler struct {
	services services.StudentService
}

func NewHttpStudentHandler(services services.StudentService) *HttpStudentHandler {
	return &HttpStudentHandler{
		services: services,
	}
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
