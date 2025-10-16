package utils

import (
	"paperGrader/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func SeedsTables(db *gorm.DB) error {
	return db.Transaction(func(tx *gorm.DB) error {
		groups := []models.UserGroup{
			{GroupID: 1, GroupName: "INSTRUCTOR"},
			{GroupID: 2, GroupName: "STUDENT"},
			{GroupID: 3, GroupName: "ADMIN"},
		}
		if err := tx.Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "group_id"}},
			DoUpdates: clause.Assignments(map[string]interface{}{
				"group_name": gorm.Expr("EXCLUDED.group_name"),
				"deleted_at": nil,
				"updated_at": gorm.Expr("NOW()"),
			}),
		}).Create(&groups).Error; err != nil {
			return err
		}

		unis := []models.University{
			{UniversityID: uuid.MustParse("3c03e112-e515-4783-9a0c-15c56f2887c7"), UniversityName: "Chulalongkorn University"},
			{UniversityID: uuid.MustParse("001ae939-2353-4e1a-aeb7-0f44e7b6ce80"), UniversityName: "Thammasat University"},
			{UniversityID: uuid.MustParse("83b30013-0ccf-45ae-bdb7-5b924f897297"), UniversityName: "Kasetsart University"},
			{UniversityID: uuid.MustParse("742b61f0-749c-473f-ba45-2e58abed3cf6"), UniversityName: "Mahidol University"},
			{UniversityID: uuid.MustParse("08ff7b43-b6b8-4b52-a4a3-7a831ceaed3b"), UniversityName: "Chiang Mai University"},
			{UniversityID: uuid.MustParse("c67c88ce-5ddf-460d-aeed-c27eb07ab647"), UniversityName: "Khon Kaen University"},
			{UniversityID: uuid.MustParse("9ea6dec9-3e9d-4e5f-9fe5-23249290efad"), UniversityName: "Prince of Songkla University"},
			{UniversityID: uuid.MustParse("65b94224-ab9e-4c10-ab3b-9a92aff5e40b"), UniversityName: "King Mongkut's Institute of Technology Ladkrabang"},
			{UniversityID: uuid.MustParse("f90e06b8-3fff-4d57-96ec-abb4b0a9f060"), UniversityName: "Srinakharinwirot University"},
			{UniversityID: uuid.MustParse("da58e82e-99e9-4725-ad6d-6b147986ce8b"), UniversityName: "King Mongkut's University of Technology Thonburi 2"},
		}
		if err := tx.Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "university_id"}},
			DoUpdates: clause.Assignments(map[string]interface{}{
				"university_name": gorm.Expr("EXCLUDED.university_name"),
				"deleted_at":      nil,
				"updated_at":      gorm.Expr("NOW()"),
			}),
		}).Create(&unis).Error; err != nil {
			return err
		}
		return nil
	})
}
