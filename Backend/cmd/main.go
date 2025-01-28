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

	minioRepo := adapters.NewMinIORepository(minioClient, os.Getenv("MINIO_BUCKET_NAME"))
	minioService := services.NewMinIOService(minioRepo)
	_ = adapters.NewHttpMinIOHandler(minioService)

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

	// Routes
	api := app.Group("/")
	apiGroup := api.Group("/api")
	apiGroup.Get("/check", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message": "Server is running",
			"error":   nil,
		})
	})

	apiGroup.Get("/google", oauthHandler.GetGoogleLoginURL)
	apiGroup.Get("/google/callback", oauthHandler.GetGoogleCallBack)
	apiGroup.Get("/google/callback/verify", oauthHandler.VerifyGoogleCallback)

	apiGroup.Post("/user", userHandler.CreateUser)
	apiGroup.Get("/user/:googleID", userHandler.GetUserByID)
	apiGroup.Post("/user/logout", userHandler.DeleteJWT)

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

	apiGroup.Get("/sections", sectionHandler.GetSectionsDetailsByCourseID)
	apiGroup.Get("/sections/assignment", sectionHandler.GetSectionsByAssignmentID)
	apiGroup.Get("/sections/name", sectionHandler.GetSectionsNameByCourseID)
	apiGroup.Post("/sections", sectionHandler.CreateSection)

	apiGroup.Post("/assignment", assignmentHandler.CreateAssignment)
	apiGroup.Get("/assignment", assignmentHandler.GetAssignmentByAssignmentID)
	apiGroup.Get("/assignments", assignmentHandler.GetAssignments)
	apiGroup.Get("/assignment/course", assignmentHandler.GetAssignmentsByCourseID)
	apiGroup.Put("/assignment", assignmentHandler.UpdateAssignment)
	apiGroup.Delete("/assignment", assignmentHandler.DeleteAssignment)

	// Instructor list
	apiGroup.Get("/instructorsList", instructorHandler.GetInstructorsNameByCourseID)

	// Roster management
	apiGroup.Get("/instructors/roster", instructorHandler.GetRosterByCourseID)
	apiGroup.Get("/instructor/roster/personal", instructorHandler.GetPersonalDataByIDAndCourseID)
	apiGroup.Get("/instructor/roster/section", instructorHandler.GetRosterSectionByCourseID)
	apiGroup.Get("/instructor/roster/section/user", instructorHandler.GetRosterByCourseIDAndSectionID)
	apiGroup.Post("/instructor/roster", instructorHandler.CreateSingleUserRoster)
	apiGroup.Post("/instructor/rosters", instructorHandler.CreateMultipleUserRoster)

	// File form add multiple users
	apiGroup.Post("/instructor/roster/file", instructorHandler.GetColumnsAndDataFromUploadedFile)
	apiGroup.Post("/instructor/roster/optionFile", instructorHandler.GetColumnsAndDataFromOptionFile)

	apiGroup.Post("/instructor/assignment/files", instructorHandler.CreateAssignmentWithFiles)
	apiGroup.Get("/instructor/assignments/sections", instructorHandler.GetInsAssignmentByCourseID)
	apiGroup.Get("/instructor/assignments", instructorHandler.GetAssignmentsByCourseID)
	apiGroup.Get("/instructor/assignments/active", instructorHandler.GetActiveAssignmentsByCourseID)
	apiGroup.Get("/instructor/assignment", instructorHandler.GetAssignmentByCourseIDAndAssignmentID)

	apiGroup.Get("/instructor/assignment/process", instructorHandler.GetAssignmentDetails)
	apiGroup.Put("/instructor/assignment", instructorHandler.UpdateAssignmentAndAssignmentSection)

	apiGroup.Get("/instructor/courses", instructorHandler.GetCoursesByUserID)
	apiGroup.Get("/instructor/course", instructorHandler.GetCourseByCourseID)

	// test api get template file name
	apiGroup.Get("/instructor/template/name", instructorHandler.GetAssignmentNameTemplate)
	apiGroup.Get("/instructor/template/url", instructorHandler.GetPDFTemplateWithURL)
	//!
	apiGroup.Get("/instructor/submissions", instructorHandler.GetFileFormSubmission)
	apiGroup.Get("/instructor/submissionsList", instructorHandler.GetSubmissionListByCourseIDAndAssignmentID)

	// Bounding Box
	apiGroup.Post("/instructor/boundingBoxes", instructorHandler.CreateBoundingBoxesAndQuestions)
	apiGroup.Get("/instructor/boundingBoxes", instructorHandler.GetBoundingBoxesByAssignmentTemplate)
	apiGroup.Put("/instructor/boundingBoxes", instructorHandler.UpdateBoundingBoxes)
	apiGroup.Delete("/instructor/boundingBoxes", instructorHandler.DeleteBoundingBoxes)

	// Questions
	apiGroup.Get("/instructor/questions", instructorHandler.GetQuestionsByAssignmentTemplate)

	apiGroup.Get("/student/dashboard", studentHandler.GetCoursesAndAssignments)
	// test api get pdf files name
	apiGroup.Get("/student/files", studentHandler.GetAssignmentNamesWithCourseIDAndAssignmentID)
	apiGroup.Get("/student/files/download", studentHandler.GetPDFFileNamesAndURLs)
	apiGroup.Post("/student/file", studentHandler.CreateSubmissionFile)
	apiGroup.Get("/student/courses", studentHandler.GetCoursesByUserID)
	apiGroup.Get("/student/course", studentHandler.GetCourseByCourseID)
	apiGroup.Get("/student/assignments", studentHandler.GetAssignmentsByCourseID)

	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
	fmt.Println("Server is running on port: ", port)
}
