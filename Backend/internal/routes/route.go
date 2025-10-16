package routes

import (
	"paperGrader/internal/adapters"

	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(
	app *fiber.App,
	oauthHandler *adapters.HttpOAuthHandler,
	cmuOAuthHandler *adapters.HttpCMUOAuthHandler,
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
	apiGroup := api.Group("/api/v1")

	apiGroup.Get("/check", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message": "Server is running",
			"error":   nil,
		})
	})

	// OAuth routes
	// Part: Google OAuth
	apiGroup.Get("/google", oauthHandler.GetGoogleLoginURL)
	apiGroup.Get("/google/callback", oauthHandler.GetGoogleCallBack)
	apiGroup.Get("/google/callback/verify", oauthHandler.VerifyGoogleCallback)
	// Part: CMU OAuth
	apiGroup.Get("/cmu/authorize", cmuOAuthHandler.GetAuthorizeURL)
	apiGroup.Post("/cmu/exchange", cmuOAuthHandler.ExchangeCode)
	apiGroup.Get("/cmu/userGroup", cmuOAuthHandler.GetUserGroup)

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

	//! new version: update assignment
	apiGroup.Put("/instructor/assignment", instructorHandler.UpdateAssignmentSetting)
	apiGroup.Put("/instructor/assignment/time", instructorHandler.UpdateAssignmentTimeSetting)
	apiGroup.Put("/instructor/assignment/publish/grade", instructorHandler.UpdateAssignmentPublishedGrade)
	apiGroup.Put("/instructor/assignment/publish/assignment", instructorHandler.UpdateAssignmentPublishedAssignment)

	apiGroup.Get("/instructor/courses", instructorHandler.GetCoursesByUserID)
	apiGroup.Get("/instructor/course", instructorHandler.GetCourseByCourseID)

	// Left side bar data
	apiGroup.Get("/instructor/leftSidebar/process", instructorHandler.GetProcessLeftSideBarData)

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
	// Total submissionIDs
	apiGroup.Get("/instructor/submission/totalIDs", instructorHandler.GetTotalSubmissionIDsByHasGrade)

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
	apiGroup.Get("/instructor/assignment/questions", instructorHandler.GetQuestionsList)
	apiGroup.Get("/instructor/assignment/questions/noSubmitted", instructorHandler.GetNoSubmittedQuestionsList)
	// Part:1 Rubric
	apiGroup.Post("/instructor/rubric", instructorHandler.CreateRubric)
	apiGroup.Put("/instructor/rubric", instructorHandler.UpdateRubric)
	apiGroup.Put("/instructor/rubrics", instructorHandler.UpdateRubricIndexes)
	apiGroup.Delete("/instructor/rubric", instructorHandler.DeleteRubric)
	apiGroup.Get("/instructor/rubric", instructorHandler.GetRubric)
	// Part:2 Rubric
	apiGroup.Put("/instructor/rubric/setting", instructorHandler.UpdateRubricSetting)
	apiGroup.Put("/instructor/rubric/scoreBounds", instructorHandler.UpdateRubricScoreBounds)
	// Part:3 Rubric
	apiGroup.Get("/instructor/rubric/graded", instructorHandler.GetRubricAfterGraded)

	// Part:1 Grade
	apiGroup.Post("/instructor/grade", instructorHandler.CreateGrade)

	// Part:1 Export data
	apiGroup.Get("/instructor/assignments/export", instructorHandler.GetAssignmentsListForExport)

	// Submissions from question
	apiGroup.Get("/instructor/submissions/question", instructorHandler.GetSubmissionsFromQuestion)
	// Bounding Boxes data
	apiGroup.Get("/instructor/boundingBoxes/data", instructorHandler.GetBoundingBoxesData)

	// Part:1 Assignment statistics
	apiGroup.Get("/instructor/assignment/statistics", instructorHandler.GetStatisticsDataByAssignmentAndSections)
	// apiGroup.Get("/instructor/assignment/statistics/noQuestions", instructorHandler.GetStatisticsDataNoQuestions)

	// Part-student: route
	apiGroup.Get("/student/dashboard", studentHandler.GetCoursesAndAssignments)
	// Files
	apiGroup.Get("/student/files", studentHandler.GetAssignmentNamesWithCourseIDAndAssignmentID)
	apiGroup.Get("/student/files/download", studentHandler.GetPDFFileNamesAndURLs)
	apiGroup.Post("/student/file", studentHandler.CreateSubmissionFile)
	// Courses
	apiGroup.Get("/student/courses", studentHandler.GetCoursesByUserID)
	apiGroup.Get("/student/course", studentHandler.GetCourseByCourseID)
	// Assignments
	apiGroup.Get("/student/assignments", studentHandler.GetAssignmentsByCourseID)
	// Submissions
	apiGroup.Get("/student/submission/url", studentHandler.GetSubmissionFileFormMinIO)
}
