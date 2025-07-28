package database

import (
	"fmt"
	"log"
	"os"
	"paperGrader/internal/config"
	"paperGrader/internal/models"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// CreateEnumsBoundingBoxType creates the enum type for BoundingBoxType if it does not exist
func CreateEnumsBoundingBoxType(db *gorm.DB) {
	err := db.Exec(`
		DO $$
		BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bounding_box_type_enum') THEN
				CREATE TYPE bounding_box_type_enum AS ENUM ('name', 'id', 'question');
			END IF;
		END$$;
	`).Error

	if err != nil {
		log.Fatalf("Failed to create enum: %v", err)
	}
}

// CreateEnumsSubmissionMatchedBy creates the enum type for SubmissionMatchedBy if it does not exist
func CreateEnumsSubmissionMatchedBy(db *gorm.DB) {
	err := db.Exec(`
		DO $$
		BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_matched_by') THEN
				CREATE TYPE submission_matched_by AS ENUM ('auto', 'manual');
			END IF;
		END$$;
	`).Error

	if err != nil {
		log.Fatalf("Failed to create enum: %v", err)
	}
}

// CreateEnumFileStatusType creates the enum type for FileStatus if it does not exist
func CreateEnumFileStatusType(db *gorm.DB) {
	err := db.Exec(`
		DO $$ 
		BEGIN
			IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'file_status_enum') THEN
				CREATE TYPE file_status_enum AS ENUM ('pending', 'completed', 'failed');
			END IF;
		END $$;
	`).Error

	if err != nil {
		log.Fatalf("Failed to create enum file_status_enum: %v", err)
	}
}

func ConnectPostgres(migrate bool) *gorm.DB {
	config.LoadEnv()
	dsn := os.Getenv("DATABASE_DSN")

	// Config log
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold: time.Second,
			LogLevel:      logger.Info,
			Colorful:      true,
		},
	)
	// Connect to database
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		panic("Failed to connect to database")
	}
	fmt.Println("Connected to database successfully")

	// Migration
	if migrate {
		CreateEnumsBoundingBoxType(db)
		CreateEnumsSubmissionMatchedBy(db)
		CreateEnumFileStatusType(db)

		db.Migrator().DropTable(
		// &models.AssignmentSection{},
		// &models.AssignmentFile{},
		// &models.SubmissionBox{},
		// &models.Submission{},
		// // models.EnrollmentList{}, // uncomment if you want to drop the EnrollmentList table
		// // &models.PersonalData{},  // uncomment if you want to drop the PersonalData table
		// // &models.Section{},       // uncomment if you want to drop the Section table
		// &models.Assignment{},
		// // &models.Course{}, // uncomment if you want to drop the Course table
		// // &models.ExportGrade{}, // uncomment if you want to drop the ExportGrade table
		// // &models.User{}, // uncomment if you want to drop the User table
		// // &models.UserGroup{},
		// // &models.University{},
		// &models.Upload{},
		// &models.BoundingBox{},
		// &models.Rubric{},
		// &models.Grade{},
		)

		err := db.AutoMigrate(
			&models.UserGroup{},
			&models.User{},
			&models.University{},
			&models.Course{},
			&models.Section{},
			&models.Assignment{},
			&models.AssignmentFile{},
			&models.PersonalData{},
			&models.ExportGrade{},
			&models.EnrollmentList{},
			&models.Submission{},
			&models.SubmissionBox{},
			&models.AssignmentSection{},
			&models.Upload{},
			&models.BoundingBox{},
			&models.Rubric{},
			&models.Grade{},
		)

		if err != nil {
			log.Fatal("Failed to migrate database: ", err)
		}
		fmt.Println("Database migration completed!")
	}
	return db
}
