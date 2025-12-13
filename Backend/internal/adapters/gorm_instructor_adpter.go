package adapters

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"paperGrader/internal/adapters/response"
	"paperGrader/internal/core/utils"
	"paperGrader/internal/models"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/xuri/excelize/v2"
	"gorm.io/datatypes"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// Secondary adapters
type GormInstructorRepository struct {
	db *gorm.DB
}

func NewGormInstructorRepository(db *gorm.DB) *GormInstructorRepository {
	return &GormInstructorRepository{
		db: db,
	}
}

// Add assignment to course with out Files(Json)
func (r *GormInstructorRepository) AddAssignment(CourseID uuid.UUID, assignment *models.Assignment) error {
	var existingCourse *models.Course
	if result := r.db.First(&existingCourse, "course_id = ?", CourseID); result.Error != nil {
		return result.Error
	}

	assignment.CourseID = existingCourse.CourseID
	if assignment := r.db.Create(assignment); assignment.Error != nil {
		return assignment.Error
	}
	return nil
}

// News add assignment to course with Files(FromData)
func (r *GormInstructorRepository) AddAssignmentWithFiles(CourseID uuid.UUID, assignment *models.Assignment, files []models.AssignmentFile, uploads []models.Upload, assignmentSections []models.AssignmentSection) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var existingCourse *models.Course
		if result := r.db.First(&existingCourse, "course_id = ?", CourseID); result.Error != nil {
			return result.Error
		}

		for i, file := range files {
			uploads[i].AssignmentFileID = file.AssignmentFileID
			if result := tx.Create(&uploads[i]); result.Error != nil {
				return result.Error
			}
		}

		for _, assignmentSection := range assignmentSections {
			assignmentSection.AssignmentID = assignment.AssignmentID
			if result := tx.Create(&assignmentSection); result.Error != nil {
				return result.Error
			}
		}
		return nil
	})
}

func (r *GormInstructorRepository) ModifyAssignmentSetting(CourseID uuid.UUID, AssignmentID uuid.UUID, assignment *models.Assignment) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		updates := map[string]interface{}{
			"assignment_name":        assignment.AssignmentName,
			"assignment_description": assignment.AssignmentDescription,
			"submitted_by":           assignment.SubmittedBy,
			"late_submitted":         assignment.LateSubmitted,
			"group_submitted":        assignment.GroupSubmitted,
			"regrades":               assignment.Regrades,
		}

		if err := tx.Model(&models.Assignment{}).
			Where("course_id = ? AND assignment_id = ? AND deleted_at IS NULL", CourseID, AssignmentID).
			Updates(updates).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *GormInstructorRepository) ModifyAssignmentTimeSettings(CourseID uuid.UUID, AssignmentID uuid.UUID, sections []models.AssignmentSection) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var existingAssignmentSections []models.AssignmentSection
		if err := tx.Where("assignment_id = ?", AssignmentID).
			Find(&existingAssignmentSections).Error; err != nil {
			return err
		}

		existingSectionMap := make(map[uuid.UUID]uuid.UUID)
		for _, section := range existingAssignmentSections {
			existingSectionMap[section.SectionID] = section.AssignmentSectionID
		}

		for _, section := range sections {
			if assignmentSectionID, exists := existingSectionMap[section.SectionID]; exists {
				fmt.Printf("Updating section %s with ReleaseDate: %v, DueDate: %v, CutOffDate: %v\n",
					section.SectionID, section.ReleaseDate, section.DueDate, section.CutOffDate)

				if result := tx.Model(&models.AssignmentSection{}).
					Where("assignment_section_id = ?", assignmentSectionID).
					Updates(map[string]interface{}{
						"release_date": section.ReleaseDate,
						"due_date":     section.DueDate,
						"cut_off_date": section.CutOffDate,
					}); result.Error != nil {
					return result.Error
				}
			} else {
				continue
			}
		}
		return nil
	})
}

func (r *GormInstructorRepository) ModifyAssignmentGradePublished(CourseID uuid.UUID, payload response.UpdateAssignmentPublishedGradeRequest) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var cnt int64
		if err := tx.Table("assignments").
			Where("assignment_id = ? AND course_id = ? AND deleted_at IS NULL", payload.AssignmentID, CourseID).
			Count(&cnt).Error; err != nil {
			return err
		}
		if cnt == 0 {
			return gorm.ErrRecordNotFound
		}

		cnt = 0
		if err := tx.Table("sections").
			Where("section_id = ? AND course_id = ? AND deleted_at IS NULL", payload.SectionID, CourseID).
			Count(&cnt).Error; err != nil {
			return err
		}
		if cnt == 0 {
			return gorm.ErrRecordNotFound
		}

		updates := map[string]interface{}{
			"published_grade": payload.PublishedGrade,
			"updated_at":      time.Now(),
		}

		txq := tx.Model(&models.AssignmentSection{}).
			Where("assignment_section_id = ? AND assignment_id = ? AND section_id = ? AND deleted_at IS NULL", payload.AssignmentSectionID, payload.AssignmentID, payload.SectionID).
			Updates(updates)
		if txq.Error != nil {
			return txq.Error
		}
		if txq.RowsAffected == 0 {
			return gorm.ErrRecordNotFound
		}
		return nil
	})
}

func (r *GormInstructorRepository) ModifyAssignmentPublishedAssignment(CourseID uuid.UUID, payload response.UpdateAssignmentPublishedAssignmentRequest) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var cnt int64
		if err := tx.Table("assignments").
			Where("assignment_id = ? AND course_id = ? AND deleted_at IS NULL", payload.AssignmentID, CourseID).
			Count(&cnt).Error; err != nil {
			return err
		}
		if cnt == 0 {
			return gorm.ErrRecordNotFound
		}

		cnt = 0
		if err := tx.Table("sections").
			Where("section_id = ? AND course_id = ? AND deleted_at IS NULL", payload.SectionID, CourseID).
			Count(&cnt).Error; err != nil {
			return err
		}
		if cnt == 0 {
			return gorm.ErrRecordNotFound
		}

		updates := map[string]interface{}{
			"published_assignment": payload.PublishedAssignment,
			"updated_at":           time.Now(),
		}

		txq := tx.Model(&models.AssignmentSection{}).
			Where("assignment_section_id = ? AND assignment_id = ? AND section_id = ? AND deleted_at IS NULL", payload.AssignmentSectionID, payload.AssignmentID, payload.SectionID).
			Updates(updates)
		if txq.Error != nil {
			return txq.Error
		}
		if txq.RowsAffected == 0 {
			return gorm.ErrRecordNotFound
		}
		return nil
	})
}

func (r *GormInstructorRepository) FindAssignmentNameTemplate(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileName string, err error) {
	var assignmentFile models.AssignmentFile
	if err := r.db.Table("assignment_files").
		Select("assignment_files.assignment_file_name").
		Joins("JOIN assignments ON assignments.assignment_id = assignment_files.assignment_id").
		Where("assignments.course_id = ? AND assignment_files.assignment_id = ? AND assignment_files.is_template = true AND assignment_files.deleted_at IS NULL", CourseID, AssignmentID).
		First(&assignmentFile).Error; err != nil {
		return "", err
	}
	return assignmentFile.AssignmentFileName, nil
}

func (r *GormInstructorRepository) FindFileFormSubmission(CourseID uuid.UUID, AssignmentID uuid.UUID) (fileNames []string, err error) {
	var submissionFiles []models.Submission
	if err := r.db.Raw(`
		SELECT DISTINCT ON (user_id) submission_file_name
		FROM submissions
		JOIN assignments ON assignments.assignment_id = submissions.assignment_id
		WHERE assignments.course_id = ? AND submissions.assignment_id = ? AND submissions.deleted_at IS NULL
		ORDER BY user_id, submitted_at DESC
	`, CourseID, AssignmentID).Scan(&submissionFiles).Error; err != nil {
		return nil, err
	}

	for _, submissionFile := range submissionFiles {
		fileNames = append(fileNames, submissionFile.SubmissionFileName)
	}

	return fileNames, nil
}

func (r *GormInstructorRepository) FindAssignmentName(CourseID uuid.UUID, AssignmentID uuid.UUID) (assignmentName string, err error) {
	var out struct {
		AssignmentName string `gorm:"column:assignment_name"`
	}

	err = r.db.
		Table("assignments").
		Select("assignment_name").
		Where("assignment_id = ? AND course_id = ? AND deleted_at IS NULL", AssignmentID, CourseID).
		Take(&out).Error
	if err != nil {
		return "", err
	}
	return out.AssignmentName, nil
}

func (r *GormInstructorRepository) FindSubmissionFileName(AssignmentID uuid.UUID, SubmissionID uuid.UUID) (fileName string, err error) {
	var submissionFile models.Submission
	if err := r.db.Table("submissions").
		Select("submission_file_name").
		Where("assignment_id = ? AND submission_id = ?", AssignmentID, SubmissionID).
		Where("deleted_at IS NULL").
		Order("submitted_at DESC").
		Limit(1).
		First(&submissionFile).Error; err != nil {
		return "", err
	}
	return submissionFile.SubmissionFileName, nil
}

// Part:1
func (r *GormInstructorRepository) FindSubmissionsList(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.SubmissionsList, error) {
	var submissions []response.SubmissionsList

	subq := r.db.
		Table("submissions AS s").
		Select(`
			s.submission_id,
			s.submitted_at,
			s.submitted_by,
			s.belongs_to,
			s.assignment_id,
			s.matched_by,
			ROW_NUMBER() OVER (
				PARTITION BY
					CASE
						WHEN s.submitted_by = u_owner.user_id THEN s.belongs_to
						ELSE s.submission_id
					END
				ORDER BY s.submitted_at DESC
			) AS rn
		`).
		Joins(`LEFT JOIN personal_data AS p_owner
                 ON p_owner.personal_data_id = s.belongs_to
                AND p_owner.deleted_at IS NULL`).
		Joins(`LEFT JOIN users AS u_owner
                 ON u_owner.email = p_owner.email
                AND u_owner.deleted_at IS NULL`).
		Where(`s.assignment_id = ? AND s.deleted_at IS NULL`, AssignmentID)

	err := r.db.
		Table("(?) AS b", subq).
		Select(`
			b.submission_id,
			sec.section_name,
			(pd.first_name || ' ' || pd.last_name) AS full_name,
			pd.student_code,
			pd.personal_data_id,
			(b.belongs_to IS NOT NULL) AS has_assigned,
			b.matched_by,
			b.submitted_at
		`).
		Joins(`LEFT JOIN personal_data AS pd
                 ON b.belongs_to = pd.personal_data_id`).
		Joins(`LEFT JOIN enrollment_lists AS el
                 ON pd.personal_data_id = el.personal_data_id
                AND el.course_id = ?`, CourseID).
		Joins(`LEFT JOIN sections AS sec
                 ON el.section_id = sec.section_id
                AND sec.course_id = ?`, CourseID).
		Where("b.rn = 1").
		Order("b.submitted_at DESC").
		Scan(&submissions).Error

	if err != nil {
		return nil, err
	}
	return submissions, nil
}

func (r *GormInstructorRepository) FindStudentListForSubmission(CourseID uuid.UUID, AssignmentID uuid.UUID) (response.StudentSubmissionSplitResponse, error) {
	var studentList []response.StudentListForSubmissionResponse

	raw := `
        SELECT
            pd.personal_data_id, (pd.first_name || ' ' || pd.last_name) AS full_name, pd.email, pd.student_code,
            EXISTS (
                SELECT 1
                FROM (
                    SELECT
                        s.submission_id,
                        ROW_NUMBER() OVER (
                            PARTITION BY
                                CASE
                                    WHEN s.submitted_by = u_owner.user_id THEN s.belongs_to
                                    ELSE s.submission_id
                                END
                            ORDER BY s.submitted_at DESC
                        ) AS rn
                    FROM submissions s
                    LEFT JOIN personal_data p_owner
                      ON p_owner.personal_data_id = s.belongs_to
                     AND p_owner.deleted_at IS NULL
                    LEFT JOIN users u_owner
                      ON u_owner.email = p_owner.email
                     AND u_owner.deleted_at IS NULL
                    WHERE s.assignment_id = ?
                      AND s.belongs_to   = pd.personal_data_id
                      AND s.deleted_at IS NULL
                ) x
                WHERE x.rn = 1
            ) AS has_submission
        FROM personal_data pd
        JOIN enrollment_lists el
          ON el.personal_data_id = pd.personal_data_id
         AND el.course_id       = ?
         AND el.deleted_at IS NULL
        WHERE pd.role_type  = 'STUDENT'
          AND pd.deleted_at IS NULL
        ORDER BY pd.first_name, pd.last_name;
    `

	if err := r.db.Raw(raw, AssignmentID, CourseID).Scan(&studentList).Error; err != nil {
		return response.StudentSubmissionSplitResponse{}, err
	}

	var withSubmission, withoutSubmission []response.StudentListForSubmissionResponse
	for _, s := range studentList {
		if s.HasSubmission {
			withSubmission = append(withSubmission, s)
		} else {
			withoutSubmission = append(withoutSubmission, s)
		}
	}
	return response.StudentSubmissionSplitResponse{
		WithSubmission:    withSubmission,
		WithoutSubmission: withoutSubmission,
	}, nil
}

func (r *GormInstructorRepository) AddAssignmentFile(file *models.AssignmentFile) error {
	if result := r.db.Create(file); result.Error != nil {
		return result.Error
	}
	return nil
}

func (r *GormInstructorRepository) FindProcessLeftSideBarData(CourseID uuid.UUID, AssignmentID uuid.UUID) (map[string]interface{}, error) {
	var leftSidebarData map[string]interface{}

	if err := r.db.Table("assignments").
		Select(`
			assignments.assignment_id, 
			assignments.assignment_name,
			courses.course_code,
			courses.semester,
			courses.academic_year
		`).
		Joins("JOIN courses ON assignments.course_id = courses.course_id").
		Where("assignments.course_id = ? AND assignments.assignment_id = ? AND assignments.deleted_at IS NULL AND courses.deleted_at IS NULL", CourseID, AssignmentID).
		Take(&leftSidebarData).Error; err != nil {
		return nil, err
	}
	return leftSidebarData, nil
}

