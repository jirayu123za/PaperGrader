package adapters

import (
	"log"
	"paperGrader/internal/core/services"
	"paperGrader/internal/core/utils"
	"paperGrader/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// Primary adapters
type HttpCourseHandler struct {
	services     services.CourseService
	userServices services.UserService
}

func NewHttpCourseHandler(services services.CourseService, userService services.UserService) *HttpCourseHandler {
	return &HttpCourseHandler{
		services:     services,
		userServices: userService,
	}
}

func (h *HttpCourseHandler) CreateCourse(c *fiber.Ctx) error {
	var course models.Course
	if err := c.BodyParser(&course); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Failed to parse request body",
			"error":   err.Error(),
		})
	}

	userID, err := utils.GetUserIDFromJWT(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid user_id in JWT",
			"error":   err.Error(),
		})
	}
	log.Println(userID)

	userData, err := h.userServices.GetPersonByUserID(userID)
	log.Println(userData)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get person data by user_id",
			"error":   err.Error(),
		})
	}

	if len(userData) == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "No user data found for the given user_id",
		})
	}

	user := userData[0]
	personalData := models.PersonalData{
		StudentCode: utils.GetStringPointer(user, "student_id"),
		FirstName:   utils.GetStringValue(user, "first_name"),
		LastName:    utils.GetStringValue(user, "last_name"),
		Email:       utils.GetStringValue(user, "email"),
		RoleType:    utils.GetStringValue(user, "user_group_name"),
	}

	enrollment := models.EnrollmentList{
		CourseID:  course.CourseID,
		SectionID: nil,
	}

	if err := h.services.CreateCourse(&course, &personalData, &enrollment); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create course",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":    "Course is created",
		"course":     course,
		"enrollment": enrollment,
		"personal":   personalData,
	})
}

func (h *HttpCourseHandler) GetCourses(c *fiber.Ctx) error {
	courses, err := h.services.GetCourses()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get courses",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Course found",
		"courses": courses,
	})
}

func (h *HttpCourseHandler) GetCourseByID(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	course, err := h.services.GetCourseByID(courseID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Course found from query",
		"course":  course,
	})
}

func (h *HttpCourseHandler) UpdateCourse(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	course, err := h.services.GetCourseByID(courseID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	newCourse := new(models.Course)
	if err := c.BodyParser(&newCourse); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Failed to parse request body",
			"error":   err.Error(),
		})
	}

	course.CourseName = newCourse.CourseName
	//course.CourseDescription = newCourse.CourseDescription
	//course.Term = newCourse.Term

	if err := h.services.UpdateCourse(course); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to update course",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Course is updated",
		"course":  course,
	})
}
