package main

import (
	"fmt"
	"log"
	"os"
	"paperGrader/internal/adapters"
	"paperGrader/internal/adapters/oauth"
	"paperGrader/internal/config"
	"paperGrader/internal/core/services"
	"paperGrader/internal/database"
	"paperGrader/internal/storage"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	// Load env
	config.LoadEnv()
	port := os.Getenv("PORT")

	// Init fiber server
	app := fiber.New()
	app.Use(logger.New(logger.Config{
		Format: "${time} [${ip}] ${status} ${latency} ${method} ${path}\n",
	}))

	// Init GoogleOAuth configured
	oauth.InitializeGoogleOAuth()

	// Initialize MinIO storage
	minioClient, err := storage.MinioConnection()
	if err != nil {
		log.Fatalf("Failed to connect to MinIO: %v", err)
	}

	fileRepo := adapters.NewMinIOFileRepository(minioClient, os.Getenv("MINIO_BUCKET_NAME"))
	fileService := services.NewFileService(fileRepo)
	fileHandler := adapters.NewHttpFileHandler(fileService)

	oauthRepo := adapters.NewOAuthRepository()
	oauthService := services.NewOAuthService(oauthRepo)
	oauthHandler := adapters.NewHttpOAuthHandler(oauthService)

	// Routes
	api := app.Group("/")
	apiGroup := api.Group("/api")
	apiGroup.Get("/check", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message": "Server is running",
			"error":   nil,
		})
	})
	apiGroup.Post("/file", fileHandler.CreateFile)
	apiGroup.Get("/file/:name", fileHandler.GetFileByID)

	apiGroup.Get("/google", oauthHandler.GetGoogleLoginURL)
	apiGroup.Get("/google/callback", oauthHandler.GetGoogleCallBack)

	// Connect to postgres database
	//db := database.ConnectPostgres(true)
	database.ConnectPostgres(true)

	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
	fmt.Println("Server is running on port: ", port)
}