// Find instructors and students by course id
func (r *GormInstructorRepository) FindRosterByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error) {
	var users []map[string]interface{}

	if err := r.db.Table("enrollment_lists").
		Select(`personal_data.personal_data_id,
				CONCAT(personal_data.first_name, ' ', personal_data.last_name) AS full_name,
				personal_data.email,
				personal_data.student_code,
				personal_data.role_type,
				grouped_sections.section_names AS section_name,
				COUNT(submissions.submission_id) AS submission_count`).
		Joins("JOIN personal_data ON enrollment_lists.personal_data_id = personal_data.personal_data_id").
		Joins(`LEFT JOIN (
				SELECT enrollment_lists.personal_data_id, 
				STRING_AGG(DISTINCT sections.section_name, ', ' ORDER BY sections.section_name) AS section_names
				FROM enrollment_lists
				LEFT JOIN sections ON enrollment_lists.section_id = sections.section_id
				WHERE enrollment_lists.course_id = ?
				GROUP BY enrollment_lists.personal_data_id
				) AS grouped_sections ON grouped_sections.personal_data_id = personal_data.personal_data_id`, CourseID).
		Joins("LEFT JOIN submissions ON enrollment_lists.personal_data_id = submissions.submitted_by AND submissions.assignment_id IN (SELECT assignment_id FROM assignments WHERE assignments.course_id = ?)", CourseID).
		Where("enrollment_lists.course_id = ? AND enrollment_lists.deleted_at IS NULL", CourseID).
		Group("personal_data.personal_data_id, personal_data.first_name, personal_data.last_name, personal_data.email, personal_data.student_code, personal_data.role_type, grouped_sections.section_names").
		Order(`CASE WHEN grouped_sections.section_names LIKE '001%' THEN 0 ELSE 1 END, grouped_sections.section_names ASC`).
		Scan(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

// Find sections by course id
func (r *GormInstructorRepository) FindRosterSectionByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error) {
	var sectionsDetails []map[string]interface{}

	if err := r.db.Table("sections").
		Select(`
			sections.section_id,
			sections.section_name,
			COUNT(DISTINCT enrollment_lists.enrollment_list_id) AS total_students`).
		Joins("LEFT JOIN enrollment_lists ON enrollment_lists.section_id = sections.section_id").
		Joins("LEFT JOIN personal_data ON enrollment_lists.personal_data_id = personal_data.personal_data_id AND personal_data.role_type = 'STUDENT'").
		Where("sections.course_id = ? AND sections.deleted_at IS NULL", CourseID).
		Group("sections.section_id, sections.section_name").
		Order("CAST(sections.section_name AS INTEGER) ASC").
		Scan(&sectionsDetails).Error; err != nil {
		return nil, err
	}
	return sectionsDetails, nil
}

func (r *GormInstructorRepository) FindRosterByCourseIDAndSectionID(CourseID uuid.UUID, SectionID uuid.UUID) ([]map[string]interface{}, error) {
	var users []map[string]interface{}

	if err := r.db.Table("enrollment_lists").
		Select(`personal_data.personal_data_id,
				CONCAT(personal_data.first_name, ' ', personal_data.last_name) AS full_name,
		        personal_data.email,
				personal_data.student_code,
		        COUNT(submissions.submission_id) AS submissions_count`).
		Joins("JOIN personal_data ON enrollment_lists.personal_data_id = personal_data.personal_data_id").
		Joins("LEFT JOIN sections ON enrollment_lists.section_id = sections.section_id").
		Joins("LEFT JOIN submissions ON enrollment_lists.personal_data_id = submissions.belongs_to AND submissions.assignment_id IN (SELECT assignment_id FROM assignments WHERE assignments.course_id = ?)", CourseID).
		Where("enrollment_lists.course_id = ? AND enrollment_lists.section_id = ? AND enrollment_lists.deleted_at IS NULL", CourseID, SectionID).
		Group("personal_data.personal_data_id, personal_data.first_name, personal_data.last_name, personal_data.email, personal_data.role_type").
		Order("personal_data.student_code ASC").
		Scan(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (r *GormInstructorRepository) FindPersonalDataByIDAndCourseID(PersonalDataID uuid.UUID, CourseID uuid.UUID) ([]map[string]interface{}, error) {
	var user []map[string]interface{}

	if err := r.db.Table("enrollment_lists").
		Select(`personal_data.personal_data_id,
				CONCAT(personal_data.first_name, ' ', personal_data.last_name) AS full_name,
		        personal_data.email,
		        personal_data.student_code,
		        personal_data.role_type,
		        STRING_AGG(DISTINCT sections.section_name, ', ') AS section_name`).
		Joins("JOIN personal_data ON enrollment_lists.personal_data_id = personal_data.personal_data_id").
		Joins("LEFT JOIN sections ON enrollment_lists.section_id = sections.section_id").
		Where("enrollment_lists.course_id = ? AND enrollment_lists.personal_data_id = ? AND enrollment_lists.deleted_at IS NULL", CourseID, PersonalDataID).
		Group("personal_data.personal_data_id, personal_data.first_name, personal_data.last_name, personal_data.email, personal_data.role_type").
		Scan(&user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

// FindUserByEmail finds a user by their email address
func (r *GormInstructorRepository) FindUserByEmail(email string) (map[string]interface{}, error) {
	var result map[string]interface{}

	if err := r.db.Table("users").
		Select("users.user_id, users.email, user_groups.group_name").
		Joins("left join user_groups on users.group_id = user_groups.group_id").
		Where("users.email = ?", email).
		Scan(&result).Error; err != nil {
		return nil, err
	}

	return result, nil
}

// Handler gorm insert a single user to roster
func (r *GormInstructorRepository) AddSingleUserRoster(personalData *models.PersonalData, enrollment *models.EnrollmentList) error {
	tx := r.db.Begin()

	var existingPersonalData models.PersonalData
	err := tx.Table("personal_data").
		Select("personal_data.*").
		Joins("LEFT JOIN enrollment_lists ON personal_data.personal_data_id = enrollment_lists.personal_data_id").
		Where("personal_data.email = ? AND enrollment_lists.course_id = ?", personalData.Email, enrollment.CourseID).
		First(&existingPersonalData).Error
	if err == nil {
		if existingPersonalData.RoleType != personalData.RoleType {
			tx.Rollback()
			return fmt.Errorf("role conflict: user with email %s already exists in this course as %s", personalData.Email, existingPersonalData.RoleType)
		}
		enrollment.PersonalDataID = existingPersonalData.PersonalDataID
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		tx.Rollback()
		return fmt.Errorf("failed to query personal data: %v", err)
	} else {
		if err := tx.Create(personalData).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create personal data: %v", err)
		}
		enrollment.PersonalDataID = personalData.PersonalDataID
	}

	var count int64
	if err := tx.Model(&models.EnrollmentList{}).
		Where("course_id = ? AND personal_data_id = ? AND (section_id = ? OR section_id IS NULL)", enrollment.CourseID, enrollment.PersonalDataID, enrollment.SectionID).
		Count(&count).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to query enrollment list: %v", err)
	}

	if count > 0 {
		tx.Rollback()
		return fmt.Errorf("user is already enrolled in this course/section")
	}

	if enrollment.SectionID != nil && *enrollment.SectionID == uuid.Nil {
		enrollment.SectionID = nil
	}

	if err := tx.Create(enrollment).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to create enrollment list: %v", err)
	}

	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}
	return nil
}

// Handler gorm insert multiple users to roster
func (r *GormInstructorRepository) AddMultipleUserRoster(personalData []models.PersonalData, enrollmentLists []models.EnrollmentList) error {
	tx := r.db.Begin()

	for i, pd := range personalData {
		var existingPersonalData models.PersonalData
		err := tx.Table("personal_data").
			Select("personal_data.*").
			Joins("LEFT JOIN enrollment_lists ON personal_data.personal_data_id = enrollment_lists.personal_data_id").
			Where("personal_data.email = ? AND enrollment_lists.course_id = ?", pd.Email, enrollmentLists[i].CourseID).
			First(&existingPersonalData).Error
		if err == nil {
			enrollmentLists[i].PersonalDataID = existingPersonalData.PersonalDataID
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			tx.Rollback()
			return fmt.Errorf("failed to query personal data: %v", err)
		} else {
			if err := tx.Create(&pd).Error; err != nil {
				tx.Rollback()
				return fmt.Errorf("failed to create personal data: %v", err)
			}
			enrollmentLists[i].PersonalDataID = pd.PersonalDataID
		}

		var count int64
		if err := tx.Model(&models.EnrollmentList{}).
			Where("course_id = ? AND personal_data_id = ? AND (section_id = ? OR section_id IS NULL)", enrollmentLists[i].CourseID, enrollmentLists[i].PersonalDataID, enrollmentLists[i].SectionID).
			Count(&count).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to query enrollment list: %v", err)
		}

		if count > 0 {
			tx.Rollback()
			return fmt.Errorf("user is already enrolled in this course/section")
		}

		if err := tx.Create(&enrollmentLists[i]).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create enrollment list: %v", err)
		}
	}

	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}
	return nil
}

func (r *GormInstructorRepository) FindColumnsAndDataFromUploadedFile(fileBytes []byte) (map[string]interface{}, error) {
	file, err := excelize.OpenReader(bytes.NewReader(fileBytes))
	if err != nil {
		return nil, err
	}

	defer file.Close()

	sheets := file.GetSheetList()
	if len(sheets) == 0 {
		return nil, fmt.Errorf("no sheets found in the file")
	}

	sheetName := sheets[0]

	rows, err := file.GetRows(sheetName)
	if err != nil {
		return nil, err
	}

	if len(rows) < 5 {
		return nil, fmt.Errorf("file does not contain enough data")
	}

	columns := []string{"No", "SectionLec", "SectionLab", "StudentID", "FirstName", "LastName", "Email"}

	data := []map[string]string{}
	for _, row := range rows[4:] {
		rowData := map[string]string{}

		if len(row) > 0 {
			rowData["No"] = row[0]
		}
		if len(row) > 1 {
			rowData["SectionLec"] = row[1]
		}
		if len(row) > 2 {
			rowData["SectionLab"] = row[2]
		}
		if len(row) > 3 {
			rowData["StudentID"] = row[3]
		}
		if len(row) > 4 {
			rowData["FirstName"] = strings.TrimSpace(row[4])
		}
		if len(row) > 5 {
			rowData["LastName"] = strings.TrimSpace(row[5])
		}
		if len(row) > 8 {
			rowData["Email"] = strings.TrimSpace(row[8])
		} else {
			rowData["Email"] = ""
		}
		data = append(data, rowData)
	}

	return map[string]interface{}{
		"columns": columns,
		"data":    data,
	}, nil
}

func (r *GormInstructorRepository) FindColumnsAndDataFromOptionFile(fileBytes []byte) (map[string]interface{}, error) {
	file, err := excelize.OpenReader(bytes.NewReader(fileBytes))
	if err != nil {
		return nil, err
	}

	defer file.Close()

	sheets := file.GetSheetList()
	if len(sheets) == 0 {
		return nil, fmt.Errorf("no sheets found in the file")
	}

	sheetName := sheets[0]

	rows, err := file.GetRows(sheetName)
	if err != nil {
		return nil, err
	}

	columns := []string{"StudentID", "FirstName", "LastName", "Email", "Section"}

	data := []map[string]string{}
	for _, row := range rows[1:] {
		rowData := map[string]string{}

		if len(row) > 0 {
			rowData["StudentID"] = row[0]
		}
		if len(row) > 1 {
			rowData["FirstName"] = row[1]
		}
		if len(row) > 2 {
			rowData["LastName"] = row[2]
		}
		if len(row) > 3 {
			rowData["Email"] = row[3]
		}
		if len(row) > 4 {
			rowData["Section"] = row[4]
		}
		data = append(data, rowData)
	}

	return map[string]interface{}{
		"columns": columns,
		"data":    data,
	}, nil
}

func (r *GormInstructorRepository) FindCoursesByUserID(UserID uuid.UUID) ([]response.CoursesResponse, error) {
	var courses []response.CoursesResponse

	if err := r.db.
		Table("courses").
		Select(`
			courses.course_id,
			courses.course_name,
			courses.course_code,
			courses.course_description,
			CAST(courses.semester AS int) AS semester,
			CAST(courses.academic_year AS int) AS academic_year,
			(CAST(courses.academic_year AS int) + CAST(courses.semester AS int)) AS term_key,
			courses.entry_code,
			COUNT(DISTINCT assignments.assignment_id) AS total_assignments
		`).
		Joins("JOIN enrollment_lists ON enrollment_lists.course_id = courses.course_id").
		Joins("JOIN personal_data ON personal_data.personal_data_id = enrollment_lists.personal_data_id").
		Joins("JOIN users ON users.email = personal_data.email").
		Joins("LEFT JOIN assignments ON assignments.course_id = courses.course_id AND assignments.deleted_at IS NULL").
		Where("users.user_id = ?", UserID).
		Where("courses.deleted_at IS NULL").
		Group("courses.course_id").
		Order("term_key DESC, courses.course_code ASC").
		Find(&courses).Error; err != nil {
		return nil, err
	}

	for i := range courses {
		beYear := courses[i].AcademicYear + 543
		courses[i].TermLabel = fmt.Sprintf("%d / %d", courses[i].Semester, beYear)
	}
	return courses, nil
}

func (r *GormInstructorRepository) FindCourseByCourseID(CourseID uuid.UUID) (*response.CourseResponse, error) {
	var course response.CourseResponse

	if err := r.db.
		Table("courses").
		Select("courses.course_id, courses.course_name, courses.course_code, courses.course_description, courses.semester, courses.academic_year, courses.entry_code").
		Where("courses.course_id = ? AND courses.deleted_at IS NULL", CourseID).
		Find(&course).Error; err != nil {
		return nil, err
	}
	return &course, nil
}

func (r *GormInstructorRepository) FindInsAssignmentByCourseID(CourseID uuid.UUID) ([]response.InsAssignmentResponse, error) {
	var assignments []response.InsAssignmentResponse

	if err := r.db.
		Table("assignments").
		Select("DISTINCT ON (assignments.assignment_id) assignments.assignment_id, assignments.assignment_name, assignments.submitted_by, assignments.regrades, assignment_sections.release_date AS assignment_release_date, assignment_sections.due_date AS assignment_due_date").
		Joins("LEFT JOIN assignment_sections ON assignments.assignment_id = assignment_sections.assignment_id AND assignment_sections.deleted_at IS NULL").
		Where("assignments.course_id = ? AND assignments.deleted_at IS NULL", CourseID).
		Find(&assignments).Error; err != nil {
		return nil, err
	}

	for i := range assignments {
		var assignmentSections []response.AssignmentSectionResponse

		if err := r.db.
			Table("assignment_sections").
			Select("assignment_sections.assignment_id, assignment_sections.assignment_section_id, assignment_sections.published_grade, assignment_sections.published_assignment, assignment_sections.release_date, assignment_sections.due_date, assignment_sections.cut_off_date, sections.section_id, sections.section_name").
			Joins("LEFT JOIN sections ON assignment_sections.section_id = sections.section_id").
			Where("assignment_sections.assignment_id = ?", assignments[i].AssignmentID).
			Find(&assignmentSections).Error; err != nil {
			return nil, err
		}

		assignments[i].AssignmentSections = assignmentSections
	}

	return assignments, nil
}

func (r *GormInstructorRepository) FindAssignmentsByCourseID(CourseID uuid.UUID) ([]response.AssignmentsResponse, error) {
	var assignments []response.AssignmentsResponse

	if err := r.db.
		Table("assignments").
		Select("DISTINCT ON (assignments.assignment_id) assignments.assignment_id, assignments.assignment_name, assignments.submitted_by, assignments.published, assignments.regrades, assignment_sections.release_date AS assignment_release_date, assignment_sections.due_date AS assignment_due_date").
		Joins("JOIN assignment_sections ON assignments.assignment_id = assignment_sections.assignment_id AND assignment_sections.deleted_at IS NULL").
		Find(&assignments, "assignments.course_id = ? AND assignments.deleted_at IS NULL", CourseID).Error; err != nil {
		return nil, err
	}
	return assignments, nil
}

func (r *GormInstructorRepository) FindActiveAssignmentsByCourseID(CourseID uuid.UUID) ([]response.AssignmentActiveResponse, error) {
	var activeAssignments []response.AssignmentActiveResponse
	currentDate := time.Now()

	// if err := r.db.
	// 	Table("assignments AS a").
	// 	Select(`
	// 		DISTINCT ON (a.assignment_id)
	// 		a.assignment_id,
	// 		a.assignment_name,
	// 		a.assignment_description,
	// 		a.submitted_by,
	// 		a.regrades,
	// 		a.created_at,
	// 		s.release_date  AS assignment_release_date,
	// 		s.due_date      AS assignment_due_date,
	// 		s.cut_off_date  AS assignment_cut_off_date,
	// 		sec.section_name AS section_name
	// 	`).
	// 	Joins("JOIN assignment_sections AS s ON a.assignment_id = s.assignment_id").
	// 	Joins("JOIN sections AS sec ON sec.section_id = s.section_id").
	// 	Where(`
	// 		a.course_id = ?
	// 		AND a.deleted_at IS NULL
	// 		AND s.deleted_at IS NULL
	// 		AND (
	// 			s.published_assignment = TRUE
	// 			OR
	// 			(
	// 				s.release_date IS NOT NULL AND s.release_date <= ?
	// 				AND (
	// 					s.due_date IS NULL OR s.due_date > ?
	// 					OR (s.cut_off_date IS NOT NULL AND s.cut_off_date > ?)
	// 				)
	// 			)
	// 		)
	// 	`, CourseID, currentDate, currentDate, currentDate).
	// 	Order("a.assignment_id, s.published_assignment DESC, s.release_date ASC NULLS LAST").
	// 	Find(&activeAssignments).Error; err != nil {
	// 	return nil, err
	// }
	// return activeAssignments, nil

	sActive := r.db.
		Table("assignment_sections AS s").
		Select("s.assignment_id, s.section_id, s.published_assignment, s.release_date, s.due_date, s.cut_off_date").
		Where("s.deleted_at IS NULL").
		Where(`
			s.published_assignment = TRUE
			OR (
				s.release_date IS NOT NULL AND s.release_date <= ?
				AND (
					s.due_date IS NULL OR s.due_date > ?
					OR (s.cut_off_date IS NOT NULL AND s.cut_off_date > ?)
				)
			)
		`, currentDate, currentDate, currentDate)

	best := r.db.
		Table("(?) AS s", sActive).
		Select(`
			DISTINCT ON (s.assignment_id)
			s.assignment_id,
			s.release_date AS assignment_release_date,
			s.due_date     AS assignment_due_date,
			s.cut_off_date AS assignment_cut_off_date
		`).
		Order("s.assignment_id, s.published_assignment DESC, s.release_date ASC NULLS LAST")

	agg := r.db.
		Table("(?) AS s", sActive).
		Joins("JOIN sections AS sec ON sec.section_id = s.section_id").
		Select(`
			s.assignment_id,
			string_agg(DISTINCT sec.section_name, ',' ORDER BY sec.section_name) AS section_name
		`).
		Group("s.assignment_id")

	err := r.db.
		Table("assignments AS a").
		Joins("JOIN (?) AS b ON b.assignment_id = a.assignment_id", best).
		Joins("JOIN (?) AS ag ON ag.assignment_id = a.assignment_id", agg).
		Select(`
			a.assignment_id,
			a.assignment_name,
			a.assignment_description,
			a.submitted_by,
			a.regrades,
			a.created_at,
			b.assignment_release_date,
			b.assignment_due_date,
			b.assignment_cut_off_date,
			ag.section_name
		`).
		Where("a.course_id = ? AND a.deleted_at IS NULL", CourseID).
		Order("a.created_at DESC").
		Find(&activeAssignments).Error

	if err != nil {
		return nil, err
	}
	return activeAssignments, nil
}

