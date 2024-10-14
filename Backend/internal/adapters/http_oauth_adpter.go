package adapters

import (
	"paperGrader/internal/core/services"
	"paperGrader/internal/core/utils"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Primary adapter
type HttpOAuthHandler struct {
	services    services.OAuthService
	userService services.UserService
}

func NewHttpOAuthHandler(services services.OAuthService, userService services.UserService) *HttpOAuthHandler {
	return &HttpOAuthHandler{
		services:    services,
		userService: userService,
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

	// Check if the user already exists in the database
	user, err := h.userService.SignUpOrSignInUser(userInfo)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to process user signup/login",
			"error":   err,
		})
	}

	if user == nil {
		// User does not exist, return user info to pre-fill the sign up form
		jwtToken, err := h.services.GenerateGoogleJWT(userInfo)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to generate JWT",
				"error":   err,
			})
		}

		// return c.Status(fiber.StatusOK).JSON(fiber.Map{
		// 	"message":  "New User logged in via Google OAuth2",
		// 	"userInfo": userInfo,
		// 	"jwtToken": jwtToken,
		// })

		redirectURL := "http://localhost:5173/?token=" + jwtToken
		return c.Redirect(redirectURL, fiber.StatusTemporaryRedirect)

	}

	jwtToken, err := h.services.GenerateUserJWT(user.UserID, user.GroupID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to generate JWT",
			"error":   err,
		})
	}

	// Set JWT as a secure cookie
	c.Cookie(&fiber.Cookie{
		Name:     "user_token",
		Value:    jwtToken,
		Expires:  time.Now().Add(time.Hour * 12),
		HTTPOnly: true,
		Secure:   true,
	})

	// return c.Status(fiber.StatusOK).JSON(fiber.Map{
	// 	"message":  "User is logged in by Google OAuth2",
	// 	"token":    token,
	// 	"jwtToken": jwtToken,
	// 	"user":     userInfo,
	// })
	// return c.Status(fiber.StatusOK).JSON(fiber.Map{
	// 	"message": "User logged in via Google OAuth2",
	// 	"user":    user,
	// })

	// groupID, err := utils.GetUserGroupIDFromJWT(c)
	// if err != nil {
	// 	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
	// 		"message": "Invalid group_id in JWT",
	// 		"error":   err.Error(),
	// 	})
	// }

	// switch groupID {
	// case 1:
	// 	return c.Redirect("http://localhost:5173/INSCourseOverview", fiber.StatusTemporaryRedirect)
	// case 2:
	// 	return c.Redirect("http://localhost:5173/STDCourseOverview", fiber.StatusTemporaryRedirect)
	// default:
	// 	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
	// 		"message": "Invalid group ID",
	// 		"error":   "Invalid group ID",
	// 	})
	// }

	// insRedirectURL := "http://localhost:5173/CourseOverview"
	// stdRedirectURL := "http://localhost:5173/students/12345"
	// return c.Redirect(insRedirectURL, fiber.StatusTemporaryRedirect)
	return c.Redirect("/api/google/callback/verify", fiber.StatusTemporaryRedirect)
}

func (h *HttpOAuthHandler) VerifyGoogleCallback(c *fiber.Ctx) error {
	groupID, err := utils.GetUserGroupIDFromJWT(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid group_id in JWT",
			"error":   err.Error(),
		})
	}

	switch groupID {
	case 1:
		return c.Redirect("http://localhost:5173/INSCourseOverview", fiber.StatusTemporaryRedirect)
	case 2:
		return c.Redirect("http://localhost:5173/STDCourseOverview", fiber.StatusTemporaryRedirect)
	default:
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid group ID",
			"error":   "Invalid group ID",
		})
	}
}
