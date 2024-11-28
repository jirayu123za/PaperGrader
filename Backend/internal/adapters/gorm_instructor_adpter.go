package adapters

import (
	"fmt"
	"paperGrader/internal/models"
	"time"

	"github.com/google/uuid"
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

// Find instructors and students by course id
func (r *GormInstructorRepository) FindRosterByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error) {
	var users []map[string]interface{}

	if err := r.db.Table("enrollment_lists").
		Select(`personal_data.personal_data_id,
				CONCAT(personal_data.first_name, ' ', personal_data.last_name) AS full_name,
		        personal_data.email,
				personal_data.student_code,
		        personal_data.role_type,
		        STRING_AGG(DISTINCT sections.section_name, ', ') AS section_name,
		        COUNT(submissions.submission_id) AS submission_count`).
		Joins("JOIN personal_data ON enrollment_lists.personal_data_id = personal_data.personal_data_id").
		Joins("LEFT JOIN sections ON enrollment_lists.section_id = sections.section_id").
		Joins("LEFT JOIN submissions ON enrollment_lists.personal_data_id = submissions.user_id AND submissions.assignment_id IN (SELECT assignment_id FROM assignments WHERE assignments.course_id = ?)", CourseID).
		Where("enrollment_lists.course_id = ? AND enrollment_lists.deleted_at IS NULL", CourseID).
		Group("personal_data.personal_data_id, personal_data.first_name, personal_data.last_name, personal_data.email, personal_data.role_type").
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
		Scan(&sectionsDetails).Error; err != nil {
		return nil, err
	}
	return sectionsDetails, nil
}

// Add student or instructor to course
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

func (r *GormInstructorRepository) FindInstructorExists(userID, courseID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.Table("instructor_lists").
		Where("user_id = ? AND course_id = ?", userID, courseID).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *GormInstructorRepository) FindStudentExists(userID, courseID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.Table("enrollments").
		Where("user_id = ? AND course_id = ?", userID, courseID).
		Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
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

func (r *GormInstructorRepository) FindAssignmentsByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error) {
	var assignments []map[string]interface{}

	if err := r.db.
		Table("assignments").
		Select("DISTINCT ON (assignments.assignment_id) assignments.assignment_id, assignments.assignment_name, assignments.submiss_by, assignments.published, assignments.regrades, assignment_sections.release_date AS assignment_release_date, assignment_sections.due_date AS assignment_due_date").
		Joins("JOIN assignment_sections ON assignments.assignment_id = assignment_sections.assignment_id").
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
		Select("DISTINCT ON (assignments.assignment_id) assignments.assignment_id, assignments.assignment_name, assignments.assignment_description, assignments.submiss_by, assignments.published, assignments.regrades, assignment_sections.release_date AS assignment_release_date, assignment_sections.due_date AS assignment_due_date").
		Joins("JOIN assignment_sections ON assignments.assignment_id = assignment_sections.assignment_id").
		Where("assignment_sections.release_date <= ? AND (assignment_sections.cut_off_date IS NULL OR assignment_sections.cut_off_date > ?) AND assignments.course_id = ? AND assignments.deleted_at IS NULL", currentDate, currentDate, CourseID).
		Order("assignments.assignment_id, assignment_sections.release_date ASC").
		Find(&activeAssignments).Error; err != nil {
		return nil, err
	}
	return activeAssignments, nil
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