func (r *GormInstructorRepository) FindAssignmentSettingsDetail(CourseID uuid.UUID, AssignmentID uuid.UUID) (*response.AssignmentSettingsResponse, error) {
	var assignment response.Assignment

	if err := r.db.
		Table("assignments").
		Select("assignment_id, assignment_name, assignment_description, submitted_by, late_submitted, regrades, group_submitted").
		Where("course_id = ? AND assignment_id = ? AND deleted_at IS NULL", CourseID, AssignmentID).
		First(&assignment).Error; err != nil {
		return nil, err
	}

	var assignmentSections []response.AssignmentSection

	if err := r.db.
		Table("assignment_sections").
		Select("assignment_section_id, published_grade, release_date, due_date, cut_off_date, sections.section_id, sections.section_name").
		Joins("LEFT JOIN sections ON assignment_sections.section_id = sections.section_id").
		Where("assignment_sections.assignment_id = ?", AssignmentID).
		Find(&assignmentSections).Error; err != nil {
		return nil, err
	}

	assignmentResponse := response.AssignmentSettingsResponse{
		Assignment:         assignment,
		AssignmentSections: assignmentSections,
	}

	return &assignmentResponse, nil
}

func (r *GormInstructorRepository) FindInstructorsNameByCourseID(courseID uuid.UUID) ([]response.InstructorListResponse, error) {
	var instructors []response.InstructorListResponse

	if err := r.db.
		Table("enrollment_lists").
		Select("personal_data.personal_data_id, CONCAT(personal_data.first_name, '  ', personal_data.last_name) AS instructor_name").
		Joins("JOIN personal_data ON enrollment_lists.personal_data_id = personal_data.personal_data_id").
		Where("enrollment_lists.course_id = ? AND personal_data.role_type = ?", courseID, "INSTRUCTOR").
		Find(&instructors).Error; err != nil {
		return nil, err
	}
	return instructors, nil
}

func (r *GormInstructorRepository) AddSubmissionFiles(submissionFiles []models.Submission) error {
	if err := r.db.Create(&submissionFiles).Error; err != nil {
		return err
	}
	return nil
}

func (r *GormInstructorRepository) AddSubmissionFileByInstructor(submissionFile *models.Submission) error {
	if err := r.db.Create(submissionFile).Error; err != nil {
		return err
	}
	return nil
}

func (r *GormInstructorRepository) ModifySubmissionList(SubmissionID uuid.UUID, AssignmentID uuid.UUID, PersonalDataID uuid.UUID, MatchedBy string) error {
	if err := r.db.Table("submissions").
		Where("submission_id = ? AND assignment_id = ?", SubmissionID, AssignmentID).
		Updates(map[string]interface{}{
			"belongs_to": PersonalDataID,
			"matched_by": MatchedBy,
		}).Error; err != nil {
		return err
	}
	return nil
}

func (r *GormInstructorRepository) FindSubmissionFiles(AssignmentID uuid.UUID) ([]response.SubmissionFilesResponse, error) {
	var rows []struct {
		SubmissionID        uuid.UUID `gorm:"column:submission_id"`
		SubmissionFileName  string    `gorm:"column:submission_file_name"`
		SubmittedAt         time.Time `gorm:"column:submitted_at"`
		TotalSubmissions    int       `gorm:"column:total_submissions"`
		SubmittedByFullname string    `gorm:"column:submitted_by"`
	}

	query := `
		WITH base AS (
			SELECT
				s.submission_id,
				s.submission_file_name,
				s.submitted_at,
				s.submitted_by,
				s.belongs_to,
				u_owner.user_id AS owner_user_id,

				ROW_NUMBER() OVER (
					PARTITION BY
						CASE WHEN s.submitted_by = u_owner.user_id THEN s.belongs_to
							 ELSE s.submission_id
						END
					ORDER BY s.submitted_at DESC
				) AS rn,

				COUNT(*) OVER (
					PARTITION BY
						CASE WHEN s.submitted_by = u_owner.user_id THEN s.belongs_to
							 ELSE s.submission_id
						END
				) AS total_submissions
			FROM submissions s
			LEFT JOIN personal_data p_owner
			       ON p_owner.personal_data_id = s.belongs_to
			      AND p_owner.deleted_at IS NULL
			LEFT JOIN users u_owner
			       ON u_owner.email = p_owner.email
			      AND u_owner.deleted_at IS NULL
			WHERE s.assignment_id = ?
			  AND s.deleted_at IS NULL
		)
		SELECT
			b.submission_id,
			b.submission_file_name,
			b.submitted_at,
			b.total_submissions,
			(u_submit.first_name || ' ' || u_submit.last_name) AS submitted_by
		FROM base b
		JOIN users u_submit ON u_submit.user_id = b.submitted_by
		WHERE b.rn = 1
		ORDER BY b.submitted_at DESC;
	`

	if err := r.db.Raw(query, AssignmentID).Scan(&rows).Error; err != nil {
		return nil, err
	}

	out := make([]response.SubmissionFilesResponse, 0, len(rows))
	for _, row := range rows {
		cleanName := utils.CleanFileName(row.SubmissionFileName)
		prefix := utils.FilePrefix(row.SubmissionFileName)

		out = append(out, response.SubmissionFilesResponse{
			SubmissionID:       row.SubmissionID,
			SubmissionFileName: cleanName,
			SubmittedAt:        row.SubmittedAt,
			TotalSubmissions:   row.TotalSubmissions,
			SubmittedBy:        row.SubmittedByFullname,
			FilePrefix:         prefix,
		})
	}
	return out, nil
}

func (r *GormInstructorRepository) FindSubmissionListByCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.SubmissionResponse, error) {
	var submissionList []response.SubmissionResponse

	subq := r.db.
		Table("submissions AS sub").
		Select(`
            sub.submission_id,
            sub.submitted_at,
            sub.submitted_by,
            sub.belongs_to,
            sub.assignment_id,
            sub.submission_file_name,
            ROW_NUMBER() OVER (
                PARTITION BY COALESCE(sub.belongs_to::text, sub.submission_id::text)
                ORDER BY sub.submitted_at DESC
            ) AS rn
        `).
		Where(`sub.assignment_id = ? AND sub.deleted_at IS NULL`, AssignmentID)

	err := r.db.
		Table("(?) AS s", subq).
		Select(`
        s.submission_id,
        s.submitted_at,
        pd.personal_data_id,
        pd.student_code,
        CONCAT(pd.first_name, ' ', pd.last_name) AS full_name,
        pd.email,
        sec.section_name
    `).
		Joins(`LEFT JOIN personal_data AS pd
             ON pd.personal_data_id = s.belongs_to
            AND pd.deleted_at IS NULL`).
		Joins(`LEFT JOIN enrollment_lists AS el
             ON el.personal_data_id = pd.personal_data_id
            AND el.course_id = ?
            AND el.deleted_at IS NULL`, CourseID).
		Joins(`LEFT JOIN sections AS sec
             ON sec.section_id = el.section_id
            AND sec.deleted_at IS NULL`).
		Where("s.rn = 1").
		Where("el.course_id IS NOT NULL OR s.belongs_to IS NULL").
		Where("(el.personal_data_id IS NOT NULL OR s.belongs_to IS NULL)").
		Order("s.submitted_at ASC").
		Scan(&submissionList).Error
	if err != nil {
		return nil, err
	}
	return submissionList, nil
}

func (r *GormInstructorRepository) FindAssignmentTemplateName(AssignmentID uuid.UUID) (string, error) {
	var assignmentFile models.AssignmentFile

	if err := r.db.Table("assignment_files").
		Select("assignment_file_name").
		Where("assignment_id = ? AND is_template = true AND deleted_at IS NULL", AssignmentID).
		First(&assignmentFile).Error; err != nil {
		return "", err
	}
	return assignmentFile.AssignmentFileName, nil
}

// Part:1 Submission details from grade-submission
func (r *GormInstructorRepository) FindSubmissionDetails(courseID uuid.UUID, assignmentID uuid.UUID, submissionID uuid.UUID) (response.HeaderDetails, error) {
	var details response.HeaderDetails
	err := r.db.
		Table("submissions AS s").
		Joins(`LEFT JOIN assignments a ON a.assignment_id = s.assignment_id AND a.deleted_at IS NULL`).
		Joins(`LEFT JOIN personal_data pd ON pd.personal_data_id = s.belongs_to AND pd.deleted_at IS NULL`).
		Joins(`LEFT JOIN enrollment_lists el ON el.personal_data_id = pd.personal_data_id AND el.course_id = a.course_id AND el.deleted_at IS NULL`).
		Joins(`LEFT JOIN sections sec ON sec.section_id = el.section_id AND sec.deleted_at IS NULL`).
		Select(`
            COALESCE(
                NULLIF(TRIM(
                    COALESCE(pd.first_name, '') ||
                    CASE
                        WHEN COALESCE(NULLIF(pd.last_name,''),'') = '' THEN ''
                        ELSE ' ' || pd.last_name
                    END
                ), ''),
                COALESCE(pd.email,''),
                ''
            ) AS full_name,
            UPPER(
                CASE
                    WHEN COALESCE(NULLIF(TRIM(pd.first_name), ''), '') = '' THEN ''
                    WHEN COALESCE(NULLIF(TRIM(pd.last_name ), ''), '') = '' THEN SUBSTRING(TRIM(pd.first_name) FROM 1 FOR 2)
                    ELSE SUBSTRING(TRIM(pd.first_name) FROM 1 FOR 1) || SUBSTRING(TRIM(pd.last_name) FROM 1 FOR 1)
                END
            ) AS nick_name,
            COALESCE(sec.section_name, '') AS section
        `).
		Where(`s.submission_id = ? AND s.assignment_id = ? AND a.course_id = ? AND s.deleted_at IS NULL`, submissionID, assignmentID, courseID).
		Take(&details).Error

	if err != nil {
		return response.HeaderDetails{}, err
	}
	return details, nil
}

// For submission box
func (r *GormInstructorRepository) ADDCroppedSubmissionBox(submission models.SubmissionBox) error {
	submissionBox := models.SubmissionBox{
		SubmissionID:          submission.SubmissionID,
		SubmissionBoxFileName: submission.SubmissionBoxFileName,
	}

	if err := r.db.Create(&submissionBox).Error; err != nil {
		return err
	}
	return nil
}

// For OCR
func (r *GormInstructorRepository) FindStudentsListForOCR(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.StudentListForOCRResponse, error) {
	var studentList []response.StudentListForOCRResponse

	if err := r.db.
		Table("personal_data AS pd").
		Select("pd.personal_data_id, pd.student_code, CONCAT(pd.first_name, ' ', pd.last_name) AS full_name").
		Joins("JOIN enrollment_lists AS el ON pd.personal_data_id = el.personal_data_id").
		Where("el.course_id = ?", CourseID).
		Where("pd.role_type = ?", "STUDENT").
		Where(` NOT EXISTS (
				SELECT 1 FROM submissions s
				WHERE s.belongs_to = pd.personal_data_id
				AND s.assignment_id = ?
			)`, AssignmentID).
		Find(&studentList).Error; err != nil {
		return nil, err
	}
	return studentList, nil
}

func (r *GormInstructorRepository) FindSubmissionBoxesForOCR(AssignmentID uuid.UUID) ([]response.GroupSubmissionBoxesForOCR, error) {
	var rawData []response.SubmissionBoxesForOCR

	err := r.db.
		Table("submission_boxes AS sb").
		Select("sb.submission_id, sb.submission_box_file_name").
		Joins("JOIN submissions AS s ON sb.submission_id = s.submission_id").
		Where("s.assignment_id = ? AND s.belongs_to IS NULL AND sb.deleted_at IS NULL AND s.deleted_at IS NULL", AssignmentID).
		Find(&rawData).Error

	if err != nil {
		return nil, err
	}

	groupMap := make(map[uuid.UUID][]string)
	for _, item := range rawData {
		groupMap[item.SubmissionID] = append(groupMap[item.SubmissionID], item.SubmissionBoxFileName)
	}

	var grouped []response.GroupSubmissionBoxesForOCR
	for submissionID, fileNames := range groupMap {
		grouped = append(grouped, response.GroupSubmissionBoxesForOCR{
			SubmissionID:          submissionID,
			SubmissionBoxFileName: fileNames,
		})
	}
	return grouped, nil
}

func (r *GormInstructorRepository) FindSubmissionBoxBySubmissionID(submissionIDs []uuid.UUID) (map[uuid.UUID][]string, error) {
	var submissionBoxes []struct {
		SubmissionID          uuid.UUID
		SubmissionBoxFileName string
	}

	err := r.db.
		Table("submission_boxes").
		Select("submission_id, submission_box_file_name").
		Where("submission_id IN ?", submissionIDs).
		Find(&submissionBoxes).Error

	if err != nil {
		return nil, err
	}

	result := make(map[uuid.UUID][]string)
	for _, sb := range submissionBoxes {
		result[sb.SubmissionID] = append(result[sb.SubmissionID], sb.SubmissionBoxFileName)
	}
	return result, nil
}

func (r *GormInstructorRepository) AddBoundingBoxesNameAndID(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for i := range boundingBoxes {
			boundingBoxes[i].AssignmentID = AssignmentID
			boundingBoxes[i].BoundingBoxID = uuid.New()
		}

		if len(boundingBoxes) > 0 {
			if err := tx.Create(&boundingBoxes).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *GormInstructorRepository) AddBoundingBoxesQuestions(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox, rubricData []response.RubricQuestion) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for i := range boundingBoxes {
			boundingBoxes[i].AssignmentID = AssignmentID
			boundingBoxes[i].BoundingBoxID = uuid.New()
		}

		if len(boundingBoxes) > 0 {
			if err := tx.Create(&boundingBoxes).Error; err != nil {
				return err
			}
		}

		if len(rubricData) == 0 {
			return nil
		}

		// For Rubric
		var existingRubric models.Rubric
		err := tx.
			Clauses(clause.Locking{Strength: "UPDATE"}).
			Where("assignment_id = ? AND deleted_at IS NULL", AssignmentID).
			First(&existingRubric).Error

		var existingQuestions []map[string]interface{}

		switch {
		case errors.Is(err, gorm.ErrRecordNotFound):
			existingRubric = models.Rubric{
				RubricID:     uuid.New(),
				AssignmentID: AssignmentID,
				RubricData:   datatypes.JSON([]byte{}),
			}
			if err := tx.Create(&existingRubric).Error; err != nil {
				return err
			}

		case err != nil:
			return err

		default:
			if len(existingRubric.RubricData) > 0 {
				var rubricMap map[string]interface{}
				if umErr := json.Unmarshal(existingRubric.RubricData, &rubricMap); umErr != nil {
					return fmt.Errorf("failed to unmarshal existing rubric_data: %w", umErr)
				}
				if qs, ok := rubricMap["questions_data"].([]interface{}); ok && qs != nil {
					for _, q := range qs {
						if m, ok := q.(map[string]interface{}); ok {
							existingQuestions = append(existingQuestions, m)
						}
					}
				}
			}
		}

		var questionBoxIDs []uuid.UUID
		for _, box := range boundingBoxes {
			var data models.BoundingBoxData

			if err := json.Unmarshal(box.BoundingBoxData, &data); err != nil {
				return fmt.Errorf("failed to parse bounding_box_data: %w", err)
			}
			if data.Type == models.QuestionRegion {
				questionBoxIDs = append(questionBoxIDs, box.BoundingBoxID)
			}
		}

		totalQuestions := utils.CountTotalQuestions(rubricData)
		if len(questionBoxIDs) < totalQuestions {
			return fmt.Errorf("not enough question bounding boxes")
		}

		questionBoxIndex := 0
		for _, question := range rubricData {
			questionID := uuid.New()
			questionEntry := map[string]interface{}{
				"question_id":    questionID.String(),
				"question_point": question.QuestionPoint,
				"question_title": question.QuestionTitle,
			}

			if len(question.SubQuestions) > 0 {
				var formattedSubQuestions []map[string]interface{}
				for _, sub := range question.SubQuestions {
					if questionBoxIndex >= len(questionBoxIDs) {
						return fmt.Errorf("bounding box not found for sub_question: %s", sub.SubQuestionTitle)
					}
					formattedSubQuestions = append(formattedSubQuestions, map[string]interface{}{
						"sub_question_id":    uuid.New().String(),
						"bounding_box_id":    questionBoxIDs[questionBoxIndex].String(),
						"sub_question_point": sub.SubQuestionPoint,
						"sub_question_title": sub.SubQuestionTitle,
					})
					questionBoxIndex++
				}
				questionEntry["sub_questions"] = formattedSubQuestions
			} else {
				if questionBoxIndex >= len(questionBoxIDs) {
					return fmt.Errorf("bounding box not found for question: %s", question.QuestionTitle)
				}
				questionEntry["bounding_box_id"] = questionBoxIDs[questionBoxIndex].String()
				questionBoxIndex++
			}
			existingQuestions = append(existingQuestions, questionEntry)
		}

		questionsData := map[string]interface{}{
			"questions_data": existingQuestions,
		}

		jsonBytes, err := json.Marshal(questionsData)
		if err != nil {
			return fmt.Errorf("failed to marshal rubric data: %w", err)
		}
		if err := tx.Model(&models.Rubric{}).
			Where("rubric_id = ?", existingRubric.RubricID).
			Update("rubric_data", datatypes.JSON(jsonBytes)).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *GormInstructorRepository) ModifyBoundingBoxesNameAndID(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for _, boundingBox := range boundingBoxes {
			if boundingBox.BoundingBoxID == uuid.Nil {
				continue
			}
			if err := tx.Model(&models.BoundingBox{}).
				Where("bounding_box_id = ? AND assignment_id = ?", boundingBox.BoundingBoxID, AssignmentID).
				Update("bounding_box_data", boundingBox.BoundingBoxData).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *GormInstructorRepository) ModifyBoundingBoxesQuestions(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox, rubricData []response.RubricQuestion) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for _, boundingBox := range boundingBoxes {
			if boundingBox.BoundingBoxID == uuid.Nil {
				continue
			}
			if err := tx.Model(&models.BoundingBox{}).
				Where("bounding_box_id = ? AND assignment_id = ?", boundingBox.BoundingBoxID, AssignmentID).
				Update("bounding_box_data", boundingBox.BoundingBoxData).Error; err != nil {
				return err
			}
		}

		var rubric models.Rubric
		if err := tx.Where("assignment_id = ?", AssignmentID).First(&rubric).Error; err != nil {
			return fmt.Errorf("rubric not found: %w", err)
		}

		var formattedQuestions []map[string]interface{}
		for _, question := range rubricData {
			entry := map[string]interface{}{
				"question_id":    question.QuestionID.String(),
				"question_title": question.QuestionTitle,
				"question_point": question.QuestionPoint,
			}

			if question.Rubrics != nil {
				entry["rubrics"] = question.Rubrics
			}

			if len(question.SubQuestions) > 0 {
				var subQs []map[string]interface{}
				for _, sq := range question.SubQuestions {
					subEntry := map[string]interface{}{
						"sub_question_id":    sq.SubQuestionID.String(),
						"sub_question_title": sq.SubQuestionTitle,
						"sub_question_point": sq.SubQuestionPoint,
						"bounding_box_id":    sq.BoundingBoxID.String(),
					}
					if sq.Rubrics != nil {
						subEntry["rubrics"] = sq.Rubrics
					}
					subQs = append(subQs, subEntry)
				}
				entry["sub_questions"] = subQs
			} else if question.BoundingBoxID != nil {
				entry["bounding_box_id"] = question.BoundingBoxID.String()
			}
			formattedQuestions = append(formattedQuestions, entry)
		}

		updatedData := map[string]interface{}{
			"questions_data": formattedQuestions,
		}
		jsonBytes, err := json.Marshal(updatedData)
		if err != nil {
			return fmt.Errorf("failed to marshal rubric data: %w", err)
		}

		if err := tx.Model(&rubric).Update("rubric_data", datatypes.JSON(jsonBytes)).Error; err != nil {
			return err
		}

		return nil
	})
}

