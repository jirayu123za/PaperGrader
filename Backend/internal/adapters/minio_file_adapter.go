package adapters

import (
	"context"
	"io"
	"log"
	"net/url"
	"paperGrader/internal/models"
	"time"

	"github.com/minio/minio-go/v7"
)

type MinIOFileRepository struct {
	client     *minio.Client
	bucketName string
}

func NewMinIOFileRepository(client *minio.Client, bucketName string) *MinIOFileRepository {
	return &MinIOFileRepository{
		client:     client,
		bucketName: bucketName,
	}
}

func (r *MinIOFileRepository) SaveFile(file *models.File, fileContent io.Reader) error {
	// Implement the MinIO file upload logic
	ctx := context.Background()

	_, err := r.client.PutObject(ctx, r.bucketName, file.Name, fileContent, -1, minio.PutObjectOptions{})
	if err != nil {
		log.Printf("Failed to upload file to MinIO: %v", err)
		return err
	}

	file.URL = "http://localhost:9000/" + r.bucketName + "/" + file.Name
	return nil
}

func (r *MinIOFileRepository) FindFileByID(fileName string) (*models.File, error) {
	ctx := context.Background()
	//fileKey := "System Design.pdf"
	fileKey := fileName

	_, err := r.client.StatObject(ctx, r.bucketName, fileKey, minio.StatObjectOptions{})
	if err != nil {
		log.Printf("Failed to retrieve file metadata from MinIO: %v", err)
		return nil, err
	}

	fileURL := "http://localhost:9000/" + r.bucketName + "/" + fileKey

	file := &models.File{
		Name: fileKey,
		URL:  fileURL,
	}

	return file, nil
}

func (r *MinIOFileRepository) UpdateFile(file *models.File) error {
	return nil
}

func (r *MinIOFileRepository) RemoveFile(file *models.File) error {
	ctx := context.Background()
	err := r.client.RemoveObject(ctx, r.bucketName, file.ID.String(), minio.RemoveObjectOptions{})
	if err != nil {
		log.Printf("Failed to delete file from MinIO: %v", err)
		return err
	}
	return nil
}

func (r *MinIOFileRepository) FindFileURL(fileName string) (string, error) {
	ctx := context.Background()
	reqParams := make(url.Values)
	presignedURL, err := r.client.PresignedGetObject(ctx, r.bucketName, fileName, time.Hour, reqParams)
	if err != nil {
		log.Printf("Failed to generate presigned URL: %v", err)
		return "", err
	}
	return presignedURL.String(), nil
}
