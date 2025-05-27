package adapters

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"paperGrader/internal/adapters/response"
	"paperGrader/internal/core/utils"
	"paperGrader/internal/models"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"
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

func (r *GormInstructorRepository) ModifyAssignmentAndAssignmentSection(CourseID uuid.UUID, AssignmentID uuid.UUID, assignment *models.Assignment, sections []models.AssignmentSection) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if result := tx.Model(&models.Assignment{}).
			Where("course_id = ? AND assignment_id = ?", CourseID, AssignmentID).
			Updates(assignment); result.Error != nil {
			return result.Error
		}

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
	err := r.db.
		Table("submissions AS s").
		Select(`
			s.submission_id,
			sec.section_name,
			COALESCE(pd.first_name || ' ' || pd.last_name, NULL) AS full_name,
			COALESCE(pd.student_code, NULL) AS student_code,
			pd.personal_data_id,
			(s.belongs_to IS NOT NULL) AS has_assigned,
			s.matched_by,
			s.submitted_at
		`).
		Joins("LEFT JOIN personal_data AS pd ON s.belongs_to = pd.personal_data_id").
		Joins("LEFT JOIN enrollment_lists AS el ON pd.personal_data_id = el.personal_data_id AND el.course_id = ?", CourseID).
		Joins("LEFT JOIN sections AS sec ON el.section_id = sec.section_id AND sec.course_id = ?", CourseID).
		Where("s.assignment_id = ? AND s.deleted_at IS NULL", AssignmentID).
		Scan(&submissions).Error
	if err != nil {
		return nil, err
	}
	return submissions, nil
}

