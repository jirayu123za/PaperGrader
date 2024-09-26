package adapters

import (
	"paperGrader/internal/core/services"
	"paperGrader/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// Primary adapter
type HttpUniversityHandler struct {
	services services.UniversityService
}

func NewHttpUniversityHandler(services services.UniversityService) *HttpUniversityHandler {
	return &HttpUniversityHandler{
		services: services,
	}
}

func (h *HttpUniversityHandler) CreateUniversity(c *fiber.Ctx) error {
	var university models.University
	if err := c.BodyParser(&university); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request payload",
		})
	}

	err := h.services.CreateUniversity(&university)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create university",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(university)
}

func (h *HttpUniversityHandler) GetUniversityByID(c *fiber.Ctx) error {
	universityID := c.Query("university_id")
	id, err := uuid.Parse(universityID)

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid university ID format",
		})
	}

	university, err := h.services.GetUniversityByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "University not found",
		})
	}

	return c.Status(fiber.StatusOK).JSON(university)
}

func (h *HttpUniversityHandler) GetUniversities(c *fiber.Ctx) error {
	universities, err := h.services.GetUniversities()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get universities",
		})
	}

	var response []map[string]string
	for _, university := range universities {
		response = append(response, map[string]string{
			"university_id":   university.UniversityID.String(),
			"university_name": university.UniversityName,
		})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func (h *HttpUniversityHandler) UpdateUniversity(c *fiber.Ctx) error {
	universityID := c.Query("university_id")
	id, err := uuid.Parse(universityID)

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid university ID format",
		})
	}

	university, err := h.services.GetUniversityByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "University not found",
		})
	}

	newUniversity := new(models.University)
	if err := c.BodyParser(&newUniversity); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Failed to parse request body",
			"error":   err.Error(),
		})
	}

	university.UniversityName = newUniversity.UniversityName

	if err := h.services.UpdateUniversity(university); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to update university name",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":    "University name was updated",
		"university": university,
	})
}

func (h *HttpUniversityHandler) DeleteUniversity(c *fiber.Ctx) error {
	universityID := c.Query("university_id")
	id, err := uuid.Parse(universityID)

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid university ID format",
		})
	}

	university, err := h.services.GetUniversityByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "University not found",
		})
	}

	err = h.services.DeleteUniversity(university)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete university",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "University was deleted",
	})
}
