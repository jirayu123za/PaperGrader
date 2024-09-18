package utils

import (
	"fmt"
	"os"
	"paperGrader/internal/config"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
)

func GetUserIDFromJWT(c *fiber.Ctx) (uuid.UUID, error) {
	config.LoadEnv()
	jwtSecret := os.Getenv("JWT_SECRET")

	userToken := c.Cookies("jwt-token")
	if userToken == "" {
		return uuid.UUID{}, fmt.Errorf("JWT token is missing")
	}

	parsedToken, err := jwt.ParseWithClaims(userToken, &jwt.MapClaims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})
	if err != nil || !parsedToken.Valid {
		return uuid.UUID{}, fmt.Errorf("invalid JWT token: %v", err)
	}

	claims, ok := parsedToken.Claims.(*jwt.MapClaims)
	if !ok {
		return uuid.UUID{}, fmt.Errorf("failed to parse JWT claims")
	}

	userIDStr, ok := (*claims)["userID"].(string)
	if !ok {
		return uuid.UUID{}, fmt.Errorf("userID not found in JWT claims")
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return uuid.UUID{}, fmt.Errorf("invalid userID in JWT: %v", err)
	}

	return userID, nil
}
