package adapters

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/url"
	"path/filepath"
	"strings"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/pdfcpu/pdfcpu/pkg/api"
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

	_, err = r.client.PutObject(ctx, r.bucketName, objectName, file, -1, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return err
	}

	return nil
}

func (r *MinIORepository) AddCroppedImage(CourseID, AssignmentID, fileName string, fileData []byte) error {
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

	objectName := filepath.Join(CourseID, AssignmentID, "bounding-box", fileName)
	objectName = strings.ReplaceAll(objectName, "\\", "/")

	_, err = r.client.PutObject(ctx, r.bucketName, objectName, bytes.NewReader(fileData), int64(len(fileData)), minio.PutObjectOptions{
		ContentType: "image/png",
	})

	if err != nil {
		return err
	}
	return nil
}

func (r *MinIORepository) FindSubmissionFile(CourseID, AssignmentID, fileName string) ([]byte, error) {
	ctx := context.Background()
	objectName := filepath.Join(CourseID, AssignmentID, fileName)
	objectName = strings.ReplaceAll(objectName, "\\", "/")

	object, err := r.client.GetObject(ctx, r.bucketName, objectName, minio.GetObjectOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve file from MinIO: %v", err)
	}
	defer object.Close()

	fileBuffer := new(bytes.Buffer)
	if _, err := io.Copy(fileBuffer, object); err != nil {
		return nil, fmt.Errorf("failed to read file buffer: %v", err)
	}

	return fileBuffer.Bytes(), nil
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

func (r *MinIORepository) FindFilesAndNames(CourseID, AssignmentID, fileNames []string) ([]string, []string, error) {
	ctx := context.Background()
	var fileURLs []string
	var fileNamesResult []string

	for _, fileName := range fileNames {
		objectName := filepath.Join(CourseID[0], AssignmentID[0], fileName)
		objectName = strings.ReplaceAll(objectName, "\\", "/")

		reqParams := make(url.Values)
		presignedURL, err := r.client.PresignedGetObject(ctx, r.bucketName, objectName, time.Minute*15, reqParams)
		if err != nil {
			return nil, nil, err
		}

		fileURLs = append(fileURLs, presignedURL.String())
		fileNamesResult = append(fileNamesResult, fileName)
	}

	return fileURLs, fileNamesResult, nil
}

func (r *MinIORepository) FindFileURLSubmissionBoxes(CourseID, AssignmentID, fileName string) (string, error) {
	reqParams := make(url.Values)
	ctx := context.Background()
	objectName := filepath.Join(CourseID, AssignmentID, fileName)
	objectName = strings.ReplaceAll(objectName, "\\", "/")

	presignedURL, err := r.client.PresignedGetObject(ctx, r.bucketName, objectName, time.Minute*15, reqParams)
	if err != nil {
		return "", err
	}
	return presignedURL.String(), nil
}

func (r *MinIORepository) FindTemplatePageCountFromMinIO(CourseID, AssignmentID, fileName string) (int, error) {
	ctx := context.Background()
	objectName := filepath.Join(CourseID, AssignmentID, fileName)
	objectName = strings.ReplaceAll(objectName, "\\", "/")
	log.Println(objectName)

	object, err := r.client.GetObject(ctx, r.bucketName, objectName, minio.GetObjectOptions{})
	if err != nil {
		return 0, fmt.Errorf("failed to retrieve file from MinIO: %v", err)
	}
	defer object.Close()

	fileBuffer := new(bytes.Buffer)
	if _, err := io.Copy(fileBuffer, object); err != nil {
		return 0, fmt.Errorf("failed to read file buffer: %v", err)
	}

	pageCount, err := api.PageCount(bytes.NewReader(fileBuffer.Bytes()), nil)
	if err != nil {
		return 0, fmt.Errorf("failed to count PDF pages: %v", err)
	}

	return pageCount, nil
}

func (r *MinIORepository) FindFilesBoundingBoxesNameAndID(CourseID, AssignmentID string, fileNames []string) (string, string, error) {
	var nameURL, idURL string

	for _, fileName := range fileNames {
		if strings.Contains(fileName, "_name") {
			url, err := r.FindFileURLSubmissionBoxes(CourseID, AssignmentID, fileName)
			if err != nil {
				return "", "", fmt.Errorf("failed to get name file URL: %v", err)
			}
			nameURL = url
		} else if strings.Contains(fileName, "_id") {
			url, err := r.FindFileURLSubmissionBoxes(CourseID, AssignmentID, fileName)
			if err != nil {
				return "", "", fmt.Errorf("failed to get id file URL: %v", err)
			}
			idURL = url
		}
	}

	return nameURL, idURL, nil
}
