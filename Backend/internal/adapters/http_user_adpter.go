package adapters

import (
	"fmt"
	"net/url"
	"os"
	"paperGrader/internal/config"
	"paperGrader/internal/core/services"
	"paperGrader/internal/core/utils"
	"paperGrader/internal/models"
	"strings"
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
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request payload",
			"error":   err,
		})
	}

	if user.GoogleID != nil && strings.TrimSpace(*user.GoogleID) == "" {
		user.GoogleID = nil
	}

	err := h.services.CreateUser(&user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create user",
			"error":   err,
		})
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
	token := c.Cookies("jwt-token")
	if token == "" {
		token = c.Cookies("user_token")
	}

	idProvider := ""
	if token != "" {
		if value, err := utils.ExtractIDP(token); err == nil {
			idProvider = value
		}

		err := h.services.Logout(token)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to logout",
				"error":   err,
			})
		}
	}

	clear := func(name string) {
		c.Cookie(&fiber.Cookie{
			Name:     name,
			Value:    "",
			MaxAge:   -1,
			Expires:  time.Unix(0, 0),
			HTTPOnly: true,
			Secure:   true,
		})
	}
	clear("jwt-token")
	clear("user_token")
	clear("oauth_state")

	response := fiber.Map{
		"ok":      true,
		"message": "Logged out successfully",
	}

	if idProvider == "cmu" {
		config.LoadEnv()
		tenant := os.Getenv("CMU_TENANT_ID")
		frontendOrigin := os.Getenv("FRONTEND_ORIGIN")
		if frontendOrigin == "" {
			frontendOrigin = "http://localhost:5173"
		}
		post := url.QueryEscape(frontendOrigin)
		response["post_logout_url"] = fmt.Sprintf(
			"https://login.microsoftonline.com/%s/oauth2/v2.0/logout?post_logout_redirect_uri=%s",
			tenant, post,
		)
	}

	return c.Status(fiber.StatusOK).JSON(response)
}
