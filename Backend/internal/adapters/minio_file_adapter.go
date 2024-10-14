package adapters

import (
	"context"
	"io"
	"mime/multipart"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/minio/minio-go/v7"
)

type MinIORepository struct {
	client     *minio.Client
	bucketName string
}

func NewMinIORepository(client *minio.Client, bucketName string) *MinIORepository {
	return &MinIORepository{
		client:     client,
		bucketName: bucketName,
	}
}

func (r *MinIORepository) AddFileToMinIO(file multipart.File, CourseID, AssignmentID, fileName string) error {
	ctx := context.Background()
	exists, err := r.client.BucketExists(ctx, r.bucketName)
	if err != nil {
		return err
	}

	if !exists {
		if err := r.client.MakeBucket(ctx, r.bucketName, minio.MakeBucketOptions{Region: "ap-southeast-1"}); err != nil {
			return err
		}
	}

	objectName := filepath.Join(CourseID, AssignmentID, fileName)
	objectName = strings.ReplaceAll(objectName, "\\", "/")

	tempDir := os.TempDir()
	tempFilePath := filepath.Join(tempDir, fileName)
	tempFile, err := os.Create(tempFilePath)
	if err != nil {
		return err
	}
	defer tempFile.Close()

	_, err = io.Copy(tempFile, file)
	if err != nil {
		return err
	}

	contentType := "application/octet-stream"
	if strings.HasSuffix(fileName, ".png") {
		contentType = "image/png"
	} else if strings.HasSuffix(fileName, ".jpg") || strings.HasSuffix(fileName, ".jpeg") {
		contentType = "image/jpeg"
	} else if strings.HasSuffix(fileName, ".pdf") {
		contentType = "application/pdf"
	} else if strings.HasSuffix(fileName, ".doc") {
		contentType = "application/msword"
	} else if strings.HasSuffix(fileName, ".docx") {
		contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	}

	_, err = r.client.FPutObject(ctx, r.bucketName, objectName, tempFilePath, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return err
	}

	defer os.Remove(tempFilePath)

	return nil
}

func (r *MinIORepository) FindFileFromMinIO(CourseID, AssignmentID, fileName string) (string, error) {
	ctx := context.Background()
	objectName := filepath.Join(CourseID, AssignmentID, fileName)
	objectName = strings.ReplaceAll(objectName, "\\", "/")

	reqParams := make(url.Values)
	presignedURL, err := r.client.PresignedGetObject(ctx, r.bucketName, objectName, time.Minute*15, reqParams)
	if err != nil {
		return "", err
	}

	return presignedURL.String(), nil
}
