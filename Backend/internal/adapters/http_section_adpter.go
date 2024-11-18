package adapters

import (
	"paperGrader/internal/core/services"
	"paperGrader/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// Primary adapters
type HttpSectionHandler struct {
	services services.SectionService
}

func NewHttpSectionHandler(services services.SectionService) *HttpSectionHandler {
	return &HttpSectionHandler{
		services: services,
	}
}

func (h *HttpSectionHandler) CreateSection(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	var singleSection models.Section
	var multipleSections []*models.Section

	// Handle single Section
	if err := c.BodyParser(&singleSection); err == nil {
		if err := h.services.CreateSection(courseID, &singleSection); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to create section",
				"error":   err.Error(),
			})
		}
		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"message": "Section is created",
			"section": singleSection,
		})
	}

	// Handle multiple Sections
	if err := c.BodyParser(&multipleSections); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Failed to parse request body",
			"error":   err.Error(),
		})
	}

	if err := h.services.CreateSection(courseID, multipleSections); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create sections",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":  "Sections are created",
		"sections": multipleSections,
	})
}

func (h *HttpSectionHandler) GetSectionsDetailsByCourseID(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	sections, err := h.services.GetSectionsDetailsByCourseID(courseID)
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

// func (h *HttpSectionHandler) GetSectionIDsByCourseID(c *fiber.Ctx) error {
// 	courseIDParam := c.Query("course_id")
// 	courseID, err := uuid.Parse(courseIDParam)
// 	if err != nil {
// 		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
// 			"message": "Invalid course_id",
// 			"error":   err.Error(),
// 		})
// 	}
// 	sectionIDs, err := h.services.GetSectionIDsByCourseID(courseID)
// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
// 			"message": "Failed to get section IDs",
// 			"error":   err.Error(),
// 		})
// 	}
// 	return c.Status(fiber.StatusOK).JSON(fiber.Map{
// 		"message":    "Section IDs are retrieved",
// 		"sectionIDs": sectionIDs,
// 	})
// }

func (h *HttpSectionHandler) GetSectionsNameByCourseID(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	sections, err := h.services.GetSectionsNameByCourseID(courseID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get sections name",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":  "Sections name are retrieved",
		"sections": sections,
	})
}
