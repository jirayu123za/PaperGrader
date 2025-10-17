package storage

import (
	"context"
	"log"
	"os"
	"strings"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

func NewMinioClientsFromEnv() (internal *minio.Client, public *minio.Client, bucket string, ttl time.Duration, err error) {
	endpointInternal := os.Getenv("MINIO_ENDPOINT")
	endpointPublic := os.Getenv("MINIO_PUBLIC_ENDPOINT")
	if endpointPublic == "" {
		endpointPublic = endpointInternal
	}

	region := os.Getenv("MINIO_REGION")
	useSSLInternal := strings.EqualFold(os.Getenv("MINIO_USE_SSL"), "true")
	useSSLPublic := strings.EqualFold(os.Getenv("MINIO_PUBLIC_USE_SSL"), "true")

	accessKey := os.Getenv("MINIO_ACCESS_KEY")
	secretKey := os.Getenv("MINIO_SECRET_KEY")
	bucket = os.Getenv("MINIO_BUCKET_NAME")
	ttlStr := os.Getenv("MINIO_PRESIGN_TTL")
	ttl, _ = time.ParseDuration(ttlStr)
	internal, err = minio.New(endpointInternal, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSLInternal,
		Region: region,
	})
	if err != nil {
		return
	}

	public, err = minio.New(endpointPublic, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSLPublic,
		Region: region,
	})
	if err != nil {
		return
	}

	ctx := context.Background()
	exists, e := internal.BucketExists(ctx, bucket)
	if e == nil && !exists {
		if e = internal.MakeBucket(ctx, bucket, minio.MakeBucketOptions{}); e != nil {
			log.Println("Cannot create bucket:", e)
		}
	}

	return
}