func (r *GormInstructorRepository) FindBoundingBoxesByAssignmentTemplate(AssignmentID uuid.UUID) ([]response.BoundingBoxTemplateResponse, error) {
	var boundingBoxes []response.BoundingBoxTemplateResponse

	if err := r.db.
		Table("bounding_boxes").
		Select(`
			bounding_box_id,
			CAST(bounding_box_data->>'point_x' AS FLOAT8) AS point_x,
			CAST(bounding_box_data->>'point_y' AS FLOAT8) AS point_y,
			CAST(bounding_box_data->>'width' AS FLOAT8) AS width,
			CAST(bounding_box_data->>'height' AS FLOAT8) AS height,
			CAST(bounding_box_data->>'bounding_box_page' AS INT) AS bounding_box_page,
			bounding_box_data->>'bounding_box_type' AS bounding_box_type
		`).
		Where("bounding_boxes.assignment_id = ?", AssignmentID).
		Where("bounding_boxes.deleted_at IS NULL").
		Find(&boundingBoxes).Error; err != nil {
		return nil, err
	}
	return boundingBoxes, nil
}

func (r *GormInstructorRepository) FindBoundingBoxesType(AssignmentID uuid.UUID) ([]response.BoundingBoxDataResponse, error) {
	var boundingBoxes []response.BoundingBoxDataResponse

	if err := r.db.
		Table("bounding_boxes").
		Select(`
			CAST(bounding_box_data->>'point_x' AS FLOAT8) AS point_x,
			CAST(bounding_box_data->>'point_y' AS FLOAT8) AS point_y,
			CAST(bounding_box_data->>'width' AS FLOAT8) AS width,
			CAST(bounding_box_data->>'height' AS FLOAT8) AS height,
			(bounding_box_data->'bounding_box_page')::int AS bounding_box_page,
			bounding_box_data->>'bounding_box_type' AS bounding_box_type
		`).
		Where("assignment_id = ? AND bounding_box_data->>'bounding_box_type' IN ('name', 'id') AND deleted_at IS NULL", AssignmentID).
		Find(&boundingBoxes).Error; err != nil {
		return nil, err
	}
	return boundingBoxes, nil
}

func (r *GormInstructorRepository) RemoveBoundingBoxes(AssignmentID uuid.UUID, boundingBoxIDs []uuid.UUID) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("assignment_id = ? AND bounding_box_id IN ?", AssignmentID, boundingBoxIDs).
			Delete(&models.BoundingBox{}).Error; err != nil {
			return err
		}
		return nil
	})
}

// Get total submission IDs by has grade
func (r *GormInstructorRepository) FindTotalSubmissionIDsByHasGrade(AssignmentID uuid.UUID) ([]response.TotalSubmissionIDs, error) {
	var out []response.TotalSubmissionIDs

	raw := `
		WITH s0 AS (
			SELECT
				s.submission_id,
				s.submitted_at,
				s.submitted_by,
				s.belongs_to,
				ROW_NUMBER() OVER (
					PARTITION BY
						CASE
							WHEN s.submitted_by = u.user_id THEN s.belongs_to
							ELSE s.submission_id
						END
					ORDER BY s.submitted_at DESC
				) AS rn
			FROM submissions s
			LEFT JOIN personal_data p
			  ON p.personal_data_id = s.belongs_to
			 AND p.deleted_at IS NULL
			LEFT JOIN users u
			  ON u.email = p.email
			 AND u.deleted_at IS NULL
			WHERE s.assignment_id = ?
			  AND s.deleted_at IS NULL
		)
		SELECT
			s0.submission_id,
			EXISTS (
				SELECT 1
				FROM grades g
				WHERE g.submission_id = s0.submission_id
				  AND g.deleted_at IS NULL
			) AS has_grade
		FROM s0
		WHERE s0.rn = 1
		ORDER BY s0.submitted_at DESC;
	`

	if err := r.db.Raw(raw, AssignmentID).Scan(&out).Error; err != nil {
		return nil, err
	}
	return out, nil
}

// For get Questions By Assignment Template
func (r *GormInstructorRepository) FindQuestionsByAssignmentTemplate(AssignmentID uuid.UUID) (response.QuestionsTemplateResponse, error) {
	var rubric response.RubricData

	tx := r.db.
		Table("rubrics").
		Select("rubric_id, rubric_data").
		Where("assignment_id = ?", AssignmentID).
		Where("deleted_at IS NULL").
		Take(&rubric)

	if tx.RowsAffected == 0 {
		return response.QuestionsTemplateResponse{
			RubricID:      nil,
			QuestionsData: []interface{}{},
		}, nil
	}

	if tx.Error != nil {
		return response.QuestionsTemplateResponse{}, tx.Error
	}

	var rubricData map[string]interface{}
	if err := json.Unmarshal(rubric.RubricData, &rubricData); err != nil {
		return response.QuestionsTemplateResponse{}, fmt.Errorf("failed to parse rubric_data: %v", err)
	}

	questionsData, _ := rubricData["questions_data"].([]interface{})

	return response.QuestionsTemplateResponse{
		RubricID:      &rubric.RubricID,
		QuestionsData: questionsData,
	}, nil
}

// For get Questions List By Assignment Template
func (r *GormInstructorRepository) FindQuestionsList(AssignmentID uuid.UUID) (response.QuestionsListResponse, error) {
	var rubric struct {
		RubricID   uuid.UUID      `gorm:"column:rubric_id"`
		RubricData datatypes.JSON `gorm:"column:rubric_data"`
	}

	tx := r.db.
		Table("rubrics").
		Select("rubric_id, rubric_data").
		Where("assignment_id = ? AND deleted_at IS NULL", AssignmentID).
		Take(&rubric)

	if errors.Is(tx.Error, gorm.ErrRecordNotFound) {
		return response.QuestionsListResponse{}, nil
	}
	if tx.Error != nil {
		return nil, tx.Error
	}

	var parsed response.RawRubricData
	if err := json.Unmarshal(rubric.RubricData, &parsed); err != nil {
		return nil, err
	}

	var result response.QuestionsListResponse
	// subIDx := 0
	for _, q := range parsed.QuestionsData {
		question := response.Questions{
			QuestionID:    q.QuestionID,
			QuestionTitle: q.QuestionTitle,
			QuestionPoint: q.QuestionPoint,
		}

		for _, sq := range q.SubQuestions {
			question.SubQuestions = append(question.SubQuestions, response.SubQuestions{
				SubQuestionID:    sq.SubQuestionID,
				SubQuestionTitle: sq.SubQuestionTitle,
				SubQuestionPoint: sq.SubQuestionPoint,
			})
		}
		result = append(result, question)
	}
	return result, nil
}

func (r *GormInstructorRepository) FindNoSubmittedQuestionsList(AssignmentID uuid.UUID) (response.MixedQuestionsList, error) {
	type rubricRow struct {
		RubricID   uuid.UUID
		RubricData datatypes.JSON
	}
	var rubric rubricRow

	if err := r.db.
		Table("rubrics").
		Select("rubric_id, rubric_data").
		Where("assignment_id = ? AND deleted_at IS NULL", AssignmentID).
		Take(&rubric).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return response.MixedQuestionsList{}, nil
		}
		return nil, err
	}

	var submissionIDs response.UngradedSubmissions
	if err := r.db.
		Table("submissions").
		Select("submission_id").
		Where("assignment_id = ? AND deleted_at IS NULL", AssignmentID).
		Scan(&submissionIDs).Error; err != nil {
		return nil, err
	}

	var totalSub int64
	if err := r.db.
		Table("submissions").
		Where("assignment_id = ? AND deleted_at IS NULL", AssignmentID).
		Count(&totalSub).Error; err != nil {
		return nil, err
	}

	const pathMainExists = `$.questions_data[*] ? (@.question_id == $qid && @.grades.has_graded == true)`
	const pathSubExists = `$.questions_data[*].sub_questions[*] ? (@.sub_question_id == $sqid && @.grades.has_graded == true)`
	const pathMainGrader = `$.questions_data[*] ? (@.question_id == $qid).grades.graded_by`
	const pathSubGrader = `$.questions_data[*].sub_questions[*] ? (@.sub_question_id == $sqid).grades.graded_by`

	const countMainSQL = `
		SELECT COUNT(DISTINCT s.submission_id) AS cnt
		FROM grades g
		JOIN submissions s ON s.submission_id = g.submission_id
		WHERE s.assignment_id = $1
			AND g.deleted_at IS NULL
			AND jsonb_path_exists(
				g.grade_data,
				$2::jsonpath,
				jsonb_build_object('qid', to_jsonb($3::text))
			)
	`

	// ---- COUNT (sub) ----
	const countSubSQL = `
		SELECT COUNT(DISTINCT s.submission_id) AS cnt
		FROM grades g
		JOIN submissions s ON s.submission_id = g.submission_id
		WHERE s.assignment_id = $1
			AND g.deleted_at IS NULL
			AND jsonb_path_exists(
				g.grade_data,
				$2::jsonpath,
				jsonb_build_object('sqid', to_jsonb($3::text))
			)
	`

	// ---- LATEST GRADER (main) ----
	const latestGraderMainSQL = `
		WITH matched AS (
			SELECT g.*, GREATEST(g.updated_at, g.created_at) AS ts
			FROM grades g
			JOIN submissions s ON s.submission_id = g.submission_id
			WHERE s.assignment_id = $1
			AND g.deleted_at IS NULL
			AND jsonb_path_exists(
				g.grade_data,
				$2::jsonpath,
				jsonb_build_object('qid', to_jsonb($3::text))
				)
		),
		last_one AS (SELECT * FROM matched ORDER BY ts DESC LIMIT 1),
		pick AS (
			SELECT jsonb_path_query_first(
					g.grade_data,
					$4::jsonpath,
					jsonb_build_object('qid', to_jsonb($3::text))
				) #>> '{}' AS graded_by_user_id
			FROM last_one g
		)
		SELECT CONCAT(u.first_name,' ',u.last_name) AS name
		FROM pick p
		JOIN users u ON u.user_id::text = p.graded_by_user_id
		LIMIT 1
	`

	// ---- LATEST GRADER (sub) ----
	const latestGraderSubSQL = `
		WITH matched AS (
			SELECT g.*, GREATEST(g.updated_at, g.created_at) AS ts
			FROM grades g
			JOIN submissions s ON s.submission_id = g.submission_id
			WHERE s.assignment_id = $1
			AND g.deleted_at IS NULL
			AND jsonb_path_exists(
				g.grade_data,
				$2::jsonpath,
				jsonb_build_object('sqid', to_jsonb($3::text))
				)
		),
		last_one AS (SELECT * FROM matched ORDER BY ts DESC LIMIT 1),
		pick AS (
			SELECT jsonb_path_query_first(
					g.grade_data,
					$4::jsonpath,
					jsonb_build_object('sqid', to_jsonb($3::text))
				) #>> '{}' AS graded_by_user_id
			FROM last_one g
		)
		SELECT CONCAT(u.first_name,' ',u.last_name) AS name
		FROM pick p
		JOIN users u ON u.user_id::text = p.graded_by_user_id
		LIMIT 1
	`

	progressOf := func(n int64) int {
		if totalSub == 0 {
			return 0
		}
		return int(math.Round(float64(n) * 100.0 / float64(totalSub)))
	}

	var parsed response.RawRubricData
	if err := json.Unmarshal(rubric.RubricData, &parsed); err != nil {
		return nil, err
	}

	var result response.MixedQuestionsList
	subIdx := 0

	for _, q := range parsed.QuestionsData {
		if len(q.SubQuestions) > 0 {
			main := response.QuestionNoSubmission{
				QuestionID:    q.QuestionID,
				QuestionTitle: q.QuestionTitle,
				QuestionPoint: q.QuestionPoint,
			}

			for _, sq := range q.SubQuestions {
				var subCnt int64
				if err := r.db.Raw(
					countSubSQL,
					AssignmentID,
					pathSubExists,
					sq.SubQuestionID.String(),
				).Row().Scan(&subCnt); err != nil {
					return nil, err
				}

				var grSub struct{ Name *string }
				if err := r.db.Raw(
					latestGraderSubSQL,
					AssignmentID,
					pathSubExists,
					sq.SubQuestionID.String(),
					pathSubGrader,
				).Scan(&grSub).Error; err != nil {
					grSub.Name = nil
				}

				var subIDPtr *uuid.UUID
				if len(submissionIDs) > 0 {
					id := submissionIDs[subIdx%len(submissionIDs)].SubmissionID
					subIDPtr = &id
					subIdx++
				}

				main.SubQuestions = append(main.SubQuestions, response.SubQuestion{
					SubQuestionID:    sq.SubQuestionID,
					SubQuestionTitle: sq.SubQuestionTitle,
					SubQuestionPoint: sq.SubQuestionPoint,
					SubmissionID:     subIDPtr,
					Progress:         progressOf(subCnt),
					GradedBy:         grSub.Name,
				})
			}

			result = append(result, main)
			continue
		}

		var mainCnt int64
		if err := r.db.Raw(
			countMainSQL,
			AssignmentID,
			pathMainExists,
			q.QuestionID.String(),
		).Row().Scan(&mainCnt); err != nil {
			return nil, err
		}

		var grMain struct{ Name *string }
		if err := r.db.Raw(
			latestGraderMainSQL,
			AssignmentID,
			pathMainExists,
			q.QuestionID.String(),
			pathMainGrader,
		).Scan(&grMain).Error; err != nil {
			grMain.Name = nil
		}

		var subIDPtr *uuid.UUID
		if len(submissionIDs) > 0 {
			id := submissionIDs[subIdx%len(submissionIDs)].SubmissionID
			subIDPtr = &id
			subIdx++
		}

		result = append(result, response.Question{
			QuestionID:    q.QuestionID,
			QuestionTitle: q.QuestionTitle,
			QuestionPoint: q.QuestionPoint,
			SubmissionID:  subIDPtr,
			Progress:      progressOf(mainCnt),
			GradedBy:      grMain.Name,
		})
	}

	return result, nil
}

// For rubric
// First: main question
func (r *GormInstructorRepository) AddRubricToMainQuestion(AssignmentID uuid.UUID, QuestionID uuid.UUID, rubricData json.RawMessage) error {
	var rubricMap map[string]interface{}
	if err := json.Unmarshal(rubricData, &rubricMap); err != nil {
		return err
	}

	newDetails, err := json.Marshal(rubricMap["rubric_details"])
	if err != nil {
		return err
	}

	initRubrics := map[string]interface{}{
		"rubric_id":      rubricMap["rubric_id"],
		"rubric_setting": rubricMap["rubric_setting"],
		"has_ceiling":    rubricMap["has_ceiling"],
		"has_floor":      rubricMap["has_floor"],
		"rubric_details": []interface{}{},
	}

	initRubricsJSON, err := json.Marshal(initRubrics)
	if err != nil {
		return err
	}

	if err := r.FindRubricsExists(AssignmentID, QuestionID, initRubricsJSON); err != nil {
		return err
	}

	return r.AddRubricDetailsToMainQuestion(AssignmentID, QuestionID, newDetails)
}

