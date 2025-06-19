package routes

import (
	"paperGrader/internal/adapters"

	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(
	app *fiber.App,
	oauthHandler *adapters.HttpOAuthHandler,
	userHandler *adapters.HttpUserHandler,
	universityHandler *adapters.HttpUniversityHandler,
	userGroupHandler *adapters.HttpUserGroupHandler,
	sectionHandler *adapters.HttpSectionHandler,
	courseHandler *adapters.HttpCourseHandler,
	assignmentHandler *adapters.HttpAssignmentHandler,
	instructorHandler *adapters.HttpInstructorHandler,
	studentHandler *adapters.HttpStudentHandler,
) {
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
	apiGroup.Get("/instructor/assignment", instructorHandler.GetAssignmentSettingsDetail)

	apiGroup.Get("/instructor/assignment/process", instructorHandler.GetAssignmentDetails)
	apiGroup.Put("/instructor/assignment", instructorHandler.UpdateAssignmentAndAssignmentSection)

	apiGroup.Get("/instructor/courses", instructorHandler.GetCoursesByUserID)
	apiGroup.Get("/instructor/course", instructorHandler.GetCourseByCourseID)

	// Assignment template url
	apiGroup.Get("/instructor/template/url", instructorHandler.GetPDFTemplateWithURL)

	// Submission
	apiGroup.Post("/instructor/submission/files", instructorHandler.CreateSubmissionFiles)
	apiGroup.Post("/instructor/submission/file", instructorHandler.CreateSubmissionFileByInstructor)
	apiGroup.Get("/instructor/submission/files", instructorHandler.GetSubmissionFiles)
	apiGroup.Get("/instructor/submissions", instructorHandler.GetFileFormSubmission)
	apiGroup.Get("/instructor/submissionsList", instructorHandler.GetSubmissionListByCourseIDAndAssignmentID)
	apiGroup.Get("/instructor/submission/fileURL", instructorHandler.GetSubmissionFileURL)
	apiGroup.Patch("/instructor/submission/manage", instructorHandler.UpdateSubmissionList)
	apiGroup.Get("/instructor/submission/studentList", instructorHandler.GetStudentListForSubmission)
	apiGroup.Get("/instructor/submission/test", instructorHandler.GetAssignmentTemplateCount)

	// OCR data
	apiGroup.Get("/instructor/ocr/studentsList", instructorHandler.GetStudentsListForOCR)
	apiGroup.Get("/instructor/ocr/submissions", instructorHandler.GetSubmissionsList)
	apiGroup.Get("/instructor/ocr/process", instructorHandler.GetProcessOCRForSubmissions)

	// Bounding Box
	apiGroup.Post("/instructor/boundingBoxes", instructorHandler.CreateBoundingBoxesAndQuestions)
	apiGroup.Get("/instructor/boundingBoxes/position", instructorHandler.GetBoundingBoxesTypePosition)
	apiGroup.Delete("/instructor/boundingBoxes", instructorHandler.DeleteBoundingBoxes)

	// Template(outline)
	apiGroup.Get("/instructor/assignment/template", instructorHandler.GetAssignmentTemplateData)

	// Rubric
	apiGroup.Post("/instructor/rubric", instructorHandler.CreateRubric)
	apiGroup.Put("/instructor/rubric", instructorHandler.UpdateRubric)
	apiGroup.Delete("/instructor/rubric", instructorHandler.DeleteRubric)
	// apiGroup.Get("/instructor/rubric", instructorHandler.GetRubricData)

	apiGroup.Get("/student/dashboard", studentHandler.GetCoursesAndAssignments)
	// test api get pdf files name
	apiGroup.Get("/student/files", studentHandler.GetAssignmentNamesWithCourseIDAndAssignmentID)
	apiGroup.Get("/student/files/download", studentHandler.GetPDFFileNamesAndURLs)
	apiGroup.Post("/student/file", studentHandler.CreateSubmissionFile)
	apiGroup.Get("/student/courses", studentHandler.GetCoursesByUserID)
	apiGroup.Get("/student/course", studentHandler.GetCourseByCourseID)
	apiGroup.Get("/student/assignments", studentHandler.GetAssignmentsByCourseID)
}
