package adapters

import (
	"log"
	"net/url"
	"paperGrader/internal/core/services"
	"paperGrader/internal/models"

	"github.com/gofiber/fiber/v2"
)

// Primary adapter
type HttpFileHandler struct {
	services services.FileService
}

func NewHttpFileHandler(services services.FileService) *HttpFileHandler {
	return &HttpFileHandler{
		services: services,
	}
}

func (h *HttpFileHandler) CreateFile(c *fiber.Ctx) error {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Failed to get file from request",
			"message": err.Error(),
		})
	}

	file := &models.File{
		Name: fileHeader.Filename,
	}

	fileContent, err := fileHeader.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to open file",
			"message": err.Error(),
		})
	}
	defer fileContent.Close()

	if err := h.services.CreateFile(file, fileContent); err != nil {
		log.Printf("Error creating file: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to save file to bucket",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "file was save to bucket",
		"file":    file,
	})
}

func (h *HttpFileHandler) GetFileByID(c *fiber.Ctx) error {
	fileName := c.Params("name")

	decodedFileName, err := url.PathUnescape(fileName)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Failed to decode file name",
			"message": err.Error(),
		})
	}

	log.Printf("Decoded file name: %s", decodedFileName)

	if decodedFileName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Object name cannot be empty",
			"message": "file not found",
		})
	}

	file, err := h.services.GetFileByID(decodedFileName)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "file not found",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"file": file,
	})
}

func (h *HttpFileHandler) UpdateFile(c *fiber.Ctx) error {
	return nil
}

func (h *HttpFileHandler) DeleteFile(c *fiber.Ctx) error {
	return nil
}
