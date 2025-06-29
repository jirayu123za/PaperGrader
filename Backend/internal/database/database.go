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

		db.Migrator().DropTable(
		// &models.AssignmentSection{},
		// &models.AssignmentFile{},
		// &models.SubmissionBox{},
		// &models.Submission{},
		// // &models.Enrollment{},
		// // &models.InstructorList{},
		// // models.EnrollmentList{},
		// // &models.PersonalData{},
		// // &models.Section{},
		// &models.Assignment{},
		// // &models.Course{},
		// // &models.User{},
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
