package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"paperGrader/internal/adapters"
	"paperGrader/internal/adapters/oauth"
	"paperGrader/internal/config"
	"paperGrader/internal/core/services"
	"paperGrader/internal/database"
	"paperGrader/internal/routes"
	"paperGrader/internal/storage"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/minio/minio-go/v7"
	"gorm.io/gorm"
)

func main() {
	// Load env
	config.LoadEnv()
	port := os.Getenv("PORT")

	// Init fiber server
	app := fiber.New(fiber.Config{
		StreamRequestBody: true,
		BodyLimit:         50 * 1024 * 1024,
	})

	app.Use(logger.New(logger.Config{
		Format: "${time} [${ip}] ${status} ${latency} ${method} ${path}\n",
	}))

	app.Use(compress.New(compress.Config{
		Level: compress.LevelDefault,
	}))

	// Init GoogleOAuth configured
	oauth.InitializeGoogleOAuth()

	// Init CMUOAuth configured
	oauth.LoadCMUOAuthConfig()

	// Initialize MinIO storage
	minioClient, err := storage.MinioConnection()
	if err != nil {
		log.Fatalf("Failed to connect to MinIO: %v", err)
	}

	// Connect to postgres database
	db := database.ConnectPostgres(true)

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Failed to get sql.DB: %v", err)
	}
	defer func() {
		if err := sqlDB.Close(); err != nil {
			log.Printf("Failed to close DB: %v", err)
		}
	}()

	initDependencies(app, db, minioClient)

	go gracefulShutdown(app)

	log.Println("Server is running on port: ", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func gracefulShutdown(app *fiber.App) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server gracefully...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := app.ShutdownWithContext(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	}
	log.Println("Server exited")
}

func initDependencies(app *fiber.App, db *gorm.DB, minioClient *minio.Client) {
	minioRepo := adapters.NewMinIORepository(minioClient, os.Getenv("MINIO_BUCKET_NAME"))
	minioService := services.NewMinIOService(minioRepo)
	_ = adapters.NewHttpMinIOHandler(minioService)

	userRepo := adapters.NewGormUserRepository(db)
	userService := services.NewUserService(userRepo)

	oauthRepo := adapters.NewOAuthRepository()
	oauthService := services.NewOAuthService(oauthRepo)
	oauthHandler := adapters.NewHttpOAuthHandler(oauthService, userService)

	cmuOAuthRepo := adapters.NewCMUOAuthRepository()
	cmuOAuthService := services.NewCMUOAuthService(cmuOAuthRepo, userRepo)
	cmuOAuthHandler := adapters.NewHttpCMUOAuthHandler(cmuOAuthService)

	userHandler := adapters.NewHttpUserHandler(userService, oauthService)

	universityRepo := adapters.NewGormUniversityRepository(db)
	universityService := services.NewUniversityService(universityRepo)
	universityHandler := adapters.NewHttpUniversityHandler(universityService)

	userGroupRepo := adapters.NewGormUserGroupRepository(db)
	userGroupService := services.NewUserGroupService(userGroupRepo)
	userGroupHandler := adapters.NewHttpUserGroupHandler(userGroupService)

	sectionRepo := adapters.NewGormSectionRepository(db)
	sectionService := services.NewSectionService(sectionRepo)
	sectionHandler := adapters.NewHttpSectionHandler(sectionService)

	courseRepo := adapters.NewGormCourseRepository(db)
	courseService := services.NewCourseService(courseRepo)
	courseHandler := adapters.NewHttpCourseHandler(courseService, userService)

	assignmentRepo := adapters.NewGormAssignmentRepository(db)
	assignmentService := services.NewAssignmentService(assignmentRepo, courseRepo)
	assignmentHandler := adapters.NewHttpAssignmentHandler(assignmentService)

	instructorRepo := adapters.NewGormInstructorRepository(db)
	instructorService := services.NewInstructorService(instructorRepo, courseRepo, minioRepo, sectionRepo)
	instructorHandler := adapters.NewHttpInstructorHandler(instructorService, minioService, sectionService)

	studentRepo := adapters.NewGormStudentRepository(db)
	studentService := services.NewStudentService(studentRepo, minioRepo)
	studentHandler := adapters.NewHttpStudentHandler(studentService, minioService)

	routes.RegisterRoutes(app, oauthHandler, cmuOAuthHandler, userHandler, universityHandler, userGroupHandler,
		sectionHandler, courseHandler, assignmentHandler,
		instructorHandler, studentHandler,
	)
}
