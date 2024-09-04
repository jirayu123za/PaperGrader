package storage

import (
	"context"
	"log"
	"os"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

/*
var Store *minio.Storage

func InitMinIO() {
	config.LoadEnv()
	bucketName := os.Getenv("MINIO_BUCKET_NAME")
	endpoint := os.Getenv("MINIO_ENDPOINT")
	accessKey := os.Getenv("MINIO_ACCESS_KEY")
	secretKey := os.Getenv("MINIO_SECRET_KEY")

	Store = minio.New(minio.Config{
		Bucket:   bucketName,
		Endpoint: endpoint,
		Credentials: minio.Credentials{
			AccessKeyID:     accessKey,
			SecretAccessKey: secretKey,
		},
		Secure: false,
	})

	err := Store.CheckBucket()
	if err != nil {
		fmt.Println("Bucket doesn't exist, creating bucket...")

		err = Store.CreateBucket()
		if err != nil {
			log.Fatalf("Failed to create bucket: %v", err)
		}
		fmt.Println("Bucket created successfully.")
	}
}
*/

func MinioConnection() (*minio.Client, error) {
	ctx := context.Background()
	endpoint := os.Getenv("MINIO_ENDPOINT")
	accessKeyID := os.Getenv("MINIO_ACCESS_KEY")
	secretAccessKey := os.Getenv("MINIO_SECRET_KEY")
	useSSL := false
	// Initialize minio client object.
	minioClient, errInit := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: useSSL,
	})
	if errInit != nil {
		log.Fatalln(errInit)
	}

	// Make a new bucket called dev-minio.
	bucketName := os.Getenv("MINIO_BUCKET_NAME")
	location := "us-east-1"

	err := minioClient.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{Region: location})
	if err != nil {
		// Check to see if we already own this bucket (which happens if you run this twice)
		exists, errBucketExists := minioClient.BucketExists(ctx, bucketName)
		if errBucketExists == nil && exists {
			log.Printf("We already own %s\n", bucketName)
		} else {
			log.Fatalln(err)
		}
	} else {
		log.Printf("Successfully created %s\n", bucketName)
	}
	return minioClient, errInit
}
