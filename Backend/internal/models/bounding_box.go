package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type BoundingBoxType string

const (
	NameRegion     BoundingBoxType = "name"
	IDRegion       BoundingBoxType = "id"
	QuestionRegion BoundingBoxType = "question"
)

type BoundingBoxData struct {
	PointX float64         `json:"point_x"`
	PointY float64         `json:"point_y"`
	Width  float64         `json:"width"`
	Height float64         `json:"height"`
	Type   BoundingBoxType `json:"bounding_box_type"`
	Page   uint            `json:"bounding_box_page"`
}

type BoundingBox struct {
	BoundingBoxID   uuid.UUID      `gorm:"primaryKey" json:"bounding_box_id"`
	AssignmentID    uuid.UUID      `gorm:"not null" json:"assignment_id"`
	BoundingBoxData datatypes.JSON `gorm:"type:jsonb;not null" json:"bounding_box_data"`
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       gorm.DeletedAt `gorm:"index"`
}

func (bounding_box *BoundingBox) BeforeCreate(tx *gorm.DB) (err error) {
	if bounding_box.BoundingBoxID == uuid.Nil {
		bounding_box.BoundingBoxID = uuid.New()
	}
	return
}
