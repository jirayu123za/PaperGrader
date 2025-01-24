package response

import (
	"time"

	"github.com/google/uuid"
)

type SubmissionResponse struct {
	SubmissionID   uuid.UUID `json:"submission_id"`
	SubmittedAt    time.Time `json:"submitted_at"`
	PersonalDataID uuid.UUID `json:"personal_data_id"`
	StudentCode    string    `json:"student_code"`
	FullName       string    `json:"full_name"`
	Email          string    `json:"email"`
	SectionName    string    `json:"section_name"`
}
