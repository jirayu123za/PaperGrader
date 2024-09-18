package adapters

import (
	"paperGrader/internal/core/services"
	"paperGrader/internal/models"

	"github.com/gofiber/fiber/v2"
)

// Primary adapter
type HttpUserHandler struct {
	services services.UserService
}

func NewHttpUserHandler(services services.UserService) *HttpUserHandler {
	return &HttpUserHandler{
		services: services,
	}
}

func (h *HttpUserHandler) CreateUser(c *fiber.Ctx) error {
	var user models.User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	err := h.services.CreateUser(&user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user"})
	}

	return c.Status(fiber.StatusCreated).JSON(user)
}

func (h *HttpUserHandler) GetUserByID(c *fiber.Ctx) error {
	googleID := c.Params("googleID")

	user, err := h.services.GetUserByGoogleID(googleID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	return c.Status(fiber.StatusOK).JSON(user)
}
