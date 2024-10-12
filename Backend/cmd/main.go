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

	// Connect to postgres database
	db := database.ConnectPostgres(true)
	//database.ConnectPostgres(true)

	minioRepo := adapters.NewMinIORepository(minioClient, os.Getenv("MINIO_BUCKET_NAME"))
	minioService := services.NewMinIOService(minioRepo)
	_ = adapters.NewHttpMinIOHandler(minioService)

	fileRepo := adapters.NewFileRepository(minioClient, os.Getenv("MINIO_BUCKET_NAME"))
	fileService := services.NewFileService(fileRepo)
	_ = adapters.NewHttpFileHandler(fileService)

	userRepo := adapters.NewGormUserRepository(db)
	userService := services.NewUserService(userRepo)

	oauthRepo := adapters.NewOAuthRepository()
	oauthService := services.NewOAuthService(oauthRepo)
	oauthHandler := adapters.NewHttpOAuthHandler(oauthService, userService)

	userHandler := adapters.NewHttpUserHandler(userService, oauthService)

	universityRepo := adapters.NewGormUniversityRepository(db)
	universityService := services.NewUniversityService(universityRepo)
	universityHandler := adapters.NewHttpUniversityHandler(universityService)

	userGroupRepo := adapters.NewGormUserGroupRepository(db)
	userGroupService := services.NewUserGroupService(userGroupRepo)
	userGroupHandler := adapters.NewHttpUserGroupHandler(userGroupService)

	courseRepo := adapters.NewGormCourseRepository(db)
	courseService := services.NewCourseService(courseRepo)
	courseHandler := adapters.NewHttpCourseHandler(courseService)

	assignmentRepo := adapters.NewGormAssignmentRepository(db)
	assignmentService := services.NewAssignmentService(assignmentRepo, courseRepo)
	assignmentHandler := adapters.NewHttpAssignmentHandler(assignmentService)

	instructorRepo := adapters.NewGormInstructorRepository(db)
	instructorService := services.NewInstructorService(instructorRepo, courseRepo)
	instructorHandler := adapters.NewHttpInstructorHandler(instructorService, fileService, minioService)

	// Routes
	api := app.Group("/")
	apiGroup := api.Group("/api")
	apiGroup.Get("/check", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message": "Server is running",
			"error":   nil,
		})
	})

	//apiGroup.Post("/file", minioHandler.CreateFile)
	//apiGroup.Get("/file", minioHandler.GetFileByID)
	//apiGroup.Get("/file/url", minioHandler.GetFileURL)

	apiGroup.Get("/google", oauthHandler.GetGoogleLoginURL)
	apiGroup.Get("/google/callback", oauthHandler.GetGoogleCallBack)

	apiGroup.Post("/user", userHandler.CreateUser)
	apiGroup.Get("/user/:googleID", userHandler.GetUserByID)

	apiGroup.Post("/university", universityHandler.CreateUniversity)
	apiGroup.Get("/universities", universityHandler.GetUniversities)
	apiGroup.Get("/university", universityHandler.GetUniversityByID)
	apiGroup.Put("/university", universityHandler.UpdateUniversity)
	apiGroup.Delete("/university", universityHandler.DeleteUniversity)

	apiGroup.Post("/userGroup", userGroupHandler.CreateUserGroup)
	apiGroup.Get("/userGroup", userGroupHandler.GetUserGroupByID)
	apiGroup.Get("/userGroups", userGroupHandler.GetUserGroups)
	apiGroup.Put("/userGroup", userGroupHandler.UpdateUserGroup)
	apiGroup.Delete("/userGroup", userGroupHandler.DeleteUserGroup)

	apiGroup.Post("/course", courseHandler.CreateCourse)
	apiGroup.Get("/course", courseHandler.GetCourseByID)
	apiGroup.Get("/courses", courseHandler.GetCourses)
	apiGroup.Put("/course", courseHandler.UpdateCourse)
	apiGroup.Delete("/course", courseHandler.DeleteCourse)

	apiGroup.Post("/instructorList", courseHandler.CreateInstructorList)
	apiGroup.Get("/instructorList", courseHandler.GetInstructorsListByListID)
	apiGroup.Get("/instructorList/", courseHandler.GetInstructorsListByCourseID)
	apiGroup.Get("/instructorLists", courseHandler.GetInstructorsList)
	apiGroup.Delete("/instructorList", courseHandler.DeleteInstructorList)

	apiGroup.Post("/assignment", assignmentHandler.CreateAssignment)
	apiGroup.Get("/assignment", assignmentHandler.GetAssignmentByAssignmentID)
	apiGroup.Get("/assignments", assignmentHandler.GetAssignments)
	apiGroup.Get("/assignment/course", assignmentHandler.GetAssignmentsByCourseID)
	apiGroup.Put("/assignment", assignmentHandler.UpdateAssignment)
	apiGroup.Delete("/assignment", assignmentHandler.DeleteAssignment)

	apiGroup.Post("/instructor/assignment", instructorHandler.CreateAssignment)
	apiGroup.Post("/instructor/assignment/files", instructorHandler.CreateAssignmentWithFiles)
	apiGroup.Get("/instructor/assignments", instructorHandler.GetAssignmentsByCourseID)
	apiGroup.Get("/instructor/courses", instructorHandler.GetCoursesByUserID)
	apiGroup.Get("/instructor/assignments/active", instructorHandler.GetActiveAssignmentsByCourseID)
	apiGroup.Get("/instructorsList", instructorHandler.GetInstructorsNameByCourseID)

	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
	fmt.Println("Server is running on port: ", port)
}
