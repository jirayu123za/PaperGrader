package adapters

import (
	"bytes"
	"fmt"
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

// !
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
		Joins("LEFT JOIN submissions ON enrollment_lists.personal_data_id = submissions.user_id AND submissions.assignment_id IN (SELECT assignment_id FROM assignments WHERE assignments.course_id = ?)", CourseID).
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
		        COUNT(submissions.submission_id) AS submission_count`).
		Joins("JOIN personal_data ON enrollment_lists.personal_data_id = personal_data.personal_data_id").
		Joins("LEFT JOIN sections ON enrollment_lists.section_id = sections.section_id").
		Joins("LEFT JOIN submissions ON enrollment_lists.personal_data_id = submissions.user_id AND submissions.assignment_id IN (SELECT assignment_id FROM assignments WHERE assignments.course_id = ?)", CourseID).
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

func (r *GormInstructorRepository) FindCoursesByUserID(UserID uuid.UUID) ([]map[string]interface{}, error) {
	var courses []map[string]interface{}

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

func (r *GormInstructorRepository) FindCourseByCourseID(CourseID uuid.UUID) (map[string]interface{}, error) {
	var course map[string]interface{}

	if err := r.db.
		Table("courses").
		Select("courses.course_id, courses.course_name, courses.course_code, courses.course_description, courses.semester, courses.academic_year, courses.entry_code").
		Where("courses.course_id = ? AND courses.deleted_at IS NULL", CourseID).
		Find(&course).Error; err != nil {
		return nil, err
	}
	return course, nil
}

func (r *GormInstructorRepository) FindInsAssignmentByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error) {
	var insAssignments []map[string]interface{}
	if err := r.db.
		Table("assignments").
		Select(`
			DISTINCT ON (assignments.assignment_id) assignments.assignment_id,
			assignments.assignment_name,
			assignments.submiss_by,
			assignments.published,
			assignments.regrades,
			assignment_sections.release_date AS assignment_release_date,
			assignment_sections.due_date AS assignment_due_date
		`).
		Joins("JOIN assignment_sections ON assignments.assignment_id = assignment_sections.assignment_id").
		Joins("JOIN sections ON assignment_sections.section_id = sections.section_id").
		Where("assignments.course_id = ? AND assignments.deleted_at IS NULL", CourseID).
		Find(&insAssignments).Error; err != nil {
		return nil, err
	}

	var assignmentSections []map[string]interface{}
	if err := r.db.
		Table("assignment_sections").
		Select(`
			assignment_sections.assignment_id,
			assignment_sections.assignment_section_id,
			assignment_sections.cut_off_date,
			assignment_sections.due_date,
			assignment_sections.release_date,
			sections.section_id,
			sections.section_name
		`).
		Joins("JOIN sections ON assignment_sections.section_id = sections.section_id").
		Where("assignment_sections.assignment_id IN (?)",
			r.db.
				Table("assignments").
				Select("assignment_id").
				Where("course_id = ? AND deleted_at IS NULL", CourseID),
		).
		Find(&assignmentSections).Error; err != nil {
		return nil, err
	}

	assignmentMap := make(map[string][]map[string]interface{})
	for _, section := range assignmentSections {
		assignmentID := section["assignment_id"].(string)
		assignmentMap[assignmentID] = append(assignmentMap[assignmentID], section)
	}

	var result []map[string]interface{}
	for _, assignment := range insAssignments {
		assignmentID := assignment["assignment_id"].(string)
		assignment["assignment_sections"] = assignmentMap[assignmentID]
		result = append(result, assignment)
	}

	return result, nil
}

func (r *GormInstructorRepository) FindAssignmentsByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error) {
	var assignments []map[string]interface{}

	if err := r.db.
		Table("assignments").
		Select("DISTINCT ON (assignments.assignment_id) assignments.assignment_id, assignments.assignment_name, assignments.submiss_by, assignments.published, assignments.regrades, assignment_sections.release_date AS assignment_release_date, assignment_sections.due_date AS assignment_due_date").
		Joins("JOIN assignment_sections ON assignments.assignment_id = assignment_sections.assignment_id AND assignment_sections.deleted_at IS NULL").
		Find(&assignments, "assignments.course_id = ? AND assignments.deleted_at IS NULL", CourseID).Error; err != nil {
		return nil, err
	}
	return assignments, nil
}

func (r *GormInstructorRepository) FindActiveAssignmentsByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error) {
	var activeAssignments []map[string]interface{}
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

func (r *GormInstructorRepository) FindAssignmentByCourseIDAndAssignmentID(CourseID uuid.UUID, AssignmentID uuid.UUID) ([]map[string]interface{}, error) {
	var assignmentDetails []map[string]interface{}

	if err := r.db.
		Table("assignments").
		Select(`assignments.assignment_id, assignments.assignment_name, assignments.assignment_description, assignments.submiss_by, assignments.grading_type, assignments.late_submiss, assignments.published, assignments.regrades, assignments.group_submiss,
				assignment_sections.assignment_section_id, assignment_sections.release_date, assignment_sections.due_date, assignment_sections.cut_off_date, 
                sections.section_id, sections.section_name`).
		Joins(`LEFT JOIN assignment_sections ON assignments.assignment_id = assignment_sections.assignment_id`).
		Joins(`LEFT JOIN sections ON assignment_sections.section_id = sections.section_id`).
		Where("assignments.course_id = ? AND assignments.assignment_id = ? AND assignments.deleted_at IS NULL", CourseID, AssignmentID).
		Find(&assignmentDetails).Error; err != nil {
		return nil, err
	}
	return assignmentDetails, nil
}

func (r *GormInstructorRepository) FindInstructorsNameByCourseID(courseID uuid.UUID) ([]*models.PersonalData, error) {
	var instructors []*models.PersonalData

	if err := r.db.
		Table("enrollment_lists").
		Select("personal_data.personal_data_id, personal_data.first_name, personal_data.last_name").
		Joins("JOIN personal_data ON enrollment_lists.personal_data_id = personal_data.personal_data_id").
		Where("enrollment_lists.course_id = ? AND personal_data.role_type = ?", courseID, "INSTRUCTOR").
		Find(&instructors).Error; err != nil {
		return nil, err
	}
	return instructors, nil
}
