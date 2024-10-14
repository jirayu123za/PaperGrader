package repositories

import "mime/multipart"

type MinIORepository interface {
	AddFileToMinIO(file multipart.File, CourseID, AssignmentID, fileName string) error
	FindFileFromMinIO(CourseID, AssignmentID, fileName string) (string, error)
}