func (r *GormInstructorRepository) FindStudentListForSubmission(CourseID uuid.UUID, AssignmentID uuid.UUID) (response.StudentSubmissionSplitResponse, error) {
	var studentList []response.StudentListForSubmissionResponse

	if err := r.db.Table("personal_data").
		Select(`
		personal_data.personal_data_id,
		CONCAT(personal_data.first_name, ' ', personal_data.last_name) AS full_name,
		personal_data.email,
		personal_data.student_code,
		CASE WHEN submissions.submission_id IS NOT NULL THEN TRUE ELSE FALSE END AS has_submission
	`).
		Joins("JOIN enrollment_lists ON enrollment_lists.personal_data_id = personal_data.personal_data_id").
		Joins("LEFT JOIN submissions ON submissions.belongs_to = personal_data.personal_data_id AND submissions.assignment_id = ?", AssignmentID).
		Where("enrollment_lists.course_id = ?", CourseID).
		Where("personal_data.role_type = ?", "STUDENT").
		Where("personal_data.deleted_at IS NULL").
		Where("enrollment_lists.deleted_at IS NULL").
		Scan(&studentList).Error; err != nil {
		return response.StudentSubmissionSplitResponse{}, err
	}

	var withSubmission []response.StudentListForSubmissionResponse
	var withoutSubmission []response.StudentListForSubmissionResponse

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

func (r *GormInstructorRepository) FindAssignmentDetails(CourseID uuid.UUID, AssignmentID uuid.UUID) (map[string]interface{}, error) {
	var assignmentDetails map[string]interface{}

	if err := r.db.Table("assignments").
		Select(`assignments.assignment_id, assignments.assignment_name, assignments.submiss_by`).
		Where("assignments.course_id = ? AND assignments.assignment_id = ? AND assignments.deleted_at IS NULL", CourseID, AssignmentID).
		Find(&assignmentDetails).Error; err != nil {
		return nil, err
	}
	return assignmentDetails, nil
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

// AddSingleUserRoster adds a single user to a course
func (r *GormInstructorRepository) AddSingleUserRoster(personalData *models.PersonalData, enrollment *models.EnrollmentList) error {
	tx := r.db.Begin()

	var existingPersonalData models.PersonalData
	err := tx.Table("personal_data").
		Select("personal_data.*").
		Joins("LEFT JOIN enrollment_lists ON personal_data.personal_data_id = enrollment_lists.personal_data_id").
		Where("personal_data.email = ? AND personal_data.role_type = ? AND enrollment_lists.course_id = ?",
			personalData.Email, personalData.RoleType, enrollment.CourseID).
		First(&existingPersonalData).Error
	if err == nil {
		enrollment.PersonalDataID = existingPersonalData.PersonalDataID
	} else if err != gorm.ErrRecordNotFound {
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
		Where("course_id = ? AND personal_data_id = ? AND (section_id = ? OR section_id IS NULL)",
			enrollment.CourseID, enrollment.PersonalDataID, enrollment.SectionID).
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

func (r *GormInstructorRepository) AddMultipleUserRoster(personalData []models.PersonalData, enrollmentLists []models.EnrollmentList) error {
	tx := r.db.Begin()

	for i, pd := range personalData {
		var existingPersonalData models.PersonalData
		err := tx.Table("personal_data").
			Select("personal_data.*").
			Joins("LEFT JOIN enrollment_lists ON personal_data.personal_data_id = enrollment_lists.personal_data_id").
			Where("personal_data.email = ? AND personal_data.role_type = ? AND enrollment_lists.course_id = ?",
				pd.Email, pd.RoleType, enrollmentLists[i].CourseID).
			First(&existingPersonalData).Error
		if err == nil {
			enrollmentLists[i].PersonalDataID = existingPersonalData.PersonalDataID
		} else if err != gorm.ErrRecordNotFound {
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
			Where("course_id = ? AND personal_data_id = ? AND (section_id = ? OR section_id IS NULL)",
				enrollmentLists[i].CourseID, enrollmentLists[i].PersonalDataID, enrollmentLists[i].SectionID).
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
		Select("courses.course_id, courses.course_name, courses.course_code, courses.course_description, courses.semester, courses.academic_year, courses.entry_code, COUNT(assignments.assignment_id) AS total_assignments").
		Joins("JOIN enrollment_lists ON enrollment_lists.course_id = courses.course_id").
		Joins("JOIN personal_data ON personal_data.personal_data_id = enrollment_lists.personal_data_id").
		Joins("JOIN users ON users.email = personal_data.email").
		Joins("LEFT JOIN assignments ON assignments.course_id = courses.course_id").
		Where("users.user_id = ?", UserID).
		Where("courses.deleted_at IS NULL").
		Group("courses.course_id").
		Find(&courses).Error; err != nil {
		return nil, err
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
		Select("DISTINCT ON (assignments.assignment_id) assignments.assignment_id, assignments.assignment_name, assignments.submiss_by, assignments.published, assignments.regrades, assignment_sections.release_date AS assignment_release_date, assignment_sections.due_date AS assignment_due_date").
		Joins("LEFT JOIN assignment_sections ON assignments.assignment_id = assignment_sections.assignment_id AND assignment_sections.deleted_at IS NULL").
		Where("assignments.course_id = ? AND assignments.deleted_at IS NULL", CourseID).
		Find(&assignments).Error; err != nil {
		return nil, err
	}

	for i := range assignments {
		var assignmentSections []response.AssignmentSectionResponse

		if err := r.db.
			Table("assignment_sections").
			Select("assignment_sections.assignment_id, assignment_sections.assignment_section_id, assignment_sections.release_date, assignment_sections.due_date, assignment_sections.cut_off_date, sections.section_id, sections.section_name").
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
		Select("DISTINCT ON (assignments.assignment_id) assignments.assignment_id, assignments.assignment_name, assignments.submiss_by, assignments.published, assignments.regrades, assignment_sections.release_date AS assignment_release_date, assignment_sections.due_date AS assignment_due_date").
		Joins("JOIN assignment_sections ON assignments.assignment_id = assignment_sections.assignment_id AND assignment_sections.deleted_at IS NULL").
		Find(&assignments, "assignments.course_id = ? AND assignments.deleted_at IS NULL", CourseID).Error; err != nil {
		return nil, err
	}
	return assignments, nil
}

func (r *GormInstructorRepository) FindActiveAssignmentsByCourseID(CourseID uuid.UUID) ([]response.AssignmentActiveResponse, error) {
	var activeAssignments []response.AssignmentActiveResponse
	currentDate := time.Now()

	if err := r.db.
		Table("assignments").
		Select("DISTINCT ON (assignments.assignment_id) assignments.assignment_id, assignments.assignment_name, assignments.assignment_description, assignments.submiss_by, assignments.published, assignments.regrades, assignments.created_at, assignment_sections.release_date AS assignment_release_date, assignment_sections.due_date AS assignment_due_date, assignment_sections.cut_off_date AS assignment_cut_off_date").
		Joins("JOIN assignment_sections ON assignments.assignment_id = assignment_sections.assignment_id").
		Where(`
			assignment_sections.release_date <= ?
			AND (assignment_sections.due_date > ? 
				OR (assignment_sections.cut_off_date IS NOT NULL AND assignment_sections.cut_off_date > ?)
				)
			AND assignments.course_id = ? 
			AND assignment_sections.deleted_at IS NULL
			AND assignments.deleted_at IS NULL`,
			currentDate, currentDate, currentDate, CourseID).
		Order("assignments.assignment_id, assignment_sections.release_date ASC").
		Find(&activeAssignments).Error; err != nil {
		return nil, err
	}
	return activeAssignments, nil
}

func (r *GormInstructorRepository) FindAssignmentByCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) (*response.AssignmentResponse, error) {
	var assignment response.Assignment

	if err := r.db.
		Table("assignments").
		Select("assignment_id, assignment_name, assignment_description, submiss_by, grading_type, late_submiss, published, regrades, group_submiss").
		Where("course_id = ? AND assignment_id = ? AND deleted_at IS NULL", CourseID, AssignmentID).
		First(&assignment).Error; err != nil {
		return nil, err
	}

	var assignmentSections []response.AssignmentSection

	if err := r.db.
		Table("assignment_sections").
		Select("assignment_section_id, release_date, due_date, cut_off_date, sections.section_id, sections.section_name").
		Joins("LEFT JOIN sections ON assignment_sections.section_id = sections.section_id").
		Where("assignment_sections.assignment_id = ?", AssignmentID).
		Find(&assignmentSections).Error; err != nil {
		return nil, err
	}

	assignmentResponse := response.AssignmentResponse{
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

func (r *GormInstructorRepository) AddSubmissionAFile(submissionFile *models.Submission) error {
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
	var submissionFiles []response.SubmissionFilesResponse

	if err := r.db.
		Table("submissions").
		Select("submission_id, submission_file_name, submitted_at").
		Where("assignment_id = ?", AssignmentID).
		Where("deleted_at IS NULL").
		Find(&submissionFiles).Error; err != nil {
		return nil, err
	}
	return submissionFiles, nil
}

func (r *GormInstructorRepository) FindSubmissionListByCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]response.SubmissionResponse, error) {
	var submissionList []response.SubmissionResponse

	if err := r.db.
		Table("submissions").
		Select("submissions.submission_id, submissions.submitted_at, personal_data.personal_data_id, personal_data.student_code, CONCAT(personal_data.first_name, ' ', personal_data.last_name) AS full_name, personal_data.email, sections.section_name").
		Joins("JOIN users ON submissions.submitted_by = users.user_id").
		Joins("JOIN personal_data ON users.email = personal_data.email").
		Joins("JOIN enrollment_lists ON personal_data.personal_data_id = enrollment_lists.personal_data_id").
		Joins("JOIN sections ON enrollment_lists.section_id = sections.section_id").
		Where("enrollment_lists.course_id = ? AND submissions.assignment_id = ?", CourseID, AssignmentID).
		Where("submissions.deleted_at IS NULL AND users.deleted_at IS NULL AND personal_data.deleted_at IS NULL AND sections.deleted_at IS NULL AND enrollment_lists.deleted_at IS NULL").
		Order("submissions.submitted_at ASC").
		Scan(&submissionList).Error; err != nil {
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

		rubric := models.Rubric{
			RubricID:     uuid.New(),
			AssignmentID: AssignmentID,
			RubricData:   map[string]interface{}{},
		}

		if err := tx.Create(&rubric).Error; err != nil {
			return err
		}

		var questionBoxIDs []uuid.UUID
		for _, box := range boundingBoxes {
			if box.BoundingBoxType == "question" {
				questionBoxIDs = append(questionBoxIDs, box.BoundingBoxID)
			}
		}

		if len(questionBoxIDs) < utils.CountTotalQuestions(rubricData) {
			return fmt.Errorf("not enough question bounding boxes")
		}

		totalQuestions := utils.CountTotalQuestions(rubricData)
		if len(questionBoxIDs) < totalQuestions {
			return fmt.Errorf("not enough question bounding boxes")
		}

		var formattedQuestions []map[string]interface{}
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
			formattedQuestions = append(formattedQuestions, questionEntry)
		}

		rubric.RubricData["questions_data"] = formattedQuestions
		if err := tx.Model(&models.Rubric{}).
			Where("rubric_id = ?", rubric.RubricID).
			Update("rubric_data", rubric.RubricData).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *GormInstructorRepository) FindBoundingBoxesByAssignmentTemplate(AssignmentID uuid.UUID) ([]response.BoundingBoxTemplateResponse, error) {
	var boundingBoxes []struct {
		BoundingBoxID       uuid.UUID `json:"bounding_box_id"`
		BoundingBoxPosition string    `json:"bounding_box_position"`
		BoundingBoxType     string    `json:"bounding_box_type"`
		BoundingBoxPage     uint      `json:"bounding_box_page"`
	}

	if err := r.db.
		Table("bounding_boxes").
		Select("bounding_box_id, bounding_box_position, bounding_box_type, bounding_box_page").
		Where("bounding_boxes.assignment_id = ?", AssignmentID).
		Where("bounding_boxes.deleted_at IS NULL").
		Find(&boundingBoxes).Error; err != nil {
		return nil, err
	}

	var responseBoundingBoxes []response.BoundingBoxTemplateResponse
	for _, box := range boundingBoxes {
		responseBoundingBoxes = append(responseBoundingBoxes, response.BoundingBoxTemplateResponse{
			BoundingBoxID:       box.BoundingBoxID,
			BoundingBoxPosition: box.BoundingBoxPosition,
			BoundingBoxType:     box.BoundingBoxType,
			BoundingBoxPage:     box.BoundingBoxPage,
		})
	}
	return responseBoundingBoxes, nil
}

func (r *GormInstructorRepository) FindBoundingBoxesType(AssignmentID uuid.UUID) ([]response.SubmissionBoxPositionResponse, error) {
	var boundingBoxes []response.SubmissionBoxPositionResponse

	if err := r.db.
		Table("bounding_boxes").
		Select("bounding_box_position, bounding_box_type").
		Where("assignment_id = ? AND bounding_box_type IN ('name', 'id') AND deleted_at IS NULL", AssignmentID).
		Find(&boundingBoxes).Error; err != nil {
		return nil, err
	}
	return boundingBoxes, nil
}

func (r *GormInstructorRepository) ModifyBoundingBoxes(AssignmentID uuid.UUID, boundingBoxes []models.BoundingBox) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for i := range boundingBoxes {
			if err := tx.Model(&models.BoundingBox{}).
				Where("assignment_id = ? AND bounding_box_id = ?", AssignmentID, boundingBoxes[i].BoundingBoxID).
				Updates(map[string]interface{}{
					"bounding_box_position": boundingBoxes[i].BoundingBoxPosition,
					"bounding_box_type":     boundingBoxes[i].BoundingBoxType,
					"bounding_box_page":     boundingBoxes[i].BoundingBoxPage,
				}).Error; err != nil {
				return err
			}
		}
		return nil
	})
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

func (r *GormInstructorRepository) FindQuestionsByAssignmentTemplate(AssignmentID uuid.UUID) (*response.QuestionsTemplateResponse, error) {
	var rubric struct {
		RubricID   uuid.UUID
		RubricData []byte
	}

	err := r.db.
		Table("rubrics").
		Select("rubric_id, rubric_data").
		Where("assignment_id = ?", AssignmentID).
		Where("deleted_at IS NULL").
		First(&rubric).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return &response.QuestionsTemplateResponse{
			RubricID:   uuid.Nil,
			RubricData: map[string]interface{}{},
		}, nil
	}

	var rubricData map[string]interface{}
	if err := json.Unmarshal(rubric.RubricData, &rubricData); err != nil {
		return nil, fmt.Errorf("failed to parse rubric_data: %v", err)
	}

	return &response.QuestionsTemplateResponse{
		RubricID:   rubric.RubricID,
		RubricData: rubricData,
	}, nil
}

// For rubric
// func (r *GormInstructorRepository) AddRubric(AssignmentID uuid.UUID, rubric *models.Rubric) error {
// 	if err := r.db.Create(rubric).Error; err != nil {
// 		return err
// 	}
// 	return nil
// }
