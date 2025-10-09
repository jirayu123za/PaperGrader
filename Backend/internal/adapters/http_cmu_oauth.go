package adapters

import (
	"context"
	"errors"
	"net/http"
	"paperGrader/internal/core/services"
	"time"

	"github.com/gofiber/fiber/v2"
)

type HttpCMUOAuthHandler struct {
	services services.CMUOAuthService
}

func NewHttpCMUOAuthHandler(services services.CMUOAuthService) *HttpCMUOAuthHandler {
	return &HttpCMUOAuthHandler{
		services: services,
	}
}

// Implement CMU OAuth handler methods here
func (h *HttpCMUOAuthHandler) GetAuthorizeURL(c *fiber.Ctx) error {
	redirectURI := c.Query("redirect_uri")
	state := c.Query("state")

	url, err := h.services.AuthorizeURL(redirectURI, state)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error":   "Failed to get authorize URL",
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"authorize_url": url,
	})
}

func (h *HttpCMUOAuthHandler) ExchangeCode(c *fiber.Ctx) error {
	type exchangeReq struct {
		Code        string `json:"code"`
		RedirectURI string `json:"redirect_uri"`
	}

	var req exchangeReq
	if err := c.BodyParser(&req); err != nil || req.Code == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	ctx, cancel := context.WithTimeout(c.Context(), 12*time.Second)
	defer cancel()

	res, err := h.services.ExchangeAndLogin(ctx, req.Code, req.RedirectURI)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "Failed to exchange code and login",
			"error":   err.Error(),
		})
	}

	if res.NeedsSignUp && res.RedirectURL != "" {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"needs_sign_up": true,
			"redirect_url":  res.RedirectURL,
		})
	}

	// Set JWT as a secure cookie
	if res.JWT != "" {
		c.Cookie(&fiber.Cookie{
			Name:     "user_token",
			Value:    res.JWT,
			HTTPOnly: true,
			Secure:   true,
		})
	}
	return c.JSON(res)
}

func (h *HttpCMUOAuthHandler) GetUserGroup(c *fiber.Ctx) error {
	token := c.Cookies("user_token")
	if token == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "No token provided",
			"error":   errors.New("no token provided"),
		})
	}

	claims, err := h.services.GetUserGroup(token)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Invalid token",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"group_id": claims["group_id"],
		"user_id":  claims["user_id"],
	})
}
