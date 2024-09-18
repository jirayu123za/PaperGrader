package models

import (
	"github.com/google/uuid"
)

type File struct {
	ID   uuid.UUID
	Name string
	URL  string
}
