package utils

import (
	"crypto/rand"
	"encoding/base64"

	"github.com/gofiber/fiber/v2"
)

func GenerateRandomState(length int) (string, error) {
	b := make([]byte, length)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

func ValidateState(c *fiber.Ctx, state string) bool {
	cookie := c.Cookies("oauth_state")
	return cookie == state
}
