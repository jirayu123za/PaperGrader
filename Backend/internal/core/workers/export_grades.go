// workers/export_grades.go
package workers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
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
	// 0) Prepare file name
	assName, err := w.getAssignmentName(job.AssignmentID)
	if err != nil {
		return fmt.Errorf("get assignment name: %w", err)
	}

	fileName := job.FileName
	if strings.TrimSpace(fileName) == "" {
		fileName = fmt.Sprintf("%s-score.xlsx", slug(assName))
	}

	// 1) Query “Columns” of assignment: description + full score
	cols, maxPoints, err := w.getAssignmentColumns(job.AssignmentID)
	if err != nil {
		return fmt.Errorf("get assignment columns: %w", err)
	}

	// 2) Query submissions (including student information and section)
	subs, err := w.getSubmissionRows(job.AssignmentID)
	if err != nil {
		return fmt.Errorf("get submissions: %w", err)
	}

	// 3) Query scores for each submission
	scoreMap, gradedSet, err := w.getScoresBySubmission(job.AssignmentID, cols)
	if err != nil {
		return fmt.Errorf("get scores: %w", err)
	}

	// 4) Create Excel file and fill data
	tmpPath, err := w.buildExcelFile(fileName, assName, cols, maxPoints, subs, scoreMap, gradedSet)
	if err != nil {
		return fmt.Errorf("build excel: %w", err)
	}
	defer os.Remove(tmpPath)

	// 5) Upload to MinIO + Create URL
	objectName := fmt.Sprintf("exports/%s/%s/%s", job.CourseID, job.AssignmentID, fileName)
	if err := w.putObject(ctx, objectName, tmpPath); err != nil {
		return fmt.Errorf("minio put: %w", err)
	}
	fileURL := w.publicURL(objectName)

	now := time.Now()
	return w.updateStatus(job.ExportGradeID, models.FileStatusCompleted, fileURL, &now)
}

func (w *ExportGradesWorker) getAssignmentName(assignmentID uuid.UUID) (string, error) {
	var out string
	err := w.DB.
		Table("assignments").
		Select("assignment_name").
		Where("assignment_id = ? AND deleted_at IS NULL", assignmentID).
		Take(&out).Error
	if err != nil {
		return "", err
	}
	return out, nil
}

// =====================================================
// 2) Structure JSON of rubric_data and grade_data
// =====================================================

type rubricData struct {
	Questions []rubricQuestion `json:"questions_data"`
}

type rubricQuestion struct {
	QuestionID    uuid.UUID           `json:"question_id"`
	QuestionTitle string              `json:"question_title"`
	QuestionPoint float64             `json:"question_point"`
	BoundingBoxID *uuid.UUID          `json:"bounding_box_id,omitempty"`
	Rubrics       *rubricBlock        `json:"rubrics,omitempty"`
	SubQuestions  []rubricSubQuestion `json:"sub_questions,omitempty"`
}

type rubricSubQuestion struct {
	SubQuestionID    uuid.UUID    `json:"sub_question_id"`
	SubQuestionTitle string       `json:"sub_question_title"`
	SubQuestionPoint float64      `json:"sub_question_point"`
	BoundingBoxID    *uuid.UUID   `json:"bounding_box_id,omitempty"`
	Rubrics          *rubricBlock `json:"rubrics,omitempty"`
}

type rubricBlock struct {
	HasFloor      bool           `json:"has_floor"`
	HasCeiling    bool           `json:"has_ceiling"`
	RubricID      uuid.UUID      `json:"rubric_id"`
	RubricDetails []rubricDetail `json:"rubric_details"`
	RubricSetting string         `json:"rubric_setting"`
}

type rubricDetail struct {
	HasSelected       bool      `json:"has_selected"`
	RubricPoint       float64   `json:"rubric_point"`
	RubricDetailID    uuid.UUID `json:"rubric_detail_id"`
	RubricDescription string    `json:"rubric_description"`
}

// grade_data has same rubric_data but add + has_graded
type gradeData struct {
	Questions []gradeQuestion `json:"questions_data"`
}

type gradeQuestion struct {
	QuestionID    uuid.UUID          `json:"question_id"`
	QuestionTitle string             `json:"question_title"`
	QuestionPoint float64            `json:"question_point"`
	BoundingBoxID *uuid.UUID         `json:"bounding_box_id,omitempty"`
	Rubrics       *gradeRubricBlock  `json:"rubrics,omitempty"`
	SubQuestions  []gradeSubQuestion `json:"sub_questions,omitempty"`
}

