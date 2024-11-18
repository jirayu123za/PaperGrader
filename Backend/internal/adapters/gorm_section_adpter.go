package adapters

import (
	"fmt"
	"paperGrader/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Secondary adapters
type GormSectionRepository struct {
	db *gorm.DB
}

func NewGormSectionRepository(db *gorm.DB) *GormSectionRepository {
	return &GormSectionRepository{
		db: db,
	}
}

func (r *GormSectionRepository) AddSection(CourseID uuid.UUID, sections interface{}) error {
	var existingCourse *models.Course
	if result := r.db.First(&existingCourse, "course_id = ?", CourseID); result.Error != nil {
		return result.Error
	}

	switch v := sections.(type) {
	case *models.Section:
		v.CourseID = existingCourse.CourseID
		if result := r.db.Create(v); result.Error != nil {
			return result.Error
		}
	case []*models.Section:
		for _, section := range v {
			section.CourseID = existingCourse.CourseID
		}
		if result := r.db.Create(&v); result.Error != nil {
			return result.Error
		}
	default:
		return fmt.Errorf("unsupported type: %T", sections)
	}
	return nil
}

func (r *GormSectionRepository) FindSectionsDetailsByCourseID(CourseID uuid.UUID) ([]*models.Section, error) {
	var sections []*models.Section
	if result := r.db.Preload("Enrollments").Preload("AssignmentSections").Find(&sections, "course_id = ?", CourseID); result.Error != nil {
		return nil, result.Error
	}
	return sections, nil
}

func (r GormSectionRepository) FindSectionIDsByCourseID(CourseID uuid.UUID) ([]uuid.UUID, error) {
	var sectionIDs []uuid.UUID
	if result := r.db.Model(&models.Section{}).Where("course_id = ?", CourseID).Pluck("section_id", &sectionIDs); result.Error != nil {
		return nil, result.Error
	}
	return sectionIDs, nil
}

func (r GormSectionRepository) FindSectionsNameByCourseID(CourseID uuid.UUID) ([]map[string]interface{}, error) {
	var sections []map[string]interface{}
	if result := r.db.Model(&models.Section{}).Select("section_id, section_name").Where("course_id = ?", CourseID).Find(&sections); result.Error != nil {
		return nil, result.Error
	}
	return sections, nil
}
