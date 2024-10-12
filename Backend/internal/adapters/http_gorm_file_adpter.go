package adapters

import (
	"fmt"
	"paperGrader/internal/core/services"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
)

// Primary adapter
type HttpMinIOHandler struct {
	services services.MinIOService
}

func NewHttpMinIOHandler(services services.MinIOService) *HttpMinIOHandler {
	return &HttpMinIOHandler{
		services: services,
	}
}

func (h *HttpMinIOHandler) SaveFileToMinIO(c *fiber.Ctx) error {
	userGroupName := c.FormValue("user_group_name")
	userName := c.FormValue("user_name")

	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Failed to get form data",
			"error":   err.Error(),
		})
	}

	files := form.File["files"]
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to open file",
				"error":   err.Error(),
			})
		}
		defer file.Close()

		fileExtension := filepath.Ext(fileHeader.Filename)

		if err := h.services.CreateFileToMinIO(file, userGroupName, userName, fileExtension); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": fmt.Sprintf("Failed to upload file %s to MinIO", fileHeader.Filename),
				"error":   err.Error(),
			})
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Files uploaded successfully",
	})
}
