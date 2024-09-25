package adapters

import (
	"paperGrader/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Secondary adapters
type GormUniversityRepository struct {
	db *gorm.DB
}

func NewGormUniversityRepository(db *gorm.DB) *GormUniversityRepository {
	return &GormUniversityRepository{
		db: db,
	}
}

func (r *GormUniversityRepository) AddUniversity(university *models.University) error {
	return r.db.Save(university).Error
}

func (r *GormUniversityRepository) FindUniversityByID(universityID uuid.UUID) (*models.University, error) {
	var university *models.University
	if err := r.db.Where("university_id = ?", universityID).First(&university).Error; err != nil {
		return nil, err
	}
	return university, nil
}

func (r *GormUniversityRepository) FindUniversities() ([]*models.University, error) {
	var universities []*models.University
	if err := r.db.Find(&universities).Error; err != nil {
		return nil, err
	}
	return universities, nil
}

func (r *GormUniversityRepository) ModifyUniversity(university *models.University) error {
	var existingUniversity *models.University
	if result := r.db.First(&existingUniversity, "university_id = ?", university.UniversityID); result.Error != nil {
		return result.Error
	}

	existingUniversity.UniversityName = university.UniversityName
	if result := r.db.Save(&existingUniversity); result.Error != nil {
		return result.Error
	}
	return nil
}

func (r *GormUniversityRepository) RemoveUniversity(university *models.University) error {
	var existingUniversity *models.University
	if result := r.db.First(&existingUniversity, "university_id = ?", university.UniversityID); result.Error != nil {
		return result.Error
	}

	if result := r.db.Delete(&existingUniversity); result.Error != nil {
		return result.Error
	}
	return nil
}
