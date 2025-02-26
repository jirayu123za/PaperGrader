package repositories

import "mime/multipart"

type MinIORepository interface {
	AddFileToMinIO(file multipart.File, CourseID, AssignmentID, fileName string) error
	AddCroppedImage(CourseID, AssignmentID, fileName string, fileData []byte) error
	FindFileFromMinIO(CourseID, AssignmentID, fileName string) (string, error)
	FindFilesAndNames(CourseID, AssignmentID, fileNames []string) ([]string, []string, error)
	FindSubmissionFile(CourseID, AssignmentID, fileName string) ([]byte, error)

	FindTemplatePageCountFromMinIO(CourseID, AssignmentID, fileName string) (int, error)
}
