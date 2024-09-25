package adapters

import (
	"paperGrader/internal/core/services"
	"paperGrader/internal/core/utils"
	"paperGrader/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// Primary adapters
type HttpCourseHandler struct {
	services services.CourseService
}

func NewHttpCourseHandler(services services.CourseService) *HttpCourseHandler {
	return &HttpCourseHandler{
		services: services,
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

	if err := h.services.CreateCourse(&course); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create course",
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

	/*
		userIDParam := c.Query("user_id")
		userID, err := uuid.Parse(userIDParam)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Invalid instructor_id",
				"error":   err.Error(),
			})
		}
	*/

	instructorList := models.InstructorList{
		CourseID: course.CourseID,
		UserID:   userID,
	}

	if err := h.services.CreateInstructorList(course.CourseID, &instructorList); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create instructor list",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":         "Course is created",
		"course":          course,
		"instructor_list": instructorList,
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
	course.Term = newCourse.Term

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

func (h *HttpCourseHandler) DeleteCourse(c *fiber.Ctx) error {
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

	instructorLists, err := h.services.GetInstructorsListByCourseID(courseID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get instructor lists by course ID",
			"error":   err.Error(),
		})
	}

	for _, instructorList := range instructorLists {
		if err := h.services.DeleteInstructorList(instructorList); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to delete instructor list",
				"error":   err.Error(),
			})
		}
	}

	err = h.services.DeleteCourse(course)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to delete course",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Course is deleted",
	})
}

// Under line here be HttpCourseHandler of Instructor list
func (h *HttpCourseHandler) CreateInstructorList(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	var instructorList models.InstructorList
	if err := c.BodyParser(&instructorList); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Failed to parse request body",
			"error":   err.Error(),
		})
	}

	if err := h.services.CreateInstructorList(courseID, &instructorList); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create instructor list",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":         "Instructor list is created",
		"instructor_list": instructorList,
	})
}

func (h *HttpCourseHandler) GetInstructorsList(c *fiber.Ctx) error {
	instructorLists, err := h.services.GetInstructorsList()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get instructor lists",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":          "Instructor lists found",
		"instructor_lists": instructorLists,
	})
}

func (h *HttpCourseHandler) GetInstructorsListByCourseID(c *fiber.Ctx) error {
	courseIDParam := c.Query("course_id")
	courseID, err := uuid.Parse(courseIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid course_id",
			"error":   err.Error(),
		})
	}

	instructorLists, err := h.services.GetInstructorsListByCourseID(courseID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get instructor lists",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":          "Instructor lists found",
		"instructor_lists": instructorLists,
	})
}

func (h *HttpCourseHandler) GetInstructorsListByListID(c *fiber.Ctx) error {
	listIDParam := c.Query("list_id")
	listID, err := uuid.Parse(listIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid list_id",
			"error":   err.Error(),
		})
	}

	instructorList, err := h.services.GetInstructorsListByListID(listID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get instructor list",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":         "Instructor list found",
		"instructor_list": instructorList,
	})
}

func (h *HttpCourseHandler) DeleteInstructorList(c *fiber.Ctx) error {
	listIDParam := c.Query("list_id")
	listID, err := uuid.Parse(listIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid list_id",
			"error":   err.Error(),
		})
	}

	instructorList, err := h.services.GetInstructorsListByListID(listID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	err = h.services.DeleteInstructorList(instructorList)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to delete instructor list",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Instructor list is deleted",
	})
}
