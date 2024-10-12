package adapters

import (
	"context"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

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

func (r *MinIORepository) SaveFileToMinIO(file multipart.File, userGroupName, userName, fileName string) error {
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

	objectName := filepath.Join(userGroupName, userName, fileName)
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
	if strings.HasSuffix(fileName, ".pdf") {
		contentType = "application/pdf"
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
