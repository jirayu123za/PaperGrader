// workers/export_grades.go
package workers

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"paperGrader/internal/models"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"
)

type ExportGradesWorker struct {
	DB             *gorm.DB
	Minio          *minio.Client
	Bucket         string
	PublicEndpoint string
	PublicUseSSL   bool
}

func (w *ExportGradesWorker) ProcessPendingOnce(ctx context.Context) error {
	const batch = 5

	var jobs []models.ExportGrade
	if err := w.DB.
		Where("file_status = ? AND deleted_at IS NULL", models.FileStatusPending).
		Order("created_at ASC").
		Limit(batch).
		Find(&jobs).Error; err != nil {
		return err
	}

	for _, job := range jobs {
		if err := w.processOne(ctx, job); err != nil {
			log.Printf("[export-grades] job %s failed: %v", job.ExportGradeID, err)
			_ = w.updateStatus(job.ExportGradeID, models.FileStatusFailed, "", nil)
		}
	}

	return nil
}

func (w *ExportGradesWorker) processOne(ctx context.Context, job models.ExportGrade) error {
	var a struct{ AssignmentName string }
	if err := w.DB.Table("assignments").
		Select("assignment_name").
		Where("assignment_id = ? AND deleted_at IS NULL", job.AssignmentID).
		Take(&a).Error; err != nil {
		return fmt.Errorf("assignment not found: %w", err)
	}

	fileName := job.FileName
	if strings.TrimSpace(fileName) == "" {
		fileName = fmt.Sprintf("%s-score.xlsx", slug(a.AssignmentName))
	}

	// 1) create excel file locally
	f := excelize.NewFile()
	tmpPath := filepath.Join(os.TempDir(), fileName)
	if err := f.SaveAs(tmpPath); err != nil {
		return fmt.Errorf("save temp excel failed: %w", err)
	}
	defer os.Remove(tmpPath)

	// 2) Upload to MinIO
	objectName := fmt.Sprintf("exports/%s/%s/%s", job.CourseID, job.AssignmentID, fileName)
	file, err := os.Open(tmpPath)
	if err != nil {
		return fmt.Errorf("open temp failed: %w", err)
	}
	defer file.Close()

	stat, _ := file.Stat()
	_, err = w.Minio.PutObject(ctx, w.Bucket, objectName, file, stat.Size(), minio.PutObjectOptions{
		ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	})
	if err != nil {
		return fmt.Errorf("minio put object failed: %w", err)
	}

	// 3) Create URL (public path based on your env)
	scheme := "http"
	if w.PublicUseSSL {
		scheme = "https"
	}
	fileURL := fmt.Sprintf("%s://%s/%s/%s", scheme, w.PublicEndpoint, w.Bucket, objectName)

	// 4) Update status to completed
	now := time.Now()
	return w.updateStatus(job.ExportGradeID, models.FileStatusCompleted, fileURL, &now)
}

func (w *ExportGradesWorker) updateStatus(exportID uuid.UUID, status models.FileStatusEnum, url string, processedAt *time.Time) error {
	update := map[string]interface{}{
		"file_status": status,
	}
	if url != "" {
		update["file_url"] = url
	}
	if processedAt != nil {
		update["processed_at"] = *processedAt
	}
	return w.DB.Model(&models.ExportGrade{}).
		Where("export_grade_id = ?", exportID).
		Updates(update).Error
}

// local helper
func slug(s string) string {
	s = strings.TrimSpace(strings.ToLower(s))
	s = strings.ReplaceAll(s, " ", "-")
	var b strings.Builder
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			b.WriteRune(r)
		}
	}
	if b.Len() == 0 {
		return "export"
	}
	return b.String()
}