type gradeSubQuestion struct {
	SubQuestionID    uuid.UUID         `json:"sub_question_id"`
	SubQuestionTitle string            `json:"sub_question_title"`
	SubQuestionPoint float64           `json:"sub_question_point"`
	BoundingBoxID    *uuid.UUID        `json:"bounding_box_id,omitempty"`
	GradesMeta       *gradesMeta       `json:"grades,omitempty"`
	Rubrics          *gradeRubricBlock `json:"rubrics,omitempty"`
}

type gradesMeta struct {
	HasGraded bool       `json:"has_graded"`
	GradedAt  *time.Time `json:"graded_at,omitempty"`
	GradedBy  *uuid.UUID `json:"graded_by,omitempty"`
}

type gradeRubricBlock struct {
	HasFloor      bool                `json:"has_floor"`
	HasCeiling    bool                `json:"has_ceiling"`
	RubricID      uuid.UUID           `json:"rubric_id"`
	RubricDetails []gradeRubricDetail `json:"rubric_details"`
	RubricSetting string              `json:"rubric_setting"`
}

type gradeRubricDetail struct {
	HasSelected       bool      `json:"has_selected"`
	RubricPoint       float64   `json:"rubric_point"`
	RubricDetailID    uuid.UUID `json:"rubric_detail_id"`
	RubricDescription string    `json:"rubric_description"`
}

// =====================================================
// 3) Structure Excel (same as above but "Number" will come from index if JSON is missing)
// =====================================================

type questionCol struct {
	Key           string
	Number        string
	Title         string
	MaxPoints     float64
	QuestionID    uuid.UUID
	SubQuestionID uuid.UUID
	OrderIndex    int
}

// =====================================================
// 4) Transform rubric_data → columns in Excel
//    Get rubric JSONB from table rubrics (rename/convert to questionCol)
// =====================================================

func (w *ExportGradesWorker) getAssignmentColumns(assignmentID uuid.UUID) ([]questionCol, float64, error) {
	// Get rubric JSONB from table rubrics (assume: rubrics.rubric_data)
	var row struct {
		Data []byte `gorm:"column:rubric_data"`
	}
	if err := w.DB.
		Table("rubrics").
		Select("rubric_data").
		Where("assignment_id = ? AND deleted_at IS NULL", assignmentID).
		Take(&row).Error; err != nil {
		return nil, 0, fmt.Errorf("rubric not found: %w", err)
	}

	var rd rubricData
	if err := json.Unmarshal(row.Data, &rd); err != nil {
		return nil, 0, fmt.Errorf("parse rubric_data: %w", err)
	}

	var cols []questionCol
	order := 0
	var maxPointsSum float64

	for qi, q := range rd.Questions {
		qNum := fmt.Sprintf("%d", qi+1)

		if len(q.SubQuestions) > 0 {
			for si, sq := range q.SubQuestions {
				num := fmt.Sprintf("%s.%d", qNum, si+1)
				cols = append(cols, questionCol{
					Key:           "sq:" + sq.SubQuestionID.String(),
					Number:        num,
					Title:         safeTitle(sq.SubQuestionTitle),
					MaxPoints:     sq.SubQuestionPoint,
					QuestionID:    q.QuestionID,
					SubQuestionID: sq.SubQuestionID,
					OrderIndex:    order,
				})
				order++
				maxPointsSum += sq.SubQuestionPoint
			}
		} else {
			// No sub → use main question as column
			cols = append(cols, questionCol{
				Key:        "q:" + q.QuestionID.String(),
				Number:     qNum,
				Title:      safeTitle(q.QuestionTitle),
				MaxPoints:  q.QuestionPoint,
				QuestionID: q.QuestionID,
				OrderIndex: order,
			})
			order++
			maxPointsSum += q.QuestionPoint
		}
	}

	sort.SliceStable(cols, func(i, j int) bool { return cols[i].OrderIndex < cols[j].OrderIndex })
	return cols, maxPointsSum, nil
}

func safeTitle(s string) string {
	if strings.TrimSpace(s) == "" {
		return "(no title)"
	}
	return s
}

// =====================================================
// 5) Query submissions (student info + section)
// =====================================================

type submissionRow struct {
	SubmissionID   uuid.UUID
	SubmissionTime time.Time
	PersonalDataID uuid.UUID
	FirstName      string
	LastName       string
	StudentCode    string
	Email          string
	SectionName    string
}