func (r *GormInstructorRepository) FindRubricsExists(assignmentID uuid.UUID, questionID uuid.UUID, initRubricsJSON []byte) error {
	query := `
		WITH q_index AS (
			SELECT idx - 1 AS i
			FROM (
				SELECT idx, q->>'question_id' AS qid
				FROM rubrics r,
					jsonb_array_elements(r.rubric_data->'questions_data') WITH ORDINALITY AS q(q, idx)
				WHERE r.assignment_id = ?
			) sub
			WHERE qid = ?
		)
		UPDATE rubrics
		SET rubric_data = jsonb_set(
			rubric_data,
			ARRAY['questions_data', q_index.i::text, 'rubrics'],
			?::jsonb,
			true
		)
		FROM q_index
		WHERE assignment_id = ?
		  AND (rubric_data->'questions_data'->(q_index.i::text)::int->'rubrics') IS NULL
	`
	return r.db.Exec(query, assignmentID, questionID, string(initRubricsJSON), assignmentID).Error
}

func (r *GormInstructorRepository) AddRubricDetailsToMainQuestion(assignmentID uuid.UUID, questionID uuid.UUID, newDetails []byte) error {
	query := `
		WITH appended AS (
			SELECT idx - 1 AS i
			FROM (
				SELECT idx, q->>'question_id' AS qid
				FROM rubrics r,
					jsonb_array_elements(r.rubric_data->'questions_data') WITH ORDINALITY AS q(q, idx)
				WHERE r.assignment_id = ?
			) sub
			WHERE qid = ?
		)
		UPDATE rubrics
		SET rubric_data = jsonb_set(
			rubric_data,
			ARRAY['questions_data', appended.i::text, 'rubrics', 'rubric_details'],
			COALESCE(
				rubric_data->'questions_data'->(appended.i::text)::int->'rubrics'->'rubric_details',
				'[]'::jsonb
			) || ?::jsonb,
			true
		)
		FROM appended
		WHERE assignment_id = ?
	`
	return r.db.Exec(query, assignmentID, questionID, string(newDetails), assignmentID).Error
}

// Second: sub question
func (r *GormInstructorRepository) AddRubricToSubQuestion(AssignmentID uuid.UUID, QuestionID uuid.UUID, SubQuestionID uuid.UUID, rubricData json.RawMessage) error {
	var rubricMap map[string]interface{}
	if err := json.Unmarshal(rubricData, &rubricMap); err != nil {
		return err
	}

	newDetails, err := json.Marshal(rubricMap["rubric_details"])
	if err != nil {
		return err
	}

	initRubrics := map[string]interface{}{
		"rubric_id":      rubricMap["rubric_id"],
		"rubric_setting": rubricMap["rubric_setting"],
		"has_ceiling":    rubricMap["has_ceiling"],
		"has_floor":      rubricMap["has_floor"],
		"rubric_details": []interface{}{},
	}

	initRubricsJSON, err := json.Marshal(initRubrics)
	if err != nil {
		return err
	}

	if err := r.FindSubQuestionRubricExists(AssignmentID, QuestionID, SubQuestionID, initRubricsJSON); err != nil {
		return err
	}

	return r.AddRubricDetailsToSubQuestion(AssignmentID, QuestionID, SubQuestionID, newDetails)
}

func (r *GormInstructorRepository) FindSubQuestionRubricExists(assignmentID uuid.UUID, questionID uuid.UUID, subQuestionID uuid.UUID, initRubricsJSON []byte) error {
	query := `
		WITH q_index AS (
			SELECT idx - 1 AS i
			FROM (
				SELECT idx, q->>'question_id' AS qid
				FROM rubrics r,
					jsonb_array_elements(r.rubric_data->'questions_data') WITH ORDINALITY AS q(q, idx)
				WHERE r.assignment_id = ?
			) sub
			WHERE qid = ?
		),
		sq_index AS (
			SELECT q_index.i, idx - 1 AS j
			FROM rubrics r, q_index,
				jsonb_array_elements(r.rubric_data->'questions_data'->(q_index.i)::int->'sub_questions') WITH ORDINALITY AS sq(sq, idx)
			WHERE r.assignment_id = ? AND sq.sq->>'sub_question_id' = ?
		)
		UPDATE rubrics
		SET rubric_data = jsonb_set(
			rubric_data,
			ARRAY['questions_data', sq_index.i::text, 'sub_questions', sq_index.j::text, 'rubrics'],
			?::jsonb,
			true
		)
		FROM sq_index
		WHERE assignment_id = ?
		AND (rubric_data->'questions_data'->(sq_index.i)::int->'sub_questions'->(sq_index.j)::int->'rubrics') IS NULL
	`
	return r.db.Exec(query, assignmentID, questionID, assignmentID, subQuestionID, string(initRubricsJSON), assignmentID).Error
}

func (r *GormInstructorRepository) AddRubricDetailsToSubQuestion(assignmentID uuid.UUID, questionID uuid.UUID, subQuestionID uuid.UUID, newDetails []byte) error {
	query := `
		WITH q_index AS (
			SELECT idx - 1 AS i
			FROM (
				SELECT idx, q->>'question_id' AS qid
				FROM rubrics r,
					jsonb_array_elements(r.rubric_data->'questions_data') WITH ORDINALITY AS q(q, idx)
				WHERE r.assignment_id = ?
			) sub
			WHERE qid = ?
		),
		sq_index AS (
			SELECT q_index.i, idx - 1 AS j
			FROM rubrics r, q_index,
				jsonb_array_elements(r.rubric_data->'questions_data'->(q_index.i)::int->'sub_questions') WITH ORDINALITY AS sq(sq, idx)
			WHERE r.assignment_id = ? AND sq.sq->>'sub_question_id' = ?
		)
		UPDATE rubrics
		SET rubric_data = jsonb_set(
			rubric_data,
			ARRAY['questions_data', sq_index.i::text, 'sub_questions', sq_index.j::text, 'rubrics', 'rubric_details'],
			COALESCE(
				rubric_data->'questions_data'->(sq_index.i)::int->'sub_questions'->(sq_index.j)::int->'rubrics'->'rubric_details',
				'[]'::jsonb
			) || ?::jsonb,
			true
		)
		FROM sq_index
		WHERE assignment_id = ?
	`
	return r.db.Exec(query, assignmentID, questionID, assignmentID, subQuestionID, string(newDetails), assignmentID).Error
}

func (r *GormInstructorRepository) FindRubricDataByAssignmentID(AssignmentID uuid.UUID) (map[string]interface{}, error) {
	var record struct {
		RubricData datatypes.JSON `gorm:"column:rubric_data"`
	}
	err := r.db.
		Table("rubrics").
		Where("assignment_id = ? AND deleted_at IS NULL", AssignmentID).
		Take(&record).Error
	if err != nil {
		return nil, err
	}

	var rubricData map[string]interface{}
	if err := json.Unmarshal(record.RubricData, &rubricData); err != nil {
		return nil, err
	}
	return rubricData, nil
}

func (r *GormInstructorRepository) ModifyRubricData(AssignmentID uuid.UUID, rubricData json.RawMessage) error {
	rubricJSON, err := json.Marshal(rubricData)
	if err != nil {
		return err
	}

	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&models.Rubric{}).
			Where("assignment_id = ?", AssignmentID).
			Update("rubric_data", datatypes.JSON(rubricJSON)).Error; err != nil {
			return err
		}
		return nil
	})
}

// Third: rubric
func (r *GormInstructorRepository) FindSubmissionIDsByAssignmentID(assignmentID uuid.UUID) ([]uuid.UUID, error) {
	var rows []struct {
		SubmissionID uuid.UUID
	}
	if err := r.db.Table("submissions").
		Select("submission_id").
		Where("assignment_id = ? AND deleted_at IS NULL", assignmentID).
		Scan(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]uuid.UUID, 0, len(rows))
	for _, v := range rows {
		out = append(out, v.SubmissionID)
	}
	return out, nil
}

// Fourth: rubric
func (r *GormInstructorRepository) FindRubricAfterGraded(assignmentID uuid.UUID, submissionID uuid.UUID, questionID uuid.UUID, subQuestionID *uuid.UUID) (response.RubricResponse, error) {
	var rubric struct {
		RubricID   uuid.UUID      `gorm:"column:rubric_id"`
		RubricData datatypes.JSON `gorm:"column:rubric_data"`
	}

	if err := r.db.
		Table("rubrics").
		Select("rubric_id, rubric_data").
		Where("assignment_id = ? AND deleted_at IS NULL", assignmentID).
		Take(&rubric).Error; err != nil {
		return response.RubricResponse{}, err
	}

	var rubricJSON response.RubricJSON
	if err := json.Unmarshal(rubric.RubricData, &rubricJSON); err != nil {
		return response.RubricResponse{}, err
	}

	var gradeData struct {
		GradeData datatypes.JSON `gorm:"column:grade_data"`
	}
	_ = r.db.
		Table("grades").
		Select("grade_data").
		Where("submission_id = ? AND deleted_at IS NULL", submissionID).
		Order("updated_at DESC").
		Take(&gradeData).Error

	var gradeDataJSON response.GradeJSON
	if len(gradeData.GradeData) > 0 {
		_ = json.Unmarshal(gradeData.GradeData, &gradeDataJSON)
	}

	selectedMap := map[string]bool{}

	var gq *response.GradeQuestionJSON
	for i := range gradeDataJSON.QuestionsData {
		if gradeDataJSON.QuestionsData[i].QuestionID == questionID.String() {
			gq = &gradeDataJSON.QuestionsData[i]
			break
		}
	}
	if gq != nil {
		if subQuestionID == nil {
			if gq.Rubrics != nil {
				for _, d := range gq.Rubrics.RubricDetails {
					selectedMap[d.RubricDetailID] = d.HasSelected
				}
			}
		} else {
			for i := range gq.SubQuestions {
				if gq.SubQuestions[i].SubQuestionID == subQuestionID.String() {
					if gq.SubQuestions[i].Rubrics != nil {
						for _, d := range gq.SubQuestions[i].Rubrics.RubricDetails {
							selectedMap[d.RubricDetailID] = d.HasSelected
						}
					}
					break
				}
			}
		}
	}

	var out response.RubricResponse
	for _, q := range rubricJSON.QuestionsData {
		if q.QuestionID != questionID.String() {
			continue
		}

		// main question
		if subQuestionID == nil && q.Rubrics != nil {
			rubricID, _ := uuid.Parse(q.Rubrics.RubricID)
			out.RubricID = &rubricID
			out.RubricSetting = q.Rubrics.RubricSetting
			out.HasCeiling = q.Rubrics.HasCeiling
			out.HasFloor = q.Rubrics.HasFloor

			details := make([]response.RubricDetailWithHasSelect, 0, len(q.Rubrics.RubricDetails))
			for _, d := range q.Rubrics.RubricDetails {
				details = append(details, response.RubricDetailWithHasSelect{
					RubricDetailID:    d.RubricDetailID,
					RubricPoint:       d.RubricPoint,
					RubricDescription: d.RubricDescription,
					HasSelected:       selectedMap[d.RubricDetailID],
				})
			}
			out.RubricData = details
			return out, nil
		}

		// sub question
		if subQuestionID != nil {
			for _, sq := range q.SubQuestions {
				if sq.SubQuestionID == subQuestionID.String() && sq.Rubrics != nil {
					rubricID, _ := uuid.Parse(sq.Rubrics.RubricID)
					out.RubricID = &rubricID
					out.RubricSetting = sq.Rubrics.RubricSetting
					out.HasCeiling = sq.Rubrics.HasCeiling
					out.HasFloor = sq.Rubrics.HasFloor

					details := make([]response.RubricDetailWithHasSelect, 0, len(sq.Rubrics.RubricDetails))
					for _, d := range sq.Rubrics.RubricDetails {
						details = append(details, response.RubricDetailWithHasSelect{
							RubricDetailID:    d.RubricDetailID,
							RubricPoint:       d.RubricPoint,
							RubricDescription: d.RubricDescription,
							HasSelected:       selectedMap[d.RubricDetailID],
						})
					}
					out.RubricData = details
					return out, nil
				}
			}
		}
	}

	return response.RubricResponse{
		RubricID:      nil,
		RubricSetting: "",
		HasCeiling:    false,
		HasFloor:      false,
		RubricData:    nil,
	}, nil
}

// etc..
func (r *GormInstructorRepository) FindRubricByQuestionID(AssignmentID uuid.UUID, QuestionID uuid.UUID) (response.RubricResponse, error) {
	var rubric struct {
		RubricID   uuid.UUID      `gorm:"column:rubric_id"`
		RubricData datatypes.JSON `gorm:"column:rubric_data"`
	}

	if err := r.db.
		Table("rubrics").
		Select("rubric_id, rubric_data").
		Where("assignment_id = ? AND deleted_at IS NULL", AssignmentID).
		Take(&rubric).Error; err != nil {
		return response.RubricResponse{}, err
	}

	var rubricJSON struct {
		QuestionsData []map[string]interface{} `json:"questions_data"`
	}
	if err := json.Unmarshal(rubric.RubricData, &rubricJSON); err != nil {
		return response.RubricResponse{}, err
	}

	for _, q := range rubricJSON.QuestionsData {
		if q["question_id"] == QuestionID.String() {
			if rubricMap, ok := q["rubrics"].(map[string]interface{}); ok {
				rubricIDStr, _ := rubricMap["rubric_id"].(string)
				rubricID, _ := uuid.Parse(rubricIDStr)
				rubricSetting, _ := rubricMap["rubric_setting"].(string)
				hasCeiling, _ := rubricMap["has_ceiling"].(bool)
				hasFloor, _ := rubricMap["has_floor"].(bool)

				details := make([]response.RubricDetailWithHasSelect, 0)
				if rubricItems, ok := rubricMap["rubric_details"].([]interface{}); ok {
					for _, r := range rubricItems {
						rMap := r.(map[string]interface{})
						details = append(details, response.RubricDetailWithHasSelect{
							RubricDetailID:    rMap["rubric_detail_id"].(string),
							RubricPoint:       rMap["rubric_point"].(float64),
							RubricDescription: rMap["rubric_description"].(string),
							HasSelected:       rMap["has_selected"].(bool),
						})
					}
				}

				return response.RubricResponse{
					RubricID:      &rubricID,
					RubricSetting: rubricSetting,
					HasCeiling:    hasCeiling,
					HasFloor:      hasFloor,
					RubricData:    details,
				}, nil
			}
		}
	}

	return response.RubricResponse{
		RubricID:      nil,
		RubricSetting: "",
		HasCeiling:    false,
		HasFloor:      false,
		RubricData:    nil,
	}, nil
}

func (r *GormInstructorRepository) FindRubricBySubQuestionID(AssignmentID uuid.UUID, QuestionID uuid.UUID, SubQuestionID *uuid.UUID) (response.RubricResponse, error) {
	var rubric struct {
		RubricID   uuid.UUID      `gorm:"column:rubric_id"`
		RubricData datatypes.JSON `gorm:"column:rubric_data"`
	}

	if err := r.db.
		Table("rubrics").
		Select("rubric_id, rubric_data").
		Where("assignment_id = ? AND deleted_at IS NULL", AssignmentID).
		Take(&rubric).Error; err != nil {
		return response.RubricResponse{}, err
	}

	var rubricJSON struct {
		QuestionsData []map[string]interface{} `json:"questions_data"`
	}
	if err := json.Unmarshal(rubric.RubricData, &rubricJSON); err != nil {
		return response.RubricResponse{}, err
	}

	for _, q := range rubricJSON.QuestionsData {
		if q["question_id"] == QuestionID.String() {
			if subs, ok := q["sub_questions"].([]interface{}); ok {
				for _, s := range subs {
					sMap := s.(map[string]interface{})
					if sMap["sub_question_id"] == SubQuestionID.String() {
						if rubricMap, ok := sMap["rubrics"].(map[string]interface{}); ok {
							rubricIDStr, _ := rubricMap["rubric_id"].(string)
							rubricID, _ := uuid.Parse(rubricIDStr)
							rubricSetting, _ := rubricMap["rubric_setting"].(string)
							hasCeiling, _ := rubricMap["has_ceiling"].(bool)
							hasFloor, _ := rubricMap["has_floor"].(bool)

							details := make([]response.RubricDetailWithHasSelect, 0)
							if rubricItems, ok := rubricMap["rubric_details"].([]interface{}); ok {
								for _, r := range rubricItems {
									rMap := r.(map[string]interface{})
									details = append(details, response.RubricDetailWithHasSelect{
										RubricDetailID:    rMap["rubric_detail_id"].(string),
										RubricPoint:       rMap["rubric_point"].(float64),
										RubricDescription: rMap["rubric_description"].(string),
										HasSelected:       rMap["has_selected"].(bool),
									})
								}
							}

							return response.RubricResponse{
								RubricID:      &rubricID,
								RubricSetting: rubricSetting,
								HasCeiling:    hasCeiling,
								HasFloor:      hasFloor,
								RubricData:    details,
							}, nil
						}
					}
				}
			}
		}
	}

	return response.RubricResponse{
		RubricID:      nil,
		RubricSetting: "",
		HasCeiling:    false,
		HasFloor:      false,
		RubricData:    nil,
	}, nil
}

