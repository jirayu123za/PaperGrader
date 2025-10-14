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

	userToken := c.Cookies("user_token")
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

	userIDStr, ok := (*claims)["user_id"].(string)
	if !ok {
		return uuid.UUID{}, fmt.Errorf("userID not found in JWT claims")
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return uuid.UUID{}, fmt.Errorf("invalid userID in JWT: %v", err)
	}

	return userID, nil
}

func GetUserGroupIDFromJWT(c *fiber.Ctx) (uint, error) {
	config.LoadEnv()
	jwtSecret := os.Getenv("JWT_SECRET")

	userToken := c.Cookies("user_token")
	if userToken == "" {
		return 0, fmt.Errorf("JWT token is missing")
	}

	parsedToken, err := jwt.ParseWithClaims(userToken, &jwt.MapClaims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})
	if err != nil || !parsedToken.Valid {
		return 0, fmt.Errorf("invalid JWT token: %v", err)
	}

	claims, ok := parsedToken.Claims.(*jwt.MapClaims)
	if !ok {
		return 0, fmt.Errorf("failed to parse JWT claims")
	}

	groupIDValue, ok := (*claims)["group_id"].(float64)
	if !ok {
		return 0, fmt.Errorf("groupID not found in JWT claims")
	}

	groupID := uint(groupIDValue)

	return groupID, nil
}

func TTLFromJWT(token string) error {
	config.LoadEnv()
	jwtSecret := os.Getenv("JWT_SECRET")

	parsedToken, err := jwt.ParseWithClaims(token, &jwt.MapClaims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})
	if err != nil || !parsedToken.Valid {
		return fmt.Errorf("invalid JWT token: %v", err)
	}

	claims, ok := parsedToken.Claims.(*jwt.MapClaims)
	if !ok {
		return fmt.Errorf("failed to parse JWT claims")
	}

	expValue, ok := (*claims)["exp"].(float64)
	if !ok {
		return fmt.Errorf("exp not found in JWT claims")
	}

	expirationTime := int64(expValue)
	currentTime := jwt.NewNumericDate(jwt.TimeFunc()).Unix()
	ttl := expirationTime - currentTime
	if ttl <= 0 {
		return fmt.Errorf("token has already expired")
	}

	return nil
}

func ExtractIDP(token string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", fmt.Errorf("JWT_SECRET not set")
	}

	t, err := jwt.Parse(token, func(*jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil || !t.Valid {
		return "", fmt.Errorf("invalid token: %v", err)
	}

	if claims, ok := t.Claims.(jwt.MapClaims); ok {
		if idp, ok := claims["idp"].(string); ok {
			return idp, nil
		}
	}
	return "", fmt.Errorf("idp claim not found")
}