func (w *ExportGradesWorker) getSubmissionRows(assignmentID uuid.UUID) ([]submissionRow, error) {
	var rows []submissionRow
	return rows, w.DB.
		Table("submissions s").
		Select(`
			s.submission_id,
			s.submitted_at AS submission_time,
			s.belongs_to    AS personal_data_id,
			COALESCE(pd.first_name, '')   AS first_name,
			COALESCE(pd.last_name,  '')   AS last_name,
			COALESCE(pd.student_code,'')  AS student_code,
			COALESCE(pd.email, u.email)   AS email,
			COALESCE(sec.section_name,'') AS section_name
		`).
		Joins(`JOIN users u ON u.user_id = s.submitted_by AND u.deleted_at IS NULL`).
		Joins(`LEFT JOIN personal_data pd ON pd.personal_data_id = s.belongs_to AND pd.deleted_at IS NULL`).
		Joins(`JOIN assignments a ON a.assignment_id = s.assignment_id AND a.deleted_at IS NULL`).
		Joins(`LEFT JOIN enrollment_lists el ON el.personal_data_id = s.belongs_to AND el.course_id = a.course_id AND el.deleted_at IS NULL`).
		Joins(`LEFT JOIN sections sec ON sec.section_id = el.section_id AND sec.deleted_at IS NULL`).
		Where(`s.assignment_id = ? AND s.deleted_at IS NULL`, assignmentID).
		Order(`COALESCE(pd.last_name, u.email) ASC, COALESCE(pd.first_name, u.email) ASC`).
		Scan(&rows).Error
}

// =====================================================
// 6) Query grades.grade_data (JSONB) then map to columns
// =====================================================

// scoreMap[submission_id][col.Key] = float64
// gradedSet[submission_id] = true if has_selected_rubric on any question/sub-question
func (w *ExportGradesWorker) getScoresBySubmission(assignmentID uuid.UUID, cols []questionCol) (map[uuid.UUID]map[string]float64, map[uuid.UUID]bool, error) {
	// reverse index of columns for map from (q_id/sq_id) → key
	qKey := map[uuid.UUID]string{}
	sqKey := map[uuid.UUID]string{}
	maxByKey := map[string]float64{}
	for _, c := range cols {
		maxByKey[c.Key] = c.MaxPoints
		if c.SubQuestionID != uuid.Nil {
			sqKey[c.SubQuestionID] = c.Key
		} else {
			qKey[c.QuestionID] = c.Key
		}
	}

	// Query grade_data every submission under this assignment
	type gdRow struct {
		SubmissionID uuid.UUID
		GradeDataRaw []byte `gorm:"column:grade_data"`
	}
	var rows []gdRow
	err := w.DB.
		Table("grades g").
		Select(`DISTINCT ON (g.submission_id) g.submission_id, g.grade_data`).
		Joins(`JOIN submissions s ON s.submission_id = g.submission_id AND s.deleted_at IS NULL`).
		Where(`s.assignment_id = ? AND g.deleted_at IS NULL`, assignmentID).
		Order(`g.submission_id, COALESCE(g.updated_at, g.created_at) DESC`).
		Scan(&rows).Error
	if err != nil {
		return nil, nil, fmt.Errorf("get grades: %w", err)
	}

	scoreMap := make(map[uuid.UUID]map[string]float64)
	gradedSet := make(map[uuid.UUID]bool)

	for _, r := range rows {
		if len(r.GradeDataRaw) == 0 {
			continue
		}
		var gd gradeData
		if err := json.Unmarshal(r.GradeDataRaw, &gd); err != nil {
			log.Printf("[export] parse grade_data failed sub=%s: %v", r.SubmissionID, err)
			continue
		}

		if _, ok := scoreMap[r.SubmissionID]; !ok {
			scoreMap[r.SubmissionID] = map[string]float64{}
		}

		// loop question in grade_data
		for _, q := range gd.Questions {
			// case: has sub-questions
			if len(q.SubQuestions) > 0 {
				for _, sq := range q.SubQuestions {
					colKey, ok := sqKey[sq.SubQuestionID]
					if !ok {
						continue
					}

					maxPt := maxByKey[colKey]
					graded := (sq.GradesMeta != nil && sq.GradesMeta.HasGraded)
					score := 0.0

					if sq.Rubrics != nil && len(sq.Rubrics.RubricDetails) > 0 {
						setting := strings.ToLower(strings.TrimSpace(sq.Rubrics.RubricSetting))
						score = scoreFromRubricSelection(setting, maxPt, sq.Rubrics.RubricDetails)
						if anySelected(sq.Rubrics.RubricDetails) {
							graded = true
						}
					}

					scoreMap[r.SubmissionID][colKey] = clamp(score, 0, maxPt)
					if graded {
						gradedSet[r.SubmissionID] = true
					}
				}
			} else {
				colKey, ok := qKey[q.QuestionID]
				if !ok {
					continue
				}

				maxPt := maxByKey[colKey]
				graded := false
				score := 0.0
				if q.Rubrics != nil && len(q.Rubrics.RubricDetails) > 0 {
					setting := strings.ToLower(strings.TrimSpace(q.Rubrics.RubricSetting))
					score = scoreFromRubricSelection(setting, maxPt, q.Rubrics.RubricDetails)
					if anySelected(q.Rubrics.RubricDetails) {
						graded = true
					}
				}
				scoreMap[r.SubmissionID][colKey] = clamp(score, 0, maxPt)
				if graded {
					gradedSet[r.SubmissionID] = true
				}
			}
		}
	}
	return scoreMap, gradedSet, nil
}

