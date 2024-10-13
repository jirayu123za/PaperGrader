package adapters

import (
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
func (r *GormInstructorRepository) AddAssignmentWithFiles(CourseID uuid.UUID, assignment *models.Assignment, files []models.AssignmentFile, uploads []models.Upload) error {
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
		return nil
	})
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

	if err := r.db.Table("users").
		// Select("users.user_id, users.first_name, users.last_name, users.email, user_groups.group_name AS user_group_name, COUNT(submissions.submission_id) AS submission_count").
		// Joins("LEFT JOIN user_groups ON users.group_id = user_groups.group_id").
		// Joins("LEFT JOIN instructor_lists ON users.user_id = instructor_lists.user_id AND instructor_lists.course_id = ?", CourseID).
		// Joins("LEFT JOIN enrollments ON users.user_id = enrollments.user_id AND enrollments.course_id = ?", CourseID).
		// Joins("LEFT JOIN submissions ON users.user_id = submissions.user_id AND submissions.assignment_id IN (SELECT assignment_id FROM assignments WHERE course_id = ?)", CourseID).
		// Preload("Submissions").
		// Where("instructor_lists.course_id IS NOT NULL OR enrollments.course_id IS NOT NULL").
		// Group("users.user_id, user_groups.group_name").
		// Scan(&users).Error
		Select("users.user_id, users.first_name, users.last_name, users.email, user_groups.group_name AS user_group_name, COUNT(submissions.submission_id) AS submission_count").
		Joins("LEFT JOIN user_groups ON users.group_id = user_groups.group_id").
		Joins("LEFT JOIN instructor_lists ON users.user_id = instructor_lists.user_id AND instructor_lists.course_id = ?", CourseID).
		Joins("LEFT JOIN enrollments ON users.user_id = enrollments.user_id AND enrollments.course_id = ?", CourseID).
		Joins("LEFT JOIN submissions ON users.user_id = submissions.user_id AND submissions.assignment_id IN (SELECT assignment_id FROM assignments WHERE course_id = ?)", CourseID).
		Group("users.user_id, user_groups.group_name").
		Scan(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (r *GormInstructorRepository) FindCoursesByUserID(UserID uuid.UUID) ([]*models.Course, error) {
	var courses []*models.Course
	if err := r.db.
		Joins("JOIN instructor_lists ON instructor_lists.course_id = courses.course_id").
		Where("instructor_lists.user_id = ?", UserID).
		Find(&courses).Error; err != nil {
		return nil, err
	}
	return courses, nil
}

func (r *GormInstructorRepository) FindAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error) {
	var assignments []*models.Assignment
	if result := r.db.Find(&assignments, "course_id = ?", CourseID); result.Error != nil {
		return nil, result.Error
	}
	return assignments, nil
}

func (r *GormInstructorRepository) FindActiveAssignmentsByCourseID(CourseID uuid.UUID) ([]*models.Assignment, error) {
	var activeAssignments []*models.Assignment
	currentDate := time.Now().Format("02-01-2006")

	if result := r.db.Find(&activeAssignments, "course_id = ? AND due_date >= ? AND release_date <= ? AND cut_off_date > ?", CourseID, currentDate, currentDate, currentDate); result.Error != nil {
		return nil, result.Error
	}
	return activeAssignments, nil
}

func (r *GormInstructorRepository) FindInstructorsNameByCourseID(CourseID uuid.UUID) ([]*models.User, error) {
	var instructors []*models.User
	if err := r.db.
		Joins("JOIN instructor_lists ON instructor_lists.user_id = users.user_id").
		Where("instructor_lists.course_id = ?", CourseID).
		Find(&instructors).Error; err != nil {
		return nil, err
	}
	return instructors, nil
}
