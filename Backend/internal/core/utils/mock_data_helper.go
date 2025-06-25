package utils

import (
	"math/rand"
)

func RandomGrader() string {
	graders := []string{"Dr. Smith", "Prof. Kim", "Dr. Lee", "Ms. Brown"}
	return graders[rand.Intn(len(graders))]
}
