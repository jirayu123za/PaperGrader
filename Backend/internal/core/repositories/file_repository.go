package repositories

import (
	"io"
	"paperGrader/internal/models"
)

type FileRepository interface {
	SaveFile(file *models.File, fileContent io.Reader) error
	FindFileByID(fileName string) (*models.File, error)
	UpdateFile(file *models.File) error
	RemoveFile(file *models.File) error
}
