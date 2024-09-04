package models

import (
	"time"

	"gorm.io/gorm"
)

type UserGroup struct {
	GroupID   uint   `gorm:"primaryKey;autoIncrement" json:"group_id"`
	GroupName string `gorm:"type:varchar(50);not null" json:"group_name"`
	Users     []User `gorm:"foreignKey:GroupID"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}
