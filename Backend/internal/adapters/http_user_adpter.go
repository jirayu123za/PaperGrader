package adapters

import (
	"paperGrader/internal/core/services"
	"paperGrader/internal/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Primary adapter
type HttpUserHandler struct {
	services     services.UserService
	oauthService services.OAuthService
}

func NewHttpUserHandler(services services.UserService, oauthService services.OAuthService) *HttpUserHandler {
	return &HttpUserHandler{
		services:     services,
		oauthService: oauthService,
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

	jwtToken, err := h.oauthService.GenerateUserJWT(user.UserID, user.GroupID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to generate JWT",
			"error":   err,
		})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "user_token",
		Value:    jwtToken,
		Expires:  time.Now().Add(time.Hour * 1),
		HTTPOnly: true,
		Secure:   true,
	})

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

func (h *HttpUserHandler) DeleteJWT(c *fiber.Ctx) error {
	token := c.Cookies("user_token")
	if token == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Unauthorized: token is required",
		})
	}

	err := h.services.Logout(token)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to logout",
			"error":   err,
		})
	}

	c.Cookie(&fiber.Cookie{
		Name:    "user_token",
		Value:   "",
		Expires: time.Now().Add(-time.Hour * 12),
	})

	c.Cookie(&fiber.Cookie{
		Name:    "oauth_state",
		Value:   "",
		Expires: time.Now().Add(-time.Hour * 12),
	})

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Successfully logged out",
	})
}