func anySelected(ds []gradeRubricDetail) bool {
	for _, d := range ds {
		if d.HasSelected {
			return true
		}
	}
	return false
}

// Scoring rules:
// - "negative scoring": start from max then subtract the sum of abs(point) of selected items → clamp [0, max]
// - Others: sum of points of selected items → clamp [0, max]
func scoreFromRubricSelection(setting string, max float64, ds []gradeRubricDetail) float64 {
	switch setting {
	case "negative scoring":
		sumPenalty := 0.0
		for _, d := range ds {
			if d.HasSelected {
				if d.RubricPoint >= 0 {
					sumPenalty += d.RubricPoint
				} else {
					sumPenalty += -d.RubricPoint
				}
			}
		}
		return max - sumPenalty
	default:
		sum := 0.0
		for _, d := range ds {
			if d.HasSelected {
				sum += d.RubricPoint
			}
		}
		return sum
	}
}

func clamp(v, lo, hi float64) float64 {
	if v < lo {
		return lo
	}
	if v > hi {
		return hi
	}
	return v
}

// =====================================================
// 7) Create Excel (Use header to <number>: <title> (<pts> pts))
// =====================================================

func (w *ExportGradesWorker) buildExcelFile(fileName string, assignmentName string, cols []questionCol, maxPoints float64, subs []submissionRow, scoreMap map[uuid.UUID]map[string]float64, gradedSet map[uuid.UUID]bool) (string, error) {
	f := excelize.NewFile()
	sheet := "Assignment Grades"
	first := f.GetSheetName(0)
	_ = f.SetSheetName(first, sheet)

	baseHeaders := []string{
		"No",
		"Name",
		"SID",
		"Email",
		"Sections",
		"Total Score",
		"Max Points",
		"Status",
		"Submission ID",
		"Submission Time",
	}
	for _, c := range cols {
		h := fmt.Sprintf("%s: %s (%.1f pts)", c.Number, c.Title, c.MaxPoints)
		baseHeaders = append(baseHeaders, h)
	}
	if err := f.SetSheetRow(sheet, "A1", &baseHeaders); err != nil {
		return "", err
	}

	for i, s := range subs {
		seq := i + 1
		row := make([]any, 0, len(baseHeaders))
		name := strings.TrimSpace(strings.Join([]string{s.FirstName, s.LastName}, " "))
		if name == "" {
			name = s.Email
		}

		var total float64
		perCol := scoreMap[s.SubmissionID]
		for _, c := range cols {
			if perCol != nil {
				total += perCol[c.Key]
			}
		}

		status := "Submitted"
		if gradedSet[s.SubmissionID] {
			status = "Graded"
		}

		row = append(row,
			seq,
			name,
			s.StudentCode,
			s.Email,
			s.SectionName,
			total,
			maxPoints,
			status,
			s.SubmissionID.String(),
			s.SubmissionTime.Format("2006-01-02 15:04:05"),
		)
		for _, c := range cols {
			val := 0.0
			if perCol != nil {
				val = perCol[c.Key]
			}
			row = append(row, val)
		}

		cell := fmt.Sprintf("A%d", i+2)
		if err := f.SetSheetRow(sheet, cell, &row); err != nil {
			return "", err
		}
	}

	err := f.SetColWidth(sheet, "A", "A", 6)
	if err != nil {
		return "", err
	}
	err = f.SetColWidth(sheet, "B", "E", 20)
	if err != nil {
		return "", err
	}
	err = f.SetColWidth(sheet, "F", "J", 16)
	if err != nil {
		return "", err
	}

	tmpPath := filepath.Join(os.TempDir(), fileName)
	if err := f.SaveAs(tmpPath); err != nil {
		return "", err
	}
	return tmpPath, nil
}

// ---------------------- minio & utils ----------------------
func (w *ExportGradesWorker) putObject(ctx context.Context, objectName, filePath string) error {
	fi, err := os.Stat(filePath)
	if err != nil {
		return err
	}
	f, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer f.Close()

	_, err = w.Minio.PutObject(ctx, w.Bucket, objectName, f, fi.Size(), minio.PutObjectOptions{
		ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	})
	return err
}

func (w *ExportGradesWorker) publicURL(objectName string) string {
	scheme := "http"
	if w.PublicUseSSL {
		scheme = "https"
	}
	return fmt.Sprintf("%s://%s/%s/%s", scheme, w.PublicEndpoint, w.Bucket, objectName)
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