func (r *GormInstructorRepository) ModifyRubricDataOrHardDelete(assignmentID uuid.UUID, rubricData json.RawMessage) error {
	var probe struct {
		QuestionsData []interface{} `json:"questions_data"`
	}
	if err := json.Unmarshal(rubricData, &probe); err != nil {
		return fmt.Errorf("invalid rubricData json: %w", err)
	}

	return r.db.Transaction(func(tx *gorm.DB) error {
		if len(probe.QuestionsData) == 0 {
			if err := tx.
				Unscoped().
				Where("assignment_id = ?", assignmentID).
				Delete(&models.Rubric{}).Error; err != nil {
				return err
			}
			return nil
		}

		if err := tx.Model(&models.Rubric{}).
			Where("assignment_id = ? AND deleted_at IS NULL", assignmentID).
			Update("rubric_data", datatypes.JSON(rubricData)).Error; err != nil {
			return err
		}
		return nil
	})
}

// R submissions from question
func (r *GormInstructorRepository) FindSubmissionsFromQuestion(courseID uuid.UUID, assignmentID uuid.UUID, questionID uuid.UUID, subQuestionID *uuid.UUID) ([]response.SubmissionsFromQuestionResponse, error) {
	subq := r.db.
		Table("submissions AS s").
		Select(`
			s.submission_id,
			s.submitted_at,
			s.submitted_by,
			s.belongs_to,
			s.assignment_id,
			ROW_NUMBER() OVER (
				PARTITION BY
				  CASE
					WHEN s.submitted_by = u.user_id THEN s.belongs_to
				  	ELSE s.submission_id
				  END
				ORDER BY s.submitted_at DESC
			) AS rn
		`).
		Joins(`LEFT JOIN personal_data p ON p.personal_data_id = s.belongs_to AND p.deleted_at IS NULL`).
		Joins(`LEFT JOIN users u ON u.email = p.email AND u.deleted_at IS NULL`).
		Where(`s.assignment_id = ? AND s.deleted_at IS NULL`, assignmentID)

	type row struct {
		SubmissionID uuid.UUID      `gorm:"column:submission_id"`
		FirstName    *string        `gorm:"column:first_name"`
		LastName     *string        `gorm:"column:last_name"`
		Email        *string        `gorm:"column:email"`
		SectionName  *string        `gorm:"column:section_name"`
		GradeData    datatypes.JSON `gorm:"column:grade_data"`
	}

	var rows []row
	err := r.db.
		Table("(?) AS s", subq).
		Joins(`LEFT JOIN personal_data p ON p.personal_data_id = s.belongs_to AND p.deleted_at IS NULL`).
		Joins(`LEFT JOIN enrollment_lists el ON el.personal_data_id = p.personal_data_id AND el.course_id::uuid = ? AND el.deleted_at IS NULL`, courseID).
		Joins(`LEFT JOIN sections sec ON sec.section_id = el.section_id AND sec.deleted_at IS NULL`).
		Joins(`LEFT JOIN grades g ON g.submission_id = s.submission_id AND g.deleted_at IS NULL`).
		Joins(`JOIN rubrics rb ON rb.assignment_id = s.assignment_id AND rb.deleted_at IS NULL`).
		Where(`s.rn = 1`).
		Select(`
			s.submission_id,
			p.first_name,
			p.last_name,
			p.email,
			sec.section_name,
			g.grade_data
		`).
		Order(`s.submitted_at ASC`).
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	results := make([]response.SubmissionsFromQuestionResponse, 0, len(rows))
	type name struct{ First, Last string }
	needGraders := map[uuid.UUID]struct{}{}

	gradeFor := func(gj datatypes.JSON) (hasGraded bool, score *float64, graderID *uuid.UUID) {
		if len(gj) == 0 {
			return false, nil, nil
		}

		var g response.GradeDataJSON
		if err := json.Unmarshal(gj, &g); err != nil {
			return false, nil, nil
		}

		qID := questionID.String()
		for _, q := range g.QuestionsData {
			if q.QuestionID != qID {
				continue
			}
			if subQuestionID != nil {
				sqID := subQuestionID.String()
				for _, sq := range q.SubQuestions {
					if sq.SubQuestionID != sqID {
						continue
					}

					if sq.Grades != nil {
						hasGraded = sq.Grades.HasGraded
						if sq.Grades.GradedBy != nil {
							if gid, err := uuid.Parse(*sq.Grades.GradedBy); err == nil {
								graderID = &gid
								needGraders[gid] = struct{}{}
							}
						}
					}

					if sq.Rubrics != nil && hasGraded {
						var sum float64
						for _, rd := range sq.Rubrics.RubricDetails {
							if rd.HasSelected {
								sum += rd.RubricPoint
							}
						}
						score = &sum
					}
					return
				}
				return false, nil, nil
			}

			if q.Grades != nil {
				hasGraded = q.Grades.HasGraded
				if q.Grades.GradedBy != nil {
					if gid, err := uuid.Parse(*q.Grades.GradedBy); err == nil {
						graderID = &gid
						needGraders[gid] = struct{}{}
					}
				}
			}

			if q.Rubrics != nil && hasGraded {
				var sum float64
				for _, rd := range q.Rubrics.RubricDetails {
					if rd.HasSelected {
						sum += rd.RubricPoint
					}
				}
				score = &sum
			}
			return
		}
		return false, nil, nil
	}

	for _, rrow := range rows {
		hasGraded, scorePtr, _ := gradeFor(rrow.GradeData)
		results = append(results, response.SubmissionsFromQuestionResponse{
			SubmissionID: rrow.SubmissionID,
			UserName: response.FullNameAndEmail{
				FirstName: rrow.FirstName,
				LastName:  rrow.LastName,
				Email:     rrow.Email,
			},
			SectionName: rrow.SectionName,
			GradedBy:    nil,
			Score:       scorePtr,
			GradeStatus: hasGraded,
		})
	}

	if len(needGraders) > 0 {
		ids := make([]uuid.UUID, 0, len(needGraders))
		for id := range needGraders {
			ids = append(ids, id)
		}

		type userRow struct {
			UserID    uuid.UUID `gorm:"column:user_id"`
			FirstName *string   `gorm:"column:first_name"`
			LastName  *string   `gorm:"column:last_name"`
		}

		var urows []userRow
		if err := r.db.
			Table("users").
			Select("user_id, first_name, last_name").
			Where("deleted_at IS NULL").
			Where("user_id IN ?", ids).
			Scan(&urows).Error; err != nil {
		}

		nameByID := make(map[uuid.UUID]name, len(urows))
		for _, u := range urows {
			f, l := "", ""
			if u.FirstName != nil {
				f = *u.FirstName
			}
			if u.LastName != nil {
				l = *u.LastName
			}
			nameByID[u.UserID] = name{First: f, Last: l}
		}

		for i := range rows {
			_, _, gid := gradeFor(rows[i].GradeData)
			if gid == nil {
				continue
			}
			if nm, ok := nameByID[*gid]; ok {
				full := strings.TrimSpace(nm.First + " " + nm.Last)
				if full != "" {
					results[i].GradedBy = &full
				}
			}
		}
	}

	return results, nil
}

func (r *GormInstructorRepository) FindQuestionTitleAndQuestionPoint(assignmentID uuid.UUID, questionID uuid.UUID, subQuestionID *uuid.UUID) (response.QuestionTitleAndQuestionPointResponse, error) {
	var rubric struct {
		RubricData datatypes.JSON `gorm:"column:rubric_data"`
	}
	if err := r.db.
		Table("rubrics").
		Select("rubric_data").
		Where("assignment_id = ? AND deleted_at IS NULL", assignmentID).
		Take(&rubric).Error; err != nil {
		return response.QuestionTitleAndQuestionPointResponse{}, err
	}

	type rubricRoot struct {
		QuestionsData []struct {
			QuestionID    string  `json:"question_id"`
			QuestionTitle string  `json:"question_title"`
			QuestionPoint float64 `json:"question_point"`

			SubQuestions []struct {
				SubQuestionID    string  `json:"sub_question_id"`
				SubQuestionTitle string  `json:"sub_question_title"`
				SubQuestionPoint float64 `json:"sub_question_point"`
			} `json:"sub_questions,omitempty"`
		} `json:"questions_data"`
	}

	var data rubricRoot
	if err := json.Unmarshal(rubric.RubricData, &data); err != nil {
		return response.QuestionTitleAndQuestionPointResponse{}, err
	}

	qid := questionID.String()
	for _, q := range data.QuestionsData {
		if q.QuestionID != qid {
			continue
		}

		if subQuestionID != nil {
			sqid := subQuestionID.String()
			for _, sq := range q.SubQuestions {
				if sq.SubQuestionID == sqid {
					return response.QuestionTitleAndQuestionPointResponse{
						QuestionTitle: sq.SubQuestionTitle,
						QuestionPoint: sq.SubQuestionPoint,
					}, nil
				}
			}
			return response.QuestionTitleAndQuestionPointResponse{}, gorm.ErrRecordNotFound
		}

		return response.QuestionTitleAndQuestionPointResponse{
			QuestionTitle: q.QuestionTitle,
			QuestionPoint: q.QuestionPoint,
		}, nil
	}

	return response.QuestionTitleAndQuestionPointResponse{}, gorm.ErrRecordNotFound
}

// R Bounding Boxes data
func (r *GormInstructorRepository) FindBoundingBoxesData(AssignmentID uuid.UUID) (response.BoundingBoxesDataResponse, error) {
	// STEP 1: Load bounding_boxes (type=question)
	var rows []struct {
		BoundingBoxID uuid.UUID      `gorm:"column:bounding_box_id"`
		Data          datatypes.JSON `gorm:"column:bounding_box_data"`
	}
	if err := r.db.
		Table("bounding_boxes").
		Select("bounding_box_id, bounding_box_data").
		Where("assignment_id = ? AND deleted_at IS NULL AND bounding_box_data ->> 'bounding_box_type' = ?", AssignmentID, "question").
		Find(&rows).Error; err != nil {
		return response.BoundingBoxesDataResponse{}, err
	}

	// STEP 2: Load rubric_data JSON from rubrics table
	var rubric struct {
		RubricData datatypes.JSON
	}
	if err := r.db.
		Table("rubrics").
		Select("rubric_data").
		Where("assignment_id = ? AND deleted_at IS NULL", AssignmentID).
		Take(&rubric).Error; err != nil {
		return response.BoundingBoxesDataResponse{}, err
	}

	// STEP 3: Parse rubric_data → map[bounding_box_id] = (question_id, sub_question_id)
	bboxMap := make(map[string]struct {
		QuestionID    uuid.UUID
		SubQuestionID *uuid.UUID
	})
	var rubricJSON struct {
		QuestionsData []map[string]interface{} `json:"questions_data"`
	}
	if err := json.Unmarshal(rubric.RubricData, &rubricJSON); err != nil {
		return response.BoundingBoxesDataResponse{}, err
	}

	for _, q := range rubricJSON.QuestionsData {
		questionIDStr, _ := q["question_id"].(string)
		questionID, err := uuid.Parse(questionIDStr)
		if err != nil {
			continue
		}

		// Case: with sub-questions
		if subs, ok := q["sub_questions"].([]interface{}); ok {
			for _, s := range subs {
				sqMap := s.(map[string]interface{})
				boxIDStr, _ := sqMap["bounding_box_id"].(string)
				subQIDStr, _ := sqMap["sub_question_id"].(string)

				subQID, err := uuid.Parse(subQIDStr)
				if err != nil {
					subQID = uuid.Nil
				}

				bboxMap[boxIDStr] = struct {
					QuestionID    uuid.UUID
					SubQuestionID *uuid.UUID
				}{
					QuestionID:    questionID,
					SubQuestionID: &subQID,
				}
			}
		} else {
			// Case: no sub-questions
			boxIDStr, _ := q["bounding_box_id"].(string)
			bboxMap[boxIDStr] = struct {
				QuestionID    uuid.UUID
				SubQuestionID *uuid.UUID
			}{
				QuestionID:    questionID,
				SubQuestionID: nil,
			}
		}
	}

	// STEP 4: Loop through bounding boxes and merge data
	var result []response.BoundingBoxesDataRaw
	for _, row := range rows {
		var data response.BoundingBoxesDataRaw
		data.BoundingBoxID = row.BoundingBoxID

		if err := json.Unmarshal(row.Data, &data); err != nil {
			return response.BoundingBoxesDataResponse{}, err
		}

		if ids, ok := bboxMap[data.BoundingBoxID.String()]; ok {
			data.QuestionID = &ids.QuestionID
			data.SubQuestionID = ids.SubQuestionID
		}

		result = append(result, data)
	}

	return response.BoundingBoxesDataResponse{
		BoundingBoxesData: result,
	}, nil
}

// CRUD Grade
func (r *GormInstructorRepository) AddGradeData(assignmentID uuid.UUID, submissionID uuid.UUID, gradeData json.RawMessage) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		return tx.Create(&models.Grade{
			GradeID:      uuid.New(),
			SubmissionID: submissionID,
			GradeData:    datatypes.JSON(gradeData),
		}).Error
	})
}

func (r *GormInstructorRepository) FindExistingGradeData(assignmentID uuid.UUID, submissionID uuid.UUID) (bool, error) {
	var count int64

	err := r.db.Model(&models.Grade{}).
		Where("submission_id = ?", submissionID).
		Count(&count).Error
	return count > 0, err
}

func (r *GormInstructorRepository) FindGradeData(assignmentID uuid.UUID, submissionID uuid.UUID) (map[string]interface{}, error) {
	var grade models.Grade
	if err := r.db.Where("submission_id = ?", submissionID).First(&grade).Error; err != nil {
		return nil, err
	}

	var data map[string]interface{}
	if err := json.Unmarshal(grade.GradeData, &data); err != nil {
		return nil, err
	}

	return data, nil
}

func (r *GormInstructorRepository) FindGradeDataForReview(assignmentID uuid.UUID, submissionID uuid.UUID) (map[string]interface{}, error) {
	var grade models.Grade
	err := r.db.
		Where("submission_id = ?", submissionID).
		First(&grade).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	var data map[string]interface{}
	if err := json.Unmarshal(grade.GradeData, &data); err != nil {
		return nil, err
	}
	return data, nil
}

func (r *GormInstructorRepository) ModifyGradeData(assignmentID uuid.UUID, submissionID uuid.UUID, gradeData json.RawMessage) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var grade models.Grade
		if err := tx.Where("submission_id = ?", submissionID).First(&grade).Error; err != nil {
			return err
		}

		if err := tx.Model(&grade).Update("grade_data", datatypes.JSON(gradeData)).Error; err != nil {
			return err
		}

		return nil
	})
}

// Second: Grade
// First: main Question
func (r *GormInstructorRepository) AddRubricToMainQuestionInGrade(assignmentID uuid.UUID, submissionID uuid.UUID, questionID uuid.UUID, rubricData json.RawMessage) error {
	var m map[string]interface{}
	if err := json.Unmarshal(rubricData, &m); err != nil {
		return err
	}

	init := map[string]interface{}{
		"rubric_id":      m["rubric_id"],
		"rubric_setting": m["rubric_setting"],
		"has_ceiling":    m["has_ceiling"],
		"has_floor":      m["has_floor"],
		"rubric_details": []interface{}{},
	}
	initJSON, err := json.Marshal(init)
	if err != nil {
		return err
	}

	detailsJSON, err := json.Marshal(m["rubric_details"])
	if err != nil {
		return err
	}

	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec(`
            WITH tg AS (
                SELECT g.grade_id, g.grade_data
                FROM grades g
                JOIN submissions s ON s.submission_id = g.submission_id
                WHERE s.assignment_id = ? AND s.submission_id = ?
                  AND g.deleted_at IS NULL AND s.deleted_at IS NULL
            ),
            q_idx AS (
                SELECT tg.grade_id, ord - 1 AS i
                FROM tg
                CROSS JOIN LATERAL jsonb_array_elements(tg.grade_data->'questions_data') WITH ORDINALITY AS q(q, ord)
                WHERE q.q->>'question_id' = ?
            )
            UPDATE grades g
            SET grade_data = jsonb_set(
                g.grade_data,
                ARRAY['questions_data', q_idx.i::text, 'rubrics'],
                ?::jsonb,
                true
            )
            FROM q_idx
            WHERE g.grade_id = q_idx.grade_id
              AND (g.grade_data->'questions_data'->(q_idx.i)::int->'rubrics') IS NULL;
        `, assignmentID, submissionID, questionID, string(initJSON)).Error; err != nil {
			return err
		}

		return tx.Exec(`
            WITH tg AS (
                SELECT g.grade_id, g.grade_data
                FROM grades g
                JOIN submissions s ON s.submission_id = g.submission_id
                WHERE s.assignment_id = ? AND s.submission_id = ?
                  AND g.deleted_at IS NULL AND s.deleted_at IS NULL
            ),
            q_idx AS (
                SELECT tg.grade_id, ord - 1 AS i
                FROM tg
                CROSS JOIN LATERAL jsonb_array_elements(tg.grade_data->'questions_data') WITH ORDINALITY AS q(q, ord)
                WHERE q.q->>'question_id' = ?
            )
            UPDATE grades g
            SET grade_data = jsonb_set(
                g.grade_data,
                ARRAY['questions_data', q_idx.i::text, 'rubrics', 'rubric_details'],
                COALESCE(
                    g.grade_data->'questions_data'->(q_idx.i)::int->'rubrics'->'rubric_details',
                    '[]'::jsonb
                ) || ?::jsonb,
                true
            )
            FROM q_idx
            WHERE g.grade_id = q_idx.grade_id;
        `, assignmentID, submissionID, questionID, string(detailsJSON)).Error
	})
}

