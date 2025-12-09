package adapters

import (
	"fmt"
	"net/url"
	"os"
	"paperGrader/internal/adapters/response"
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
	var req response.CreateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request payload",
			"error":   err.Error(),
		})
	}

	if req.GoogleID != nil && strings.TrimSpace(*req.GoogleID) == "" {
		req.GoogleID = nil
	}

	if strings.TrimSpace(req.BirthDate) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "birth_date is required",
		})
	}

	parsedDate, err := time.Parse("02-01-2006", req.BirthDate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid birth_date format, expected DD-MM-YYYY",
		})
	}

	user := models.User{
		GoogleID:   req.GoogleID,
		GroupID:    req.GroupID,
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		Email:      req.Email,
		BirthDate:  parsedDate,
		StudentID:  req.StudentID,
		University: req.University,
	}

	err = h.services.CreateUser(&user)
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

	config.LoadEnv()
	frontendInstructorURL := os.Getenv("FRONTEND_INSTRUCTOR_URL")
	if frontendInstructorURL == "" {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "FRONTEND_INSTRUCTOR_URL not set",
		})
	}
	frontendStudentURL := os.Getenv("FRONTEND_STUDENT_URL")
	if frontendStudentURL == "" {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "FRONTEND_STUDENT_URL not set",
		})
	}
	frontendOrigin := os.Getenv("FRONTEND_ORIGIN")
	if frontendOrigin == "" {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "FRONTEND_ORIGIN not set",
		})
	}
	redirectPath := frontendOrigin
	if user.GroupID == 1 {
		redirectPath = frontendInstructorURL
	} else if user.GroupID == 2 {
		redirectPath = frontendStudentURL
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"user":        user,
		"redirect_to": redirectPath,
	})
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
		if tenant == "" {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to load CMU_TENANT_ID from environment",
			})
		}
		logout_url := os.Getenv("CMU_LOGOUT_URL")
		if logout_url == "" {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to load CMU_LOGOUT_URL from environment",
			})
		}
		frontendOrigin := os.Getenv("FRONTEND_ORIGIN")
		post := url.QueryEscape(frontendOrigin)
		response["post_logout_url"] = fmt.Sprintf(
			logout_url,
			tenant, post,
		)
	}

	return c.Status(fiber.StatusOK).JSON(response)
}
