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
		db.Migrator().DropTable(
			&models.AssignmentSection{},
			&models.AssignmentFile{},
			&models.Submission{},
			// &models.Enrollment{},
			// &models.InstructorList{},
			models.EnrollmentList{},
			&models.Section{},
			&models.Assignment{},
			&models.Course{},
			&models.User{},
			// &models.UserGroup{},
			// &models.University{},
			&models.Upload{},
		)

		err := db.AutoMigrate(
			&models.UserGroup{},
			&models.User{},
			&models.University{},
			&models.Course{},
			&models.Section{},
			&models.Assignment{},
			&models.AssignmentFile{},
			// &models.Enrollment{},
			// &models.InstructorList{},
			models.EnrollmentList{},
			&models.Submission{},
			&models.AssignmentSection{},
			&models.Upload{})
		if err != nil {
			log.Fatal("Failed to migrate database: ", err)
		}
		fmt.Println("Database migration completed!")
	}
	return db
}