// Second: sub Question
func (r *GormInstructorRepository) AddRubricToSubQuestionInGrade(assignmentID uuid.UUID, submissionID uuid.UUID, questionID uuid.UUID, subQuestionID uuid.UUID, rubricData json.RawMessage) error {
	var m map[string]interface{}
	if err := json.Unmarshal(rubricData, &m); err != nil {
		return err
	}

	init := map[string]interface{}{
		"rubric_id":      m["rubric_id"],
		"rubric_setting": m["rubric_setting"],
		"has_ceiling":    m["has_ceiling"],
		"has_floor":      m["has_floor"],
		"rubric_details": []interface{}{},
	}
	initJSON, err := json.Marshal(init)
	if err != nil {
		return err
	}

	detailsJSON, err := json.Marshal(m["rubric_details"])
	if err != nil {
		return err
	}

	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Exec(`
            WITH tg AS (
                SELECT g.grade_id, g.grade_data
                FROM grades g
                JOIN submissions s ON s.submission_id = g.submission_id
                WHERE s.assignment_id = ? AND s.submission_id = ?
                  AND g.deleted_at IS NULL AND s.deleted_at IS NULL
            ),
            q_idx AS (
                SELECT tg.grade_id, ord - 1 AS i
                FROM tg
                CROSS JOIN LATERAL jsonb_array_elements(tg.grade_data->'questions_data') WITH ORDINALITY AS q(q, ord)
                WHERE q.q->>'question_id' = ?
            ),
            sq_idx AS (
                SELECT tg.grade_id, q_idx.i, ord - 1 AS j
                FROM tg
                JOIN q_idx ON q_idx.grade_id = tg.grade_id
                CROSS JOIN LATERAL jsonb_array_elements(
                    tg.grade_data->'questions_data'->(q_idx.i)::int->'sub_questions'
                ) WITH ORDINALITY AS sq(sq, ord)
                WHERE sq.sq->>'sub_question_id' = ?
            )
            UPDATE grades g
            SET grade_data = jsonb_set(
                g.grade_data,
                ARRAY['questions_data', sq_idx.i::text, 'sub_questions', sq_idx.j::text, 'rubrics'],
                ?::jsonb,
                true
            )
            FROM sq_idx
            WHERE g.grade_id = sq_idx.grade_id
              AND (g.grade_data->'questions_data'->(sq_idx.i)::int->'sub_questions'->(sq_idx.j)::int->'rubrics') IS NULL;
        `, assignmentID, submissionID, questionID, subQuestionID, string(initJSON)).Error; err != nil {
			return err
		}

		return tx.Exec(`
            WITH tg AS (
                SELECT g.grade_id, g.grade_data
                FROM grades g
                JOIN submissions s ON s.submission_id = g.submission_id
                WHERE s.assignment_id = ? AND s.submission_id = ?
                  AND g.deleted_at IS NULL AND s.deleted_at IS NULL
            ),
            q_idx AS (
                SELECT tg.grade_id, ord - 1 AS i
                FROM tg
                CROSS JOIN LATERAL jsonb_array_elements(tg.grade_data->'questions_data') WITH ORDINALITY AS q(q, ord)
                WHERE q.q->>'question_id' = ?
            ),
            sq_idx AS (
                SELECT tg.grade_id, q_idx.i, ord - 1 AS j
                FROM tg
                JOIN q_idx ON q_idx.grade_id = tg.grade_id
                CROSS JOIN LATERAL jsonb_array_elements(
                    tg.grade_data->'questions_data'->(q_idx.i)::int->'sub_questions'
                ) WITH ORDINALITY AS sq(sq, ord)
                WHERE sq.sq->>'sub_question_id' = ?
            )
            UPDATE grades g
            SET grade_data = jsonb_set(
                g.grade_data,
                ARRAY['questions_data', sq_idx.i::text, 'sub_questions', sq_idx.j::text, 'rubrics', 'rubric_details'],
                COALESCE(
                    g.grade_data->'questions_data'->(sq_idx.i)::int->'sub_questions'->(sq_idx.j)::int->'rubrics'->'rubric_details',
                    '[]'::jsonb
                ) || ?::jsonb,
                true
            )
            FROM sq_idx
            WHERE g.grade_id = sq_idx.grade_id;
        `, assignmentID, submissionID, questionID, subQuestionID, string(detailsJSON)).Error
	})
}

// Part:1 Export data
func (r *GormInstructorRepository) FindAssignmentsListForExport(CourseID uuid.UUID) ([]response.AssignmentsListResponse, error) {
	var assignments []response.AssignmentsListResponse

	if err := r.db.
		Table("assignments").
		Select(`
			assignment_id,
			assignment_name
		`).
		Where("course_id = ? AND deleted_at IS NULL", CourseID).
		Order("created_at ASC").
		Find(&assignments).Error; err != nil {
		return nil, err
	}

	return assignments, nil
}

func (r *GormInstructorRepository) FindAssignmentNameForExcelFile(courseID uuid.UUID, assignmentID uuid.UUID) (string, error) {
	var assignmentName string
	err := r.db.
		Table("assignments").
		Select("assignment_name").
		Where("assignment_id = ? AND course_id = ? AND deleted_at IS NULL", assignmentID, courseID).
		Scan(&assignmentName).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return "", err
	}
	if err != nil {
		return "", err
	}
	return assignmentName, nil
}

func (r *GormInstructorRepository) AddGradesToExcelFile(assignmentID uuid.UUID, courseID uuid.UUID, userID uuid.UUID, fileName string) error {
	// 1) query users
	var u struct{ Email string }
	if err := r.db.
		Table("users").
		Select("email").
		Where("user_id = ? AND deleted_at IS NULL", userID).
		Take(&u).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("user not found")
		}
		return err
	}

	// 2) find personal_data_id: match course first (by enrollment_lists)
	type pdRow struct{ PersonalDataID uuid.UUID }
	var pd pdRow

	err := r.db.
		Table("enrollment_lists el").
		Select("el.personal_data_id").
		Joins("JOIN personal_data pd ON pd.personal_data_id = el.personal_data_id").
		Where("el.course_id = ? AND pd.email = ? AND pd.deleted_at IS NULL", courseID, u.Email).
		Limit(1).
		Take(&pd).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		// if not found in roster of this course → fallback to find by email in personal_data
		err = r.db.
			Table("personal_data").
			Select("personal_data_id").
			Where("email = ? AND deleted_at IS NULL", u.Email).
			Limit(1).
			Take(&pd).Error
	}
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("personal_data not found for email %s", u.Email)
		}
		return err
	}

	// 3) Create export_grades row with status pending
	export := models.ExportGrade{
		CourseID:       courseID,
		AssignmentID:   assignmentID,
		PersonalDataID: pd.PersonalDataID, // ← linked to actual personal_data
		FileName:       fileName,
		FileStatus:     models.FileStatusPending,
		FileURL:        "", // will be updated when worker finishes uploading
	}
	return r.db.Create(&export).Error
}

func (r *GormInstructorRepository) FindLatestExportList(courseID uuid.UUID) ([]response.LatestExportListResponse, error) {
	var out []response.LatestExportListResponse

	err := r.db.
		Table("export_grades eg").
		Select(`
			eg.export_grade_id,
			eg.course_id,
			eg.assignment_id,
			eg.file_name,
			eg.file_status,
			eg.file_url,
			eg.processed_at,
			eg.created_at,
			COALESCE(
				NULLIF(
					TRIM(CONCAT(
						COALESCE(pdroster.first_name, COALESCE(pddirect.first_name, '')),
						' ',
						COALESCE(pdroster.last_name,  COALESCE(pddirect.last_name,  ''))
					)),
					''
				),
				COALESCE(pddirect.email, '')
			) AS requested_by
		`).
		Joins(`
			LEFT JOIN enrollment_lists el
			  ON el.course_id = eg.course_id
			 AND el.personal_data_id = eg.personal_data_id
			 AND el.deleted_at IS NULL
		`).
		Joins(`
			LEFT JOIN personal_data pdroster
			  ON pdroster.personal_data_id = el.personal_data_id
			 AND pdroster.deleted_at IS NULL
		`).
		Joins(`
			LEFT JOIN personal_data pddirect
			  ON pddirect.personal_data_id = eg.personal_data_id
			 AND pddirect.deleted_at IS NULL
		`).
		Where("eg.course_id = ? AND eg.deleted_at IS NULL", courseID).
		Order("eg.created_at DESC").
		Scan(&out).Error

	if err != nil {
		return nil, err
	}
	return out, nil
}

// Part:1 Statistics data
func (r *GormInstructorRepository) FindGradeIDsHasGradedBySectionIDs(AssignmentID uuid.UUID, SectionIDs []uuid.UUID) ([]uuid.UUID, error) {
	gradeIDs := []uuid.UUID{}
	if len(SectionIDs) == 0 {
		return gradeIDs, nil
	}

	err := r.db.
		Table("grades g").
		Joins("JOIN submissions s ON s.submission_id = g.submission_id AND s.deleted_at IS NULL").
		Joins("JOIN assignments a ON a.assignment_id = s.assignment_id AND a.deleted_at IS NULL").
		Joins("JOIN enrollment_lists el ON el.personal_data_id = s.belongs_to AND el.course_id = a.course_id AND el.deleted_at IS NULL").
		Where("s.assignment_id = ? AND el.section_id IN ? AND g.deleted_at IS NULL", AssignmentID, SectionIDs).
		Where(`
			jsonb_path_exists(g.grade_data, '$.questions_data[*].grades ? (@.has_graded == true)')
			OR jsonb_path_exists(g.grade_data, '$.questions_data[*].sub_questions[*].grades ? (@.has_graded == true)')
		`).
		Distinct().
		Pluck("g.grade_id", &gradeIDs).Error

	return gradeIDs, err
}

func (r *GormInstructorRepository) FindAssignmentStatsCore(req response.GetAssignmentStatisticsRequest, courseID uuid.UUID) (response.StatsCore, error) {
	out := response.StatsCore{
		QMean:    map[uuid.UUID]float64{},
		SQMean:   map[uuid.UUID]float64{},
		QRubric:  map[uuid.UUID][]response.RubricDetailCount{},
		SQRubric: map[uuid.UUID][]response.RubricDetailCount{},
	}

	base := r.db.
		Table("grades g").
		Joins("JOIN submissions s ON s.submission_id = g.submission_id AND s.deleted_at IS NULL").
		Joins("JOIN assignments a ON a.assignment_id = s.assignment_id AND a.deleted_at IS NULL").
		Joins("JOIN enrollment_lists el ON el.personal_data_id = s.belongs_to AND el.course_id = a.course_id AND el.deleted_at IS NULL").
		Where("s.assignment_id = ? AND a.course_id = ? AND g.deleted_at IS NULL", req.AssignmentID, courseID).
		Where("el.section_id IN ?", req.SectionIDs).
		Where(`
            jsonb_path_exists(g.grade_data, '$.questions_data[*].grades ? (@.has_graded == true)')
            OR jsonb_path_exists(g.grade_data, '$.questions_data[*].sub_questions[*].grades ? (@.has_graded == true)')
        `)

	if err := base.
		Session(&gorm.Session{}).
		Distinct("g.submission_id").
		Count(&out.TotalSubmissions).Error; err != nil {
		return out, err
	}

	type row struct {
		GradeID   uuid.UUID
		GradeData datatypes.JSON
	}

	var rows []row
	if err := base.
		Session(&gorm.Session{}).
		Select("g.grade_id, g.grade_data").
		Scan(&rows).Error; err != nil {
		return out, err
	}

	if len(rows) == 0 {
		return out, nil
	}

	{
		var schema struct {
			QuestionsData []struct {
				QuestionPoint float64 `json:"question_point"`
				SubQuestions  []struct {
					SubQuestionPoint float64 `json:"sub_question_point"`
				} `json:"sub_questions"`
			} `json:"questions_data"`
		}

		if err := json.Unmarshal(rows[0].GradeData, &schema); err == nil {
			tmp := 0.0

			for _, q := range schema.QuestionsData {
				subTotal := 0.0
				for _, sq := range q.SubQuestions {
					subTotal += sq.SubQuestionPoint
				}

				if q.QuestionPoint > 0 {
					tmp += q.QuestionPoint
				} else {
					tmp += subTotal
				}
			}
			out.TotalAssignmentScore = tmp
		}
	}
	if out.TotalAssignmentScore <= 0 {
		return out, nil
	}

	type agg struct {
		sum float64
		cnt int
	}
	qAgg := map[uuid.UUID]*agg{}
	sqAgg := map[uuid.UUID]*agg{}

	type detailAgg struct {
		description string
		order       int
		cnt         int64
	}
	qRubricAgg := map[uuid.UUID]map[uuid.UUID]*detailAgg{}
	sqRubricAgg := map[uuid.UUID]map[uuid.UUID]*detailAgg{}

	percentScores := make([]float64, 0, len(rows))
	for _, rrow := range rows {
		var gd struct {
			QuestionsData []struct {
				QuestionID    uuid.UUID `json:"question_id"`
				QuestionPoint float64   `json:"question_point"`
				Rubrics       struct {
					RubricDetails []struct {
						HasSelected       bool      `json:"has_selected"`
						RubricPoint       float64   `json:"rubric_point"`
						RubricDetailID    uuid.UUID `json:"rubric_detail_id"`
						RubricDescription string    `json:"rubric_description"`
					} `json:"rubric_details"`
				} `json:"rubrics"`
				SubQuestions []struct {
					SubQuestionID    uuid.UUID `json:"sub_question_id"`
					SubQuestionPoint float64   `json:"sub_question_point"`
					Rubrics          struct {
						RubricDetails []struct {
							HasSelected       bool      `json:"has_selected"`
							RubricPoint       float64   `json:"rubric_point"`
							RubricDetailID    uuid.UUID `json:"rubric_detail_id"`
							RubricDescription string    `json:"rubric_description"`
						} `json:"rubric_details"`
					} `json:"rubrics"`
				} `json:"sub_questions"`
			} `json:"questions_data"`
		}
		if err := json.Unmarshal(rrow.GradeData, &gd); err != nil {
			continue
		}

		total := 0.0
		for _, q := range gd.QuestionsData {
			qScore := 0.0
			if len(q.Rubrics.RubricDetails) > 0 {
				if _, ok := qRubricAgg[q.QuestionID]; !ok {
					qRubricAgg[q.QuestionID] = map[uuid.UUID]*detailAgg{}
				}
				for idx, rd := range q.Rubrics.RubricDetails {
					if rd.HasSelected {
						qScore += rd.RubricPoint
					}
					dm := qRubricAgg[q.QuestionID][rd.RubricDetailID]
					if dm == nil {
						dm = &detailAgg{description: rd.RubricDescription, order: idx}
						qRubricAgg[q.QuestionID][rd.RubricDetailID] = dm
					}
					if rd.HasSelected {
						dm.cnt++
					}
				}
			}
			if qScore > q.QuestionPoint {
				qScore = q.QuestionPoint
			}

			for _, sq := range q.SubQuestions {
				sqScore := 0.0
				if len(sq.Rubrics.RubricDetails) > 0 {
					if _, ok := sqRubricAgg[sq.SubQuestionID]; !ok {
						sqRubricAgg[sq.SubQuestionID] = map[uuid.UUID]*detailAgg{}
					}
					for idx, rd := range sq.Rubrics.RubricDetails {
						if rd.HasSelected {
							sqScore += rd.RubricPoint
						}
						dm := sqRubricAgg[sq.SubQuestionID][rd.RubricDetailID]
						if dm == nil {
							dm = &detailAgg{description: rd.RubricDescription, order: idx}
							sqRubricAgg[sq.SubQuestionID][rd.RubricDetailID] = dm
						}
						if rd.HasSelected {
							dm.cnt++
						}
					}
				}

				if sqScore > sq.SubQuestionPoint {
					sqScore = sq.SubQuestionPoint
				}

				if sq.SubQuestionPoint > 0 {
					p := (sqScore / sq.SubQuestionPoint) * 100.0
					if p < 0 {
						p = 0
					} else if p > 100 {
						p = 100
					}
					a := sqAgg[sq.SubQuestionID]
					if a == nil {
						a = &agg{}
						sqAgg[sq.SubQuestionID] = a
					}
					a.sum += p
					a.cnt++
				}
				qScore += sqScore
			}

			if q.QuestionPoint > 0 {
				p := (qScore / q.QuestionPoint) * 100.0
				if p < 0 {
					p = 0
				} else if p > 100 {
					p = 100
				}
				a := qAgg[q.QuestionID]
				if a == nil {
					a = &agg{}
					qAgg[q.QuestionID] = a
				}
				a.sum += p
				a.cnt++
			}
			total += qScore
		}

		pct := (total / float64(out.TotalAssignmentScore)) * 100.0
		if pct < 0 {
			pct = 0
		} else if pct > 100 {
			pct = 100
		}
		percentScores = append(percentScores, pct)
	}

	if len(percentScores) == 0 {
		return out, nil
	}

	sort.Float64s(percentScores)
	out.PercentMin = percentScores[0]
	out.PercentMax = percentScores[len(percentScores)-1]

	sum := 0.0
	for _, v := range percentScores {
		sum += v
	}
	out.PercentMean = sum / float64(len(percentScores))

	mid := len(percentScores) / 2
	if len(percentScores)%2 == 0 {
		out.PercentMedian = (percentScores[mid-1] + percentScores[mid]) / 2
	} else {
		out.PercentMedian = percentScores[mid]
	}

	var variance float64
	for _, v := range percentScores {
		diff := v - out.PercentMean
		variance += diff * diff
	}
	variance /= float64(len(percentScores))
	out.PercentSD = math.Sqrt(variance)

	for id, a := range qAgg {
		if a.cnt > 0 {
			out.QMean[id] = a.sum / float64(a.cnt)
		}
	}
	for id, a := range sqAgg {
		if a.cnt > 0 {
			out.SQMean[id] = a.sum / float64(a.cnt)
		}
	}

	toSorted := func(m map[uuid.UUID]*detailAgg) []response.RubricDetailCount {
		type row struct {
			id uuid.UUID
			d  *detailAgg
		}

		tmp := make([]row, 0, len(m))
		for id, d := range m {
			tmp = append(tmp, row{id, d})
		}

		sort.Slice(tmp, func(i, j int) bool { return tmp[i].d.order < tmp[j].d.order })
		out := make([]response.RubricDetailCount, 0, len(tmp))
		for _, r := range tmp {
			out = append(out, response.RubricDetailCount{
				RubricID:     r.id,
				Description:  r.d.description,
				TotalsSelect: r.d.cnt,
			})
		}
		return out
	}
	out.QRubric = make(map[uuid.UUID][]response.RubricDetailCount)
	for qid, mp := range qRubricAgg {
		out.QRubric[qid] = toSorted(mp)
	}
	out.SQRubric = make(map[uuid.UUID][]response.RubricDetailCount)
	for sqid, mp := range sqRubricAgg {
		out.SQRubric[sqid] = toSorted(mp)
	}
	return out, nil
}

