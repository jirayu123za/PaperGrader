package adapters

import (
	"paperGrader/internal/core/services"
	"paperGrader/internal/core/utils"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Primary adapter
type HttpOAuthHandler struct {
	services services.OAuthService
}

func NewHttpOAuthHandler(services services.OAuthService) *HttpOAuthHandler {
	return &HttpOAuthHandler{
		services: services,
	}
}

func (h *HttpOAuthHandler) GetGoogleLoginURL(c *fiber.Ctx) error {
	state, err := utils.GenerateRandomState(32)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to generate state",
			"message": err.Error(),
		})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "oauth_state",
		Value:    state,
		Expires:  time.Now().Add(time.Minute * 10),
		HTTPOnly: true,
	})

	loginURL := h.services.GetGoogleLoginURL(state)
	return c.Redirect(loginURL)
}

func (h *HttpOAuthHandler) GetGoogleCallBack(c *fiber.Ctx) error {
	code := c.Query("code")
	state := c.Query("state")

	if !utils.ValidateState(c, state) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid state",
			"error":   "Invalid state",
		})
	}

	if code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Code is required",
			"message": "Code is required",
		})
	}

	token, err := h.services.GetGoogleToken(code)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to exchange code for token",
			"message": err.Error(),
		})
	}

	userInfo, err := h.services.GetGoogleUserInfo(token.AccessToken)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get user info",
			"error":   err,
		})
	}

	jwtToken, err := h.services.GenerateGoogleJWT(userInfo)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to generate JWT",
			"error":   err,
		})
	}

	// Check if the user already exists in the database
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":  "User is logged in by Google OAuth2",
		"token":    token,
		"jwtToken": jwtToken,
		"user":     userInfo,
	})

	/*
		redirectURL := "http://localhost:5173/signup?token=" + jwtToken
		return c.Redirect(redirectURL, fiber.StatusTemporaryRedirect)

	*/
}