func (r *GormInstructorRepository) FindQuestionsListStatisticsWithMeans(assignmentID uuid.UUID, qMean map[uuid.UUID]float64, sqMean map[uuid.UUID]float64) (response.QuestionsListStatsResponse, error) {
	var rubric struct {
		RubricID   uuid.UUID      `gorm:"column:rubric_id"`
		RubricData datatypes.JSON `gorm:"column:rubric_data"`
	}

	tx := r.db.
		Table("rubrics").
		Select("rubric_id, rubric_data").
		Where("assignment_id = ? AND deleted_at IS NULL", assignmentID).
		Take(&rubric)

	if errors.Is(tx.Error, gorm.ErrRecordNotFound) {
		return response.QuestionsListStatsResponse{}, nil
	}
	if tx.Error != nil {
		return nil, tx.Error
	}

	var parsed response.RawRubricData
	if err := json.Unmarshal(rubric.RubricData, &parsed); err != nil {
		return nil, err
	}

	out := make(response.QuestionsListStatsResponse, 0, len(parsed.QuestionsData))
	for i, q := range parsed.QuestionsData {
		qNum := strconv.Itoa(i + 1)

		var pctPtr *float64
		if len(q.SubQuestions) == 0 {
			if mv, ok := qMean[q.QuestionID]; ok {
				v := mv
				pctPtr = &v
			}
		}

		item := response.QuestionListStatsItem{
			QuestionID:     q.QuestionID,
			QuestionNumber: qNum,
			QuestionTitle:  q.QuestionTitle,
			QuestionPoint:  q.QuestionPoint,
			PercentMean:    pctPtr,
			SubQuestions:   make([]response.SubQuestionStatsItem, 0, len(q.SubQuestions)),
		}

		for j, sq := range q.SubQuestions {
			sNum := fmt.Sprintf("%d.%d", i+1, j+1)
			var meanPtr *float64
			if mv, ok := sqMean[sq.SubQuestionID]; ok {
				v := mv
				meanPtr = &v
			}
			item.SubQuestions = append(item.SubQuestions, response.SubQuestionStatsItem{
				SubQuestionID:    sq.SubQuestionID,
				QuestionNumber:   sNum,
				SubQuestionTitle: sq.SubQuestionTitle,
				SubQuestionPoint: sq.SubQuestionPoint,
				PercentMean:      meanPtr,
			})
		}
		out = append(out, item)
	}

	return out, nil
}

func (r *GormInstructorRepository) FindQuestionsListStatisticsWithCore(assignmentID uuid.UUID, core response.StatsCore) (response.QuestionsListStatsResponse, error) {
	var rubric struct {
		RubricID   uuid.UUID      `gorm:"column:rubric_id"`
		RubricData datatypes.JSON `gorm:"column:rubric_data"`
	}

	tx := r.db.
		Table("rubrics").
		Select("rubric_id, rubric_data").
		Where("assignment_id = ? AND deleted_at IS NULL", assignmentID).
		Take(&rubric)

	if errors.Is(tx.Error, gorm.ErrRecordNotFound) {
		return response.QuestionsListStatsResponse{}, nil
	}
	if tx.Error != nil {
		return nil, tx.Error
	}

	var parsed response.RawRubricData
	if err := json.Unmarshal(rubric.RubricData, &parsed); err != nil {
		return nil, err
	}

	out := make(response.QuestionsListStatsResponse, 0, len(parsed.QuestionsData))
	for i, q := range parsed.QuestionsData {
		qNum := strconv.Itoa(i + 1)

		var pctPtr *float64
		var meanPtr *float64
		if len(q.SubQuestions) == 0 {
			if mv, ok := core.QMean[q.QuestionID]; ok {
				v := mv
				pctPtr = &v

				mv2 := (*pctPtr / 100.0) * q.QuestionPoint
				meanPtr = &mv2
			}
		}

		var qRubric *response.RubricStats
		if dets, ok := core.QRubric[q.QuestionID]; ok && len(dets) > 0 {
			qRubric = &response.RubricStats{
				TotalStudent:  core.TotalSubmissions,
				RubricsDetail: dets,
			}
		}

		item := response.QuestionListStatsItem{
			QuestionID:     q.QuestionID,
			QuestionNumber: qNum,
			QuestionTitle:  q.QuestionTitle,
			QuestionPoint:  q.QuestionPoint,
			PercentMean:    pctPtr,
			Mean:           meanPtr,
			Rubric:         qRubric,
			SubQuestions:   make([]response.SubQuestionStatsItem, 0, len(q.SubQuestions)),
		}

		for j, sq := range q.SubQuestions {
			num := fmt.Sprintf("%d.%d", i+1, j+1)
			var meanPtr *float64
			var meanPointPtr *float64
			if mv, ok := core.SQMean[sq.SubQuestionID]; ok {
				v := mv
				meanPtr = &v
				mv2 := (*meanPtr / 100.0) * sq.SubQuestionPoint
				meanPointPtr = &mv2
			}

			var sqRubric *response.RubricStats
			if dets, ok := core.SQRubric[sq.SubQuestionID]; ok && len(dets) > 0 {
				sqRubric = &response.RubricStats{
					TotalStudent:  core.TotalSubmissions,
					RubricsDetail: dets,
				}
			}

			item.SubQuestions = append(item.SubQuestions, response.SubQuestionStatsItem{
				SubQuestionID:    sq.SubQuestionID,
				QuestionNumber:   num,
				SubQuestionTitle: sq.SubQuestionTitle,
				SubQuestionPoint: sq.SubQuestionPoint,
				PercentMean:      meanPtr,
				Mean:             meanPointPtr,
				Rubric:           sqRubric,
			})
		}

		out = append(out, item)
	}
	return out, nil
}

func (r *GormInstructorRepository) FindSectionListForStatistics(courseID uuid.UUID, req response.SectionStatisticsRequest) ([]response.SectionListForStatisticsResponse, error) {
	type row struct {
		SectionID   uuid.UUID
		SectionName string
	}
	var rows []row

	err := r.db.
		Table("assignment_sections AS asec").
		Select("DISTINCT s.section_id, s.section_name").
		Joins(`JOIN sections s ON s.section_id = asec.section_id AND s.deleted_at IS NULL`).
		Joins(`JOIN assignments a ON a.assignment_id = asec.assignment_id AND a.deleted_at IS NULL`).
		Where("asec.assignment_id = ? AND s.course_id = ? AND a.course_id = ?", req.AssignmentID, courseID, courseID).
		Where("asec.deleted_at IS NULL").
		Order("s.section_name ASC").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	out := make([]response.SectionListForStatisticsResponse, 0, len(rows))
	for _, r := range rows {
		out = append(out, response.SectionListForStatisticsResponse{
			SectionID:   []uuid.UUID{r.SectionID},
			SectionName: r.SectionName,
		})
	}
	return out, nil
}

func (r *GormInstructorRepository) FindSubmissionScoresForAssignment(courseID uuid.UUID, assignmentID uuid.UUID) ([]float64, float64, error) {
	var scores []float64
	scoreSQL := `
		WITH base AS (
		SELECT g.submission_id, g.grade_data
		FROM grades g
		JOIN submissions s ON s.submission_id = g.submission_id AND s.deleted_at IS NULL
		JOIN assignments a ON a.assignment_id = s.assignment_id AND a.deleted_at IS NULL
		WHERE a.assignment_id = @assignmentID
			AND a.course_id    = @courseID
			AND g.deleted_at IS NULL
		),
		main_rows AS (
		SELECT
			b.submission_id,
			(rd->>'rubric_point')::double precision AS point
		FROM base b
		CROSS JOIN LATERAL jsonb_array_elements(b.grade_data->'questions_data') q
		CROSS JOIN LATERAL jsonb_array_elements(COALESCE(q->'rubrics'->'rubric_details','[]'::jsonb)) rd
		WHERE COALESCE((rd->>'has_selected')::boolean, false) = true
		),
		sub_rows AS (
		SELECT
			b.submission_id,
			(rd->>'rubric_point')::double precision AS point
		FROM base b
		CROSS JOIN LATERAL jsonb_array_elements(b.grade_data->'questions_data') q
		CROSS JOIN LATERAL jsonb_array_elements(COALESCE(q->'sub_questions','[]'::jsonb)) sq
		CROSS JOIN LATERAL jsonb_array_elements(COALESCE(sq->'rubrics'->'rubric_details','[]'::jsonb)) rd
		WHERE COALESCE((sq->'grades'->>'has_graded')::boolean, false) = true
			AND COALESCE((rd->>'has_selected')::boolean, false) = true
		),
		agg AS (
		SELECT submission_id, COALESCE(SUM(point),0)::double precision AS final_score
		FROM (
			SELECT * FROM main_rows
			UNION ALL
			SELECT * FROM sub_rows
		) u
		GROUP BY submission_id
		)
		SELECT final_score
		FROM agg
		ORDER BY submission_id;
	`
	if err := r.db.Raw(
		scoreSQL,
		sql.Named("assignmentID", assignmentID),
		sql.Named("courseID", courseID),
	).Scan(&scores).Error; err != nil {
		return nil, 0, err
	}

	// Get total full score
	var totalFullScore float64
	fullSQL := `
		WITH base AS (
			SELECT jsonb_array_elements(r.rubric_data->'questions_data') AS qel
			FROM rubrics r
			WHERE r.assignment_id = @assignmentID
			AND r.deleted_at IS NULL
		),
		q AS (
			SELECT
				COALESCE((qel->>'question_point')::double precision, 0) AS qp,
				COALESCE(
					(
						SELECT SUM((sqel->>'sub_question_point')::double precision)
						FROM jsonb_array_elements(
							COALESCE(qel->'sub_questions', '[]'::jsonb)
						) sqel
					),
					0
				) AS sqp
			FROM base
		)
		SELECT COALESCE(SUM(
			CASE
				WHEN q.qp > 0 THEN q.qp
				ELSE q.sqp
			END
		), 0) AS total_point
		FROM q;
	`
	if err := r.db.Raw(
		fullSQL,
		sql.Named("assignmentID", assignmentID),
	).Scan(&totalFullScore).Error; err != nil {
		return nil, 0, err
	}

	return scores, totalFullScore, nil
}

func (r *GormInstructorRepository) FindSubmissionsStatisticsTable(courseID uuid.UUID, assignmentID uuid.UUID) ([]response.SubmissionStatisticsTableResponse, error) {
	sqlText := `
		WITH elist AS (
			SELECT el.personal_data_id, el.section_id
			FROM enrollment_lists el
			WHERE el.course_id = @courseID AND el.deleted_at IS NULL
		),
		pd AS (
			SELECT p.personal_data_id, p.first_name, p.last_name, p.email
			FROM personal_data p
			WHERE p.deleted_at IS NULL
				AND p.role_type = 'STUDENT'
		),
		sec AS (
			SELECT s.section_id, s.section_name
			FROM sections s
			WHERE s.deleted_at IS NULL
		),
		latest AS (
		SELECT s.*,
				ROW_NUMBER() OVER (PARTITION BY s.belongs_to ORDER BY s.submitted_at DESC) AS rn
			FROM submissions s
			WHERE s.assignment_id = @assignmentID
				AND s.deleted_at IS NULL
			),
			chosen AS (
			SELECT * FROM latest WHERE rn = 1
		),
		gjoin AS (
			SELECT c.submission_id, c.belongs_to, c.submitted_at, g.grade_data
			FROM chosen c
			LEFT JOIN grades g
				ON g.submission_id = c.submission_id
			AND g.deleted_at IS NULL
		),
		main_rows AS (
			SELECT
				gj.submission_id,
				(rd->>'rubric_point')::double precision AS point
			FROM gjoin gj
			CROSS JOIN LATERAL jsonb_array_elements(COALESCE(gj.grade_data->'questions_data','[]'::jsonb)) q
			CROSS JOIN LATERAL jsonb_array_elements(COALESCE(q->'rubrics'->'rubric_details','[]'::jsonb)) rd
			WHERE COALESCE((rd->>'has_selected')::boolean, false) = true
			),
		sub_rows AS (
			SELECT
				gj.submission_id,
				(rd->>'rubric_point')::double precision AS point
			FROM gjoin gj
			CROSS JOIN LATERAL jsonb_array_elements(COALESCE(gj.grade_data->'questions_data','[]'::jsonb)) q
			CROSS JOIN LATERAL jsonb_array_elements(COALESCE(q->'sub_questions','[]'::jsonb)) sq
			CROSS JOIN LATERAL jsonb_array_elements(COALESCE(sq->'rubrics'->'rubric_details','[]'::jsonb)) rd
			WHERE COALESCE((sq->'grades'->>'has_graded')::boolean, false) = true
				AND COALESCE((rd->>'has_selected')::boolean, false) = true
			),
		agg_score AS (
			SELECT submission_id, COALESCE(SUM(point),0)::double precision AS final_score
			FROM (
				SELECT * FROM main_rows
				UNION ALL
				SELECT * FROM sub_rows
			) u
		GROUP BY submission_id
		),
		graded_q AS (
			SELECT DISTINCT gj.submission_id
			FROM gjoin gj
			CROSS JOIN LATERAL jsonb_array_elements(COALESCE(gj.grade_data->'questions_data','[]'::jsonb)) q
			WHERE COALESCE((q->'grades'->>'has_graded')::boolean, false) = true
		),
		graded_sq AS (
			SELECT DISTINCT gj.submission_id
			FROM gjoin gj
			CROSS JOIN LATERAL jsonb_array_elements(COALESCE(gj.grade_data->'questions_data','[]'::jsonb)) q
			CROSS JOIN LATERAL jsonb_array_elements(COALESCE(q->'sub_questions','[]'::jsonb)) sq
			WHERE COALESCE((sq->'grades'->>'has_graded')::boolean, false) = true
		),
		graded_any AS (
			SELECT submission_id, true AS graded
				FROM (
					SELECT submission_id FROM graded_q
					UNION
					SELECT submission_id FROM graded_sq
				) x
			)
		SELECT
			pd.personal_data_id,
			(pd.first_name || ' ' || pd.last_name) AS student_name,
			pd.email,
			COALESCE(sc.section_name, '') AS sections,
			ag.final_score AS score,
			COALESCE(ga.graded, false) AS graded,
			(c.submission_id IS NOT NULL) AS has_submission,
			c.submitted_at
		FROM elist el
		JOIN pd ON pd.personal_data_id = el.personal_data_id
		LEFT JOIN sec sc ON sc.section_id = el.section_id
		LEFT JOIN chosen c ON c.belongs_to = el.personal_data_id
		LEFT JOIN agg_score ag ON ag.submission_id = c.submission_id
		LEFT JOIN graded_any ga ON ga.submission_id = c.submission_id
		ORDER BY student_name;
	`
	var rows []response.SubmissionStatisticsTableResponse
	if err := r.db.Raw(
		sqlText,
		sql.Named("courseID", courseID),
		sql.Named("assignmentID", assignmentID),
	).Scan(&rows).Error; err != nil {
		return nil, err
	}
	return rows, nil
}
