package utils

import (
	"fmt"
	"log"
	"math"
	"os/exec"
	"paperGrader/internal/adapters/response"
	"strings"

	"github.com/agnivade/levenshtein"
	"github.com/google/uuid"
)

func PerformOCRThaiText(imagePath string) (string, error) {
	cmd := exec.Command("tesseract", imagePath, "stdout", "-l", "tha", "--oem", "1", "--psm", "6")

	var stderr strings.Builder
	cmd.Stderr = &stderr

	output, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("tesseract error (thai text): %v, details: %s", err, stderr.String())
	}

	return strings.TrimSpace(string(output)), nil
}

func PerformOCRDigitsOnly(imagePath string) (string, error) {
	cmd := exec.Command(
		"tesseract", imagePath, "stdout",
		"-l", "eng", "--oem", "1", "--psm", "6",
		"-c", "tessedit_char_whitelist=0123456789",
	)

	var stderr strings.Builder
	cmd.Stderr = &stderr

	output, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("tesseract error (digits only): %v, details: %s", err, stderr.String())
	}

	return strings.TrimSpace(string(output)), nil
}

func CalculateSimilarity(a, b string) float64 {
	lowerA := strings.ToLower(a)
	lowerB := strings.ToLower(b)

	distance := levenshtein.ComputeDistance(lowerA, lowerB)
	maxLen := math.Max(float64(len(lowerA)), float64(len(lowerB)))

	if maxLen == 0 {
		// log
		log.Printf("[SIM] Compare '%s' with '%s' → maxLen = 0 → return 1.0", a, b)
		return 1.0
	}

	similarity := 1.0 - float64(distance)/maxLen
	// log
	log.Printf("[SIM] Compare '%s' with '%s' → distance: %d, similarity: %.2f", a, b, distance, similarity)
	return similarity
}

func MatchOCRWithStudentList(
	ocrName string,
	ocrStudentCode string,
	students []response.StudentListForOCRResponse,
	threshold float64,
) response.MatchLog {
	// log
	log.Printf("\n Matching OCR result:\n  Name:  %s\n  Code:  %s\n", ocrName, ocrStudentCode)

	var bestMatch response.StudentListForOCRResponse
	var bestSim float64 = 0
	var matchedID *uuid.UUID

	for _, s := range students {
		simName := CalculateSimilarity(ocrName, s.FullName)
		simCode := CalculateSimilarity(ocrStudentCode, s.StudentCode)
		avgSim := (simName + simCode) / 2

		// log
		log.Printf("Comparing with student:\n  → %s (%s)\n  → simName: %.2f, simCode: %.2f, avg: %.2f\n", s.FullName, s.StudentCode, simName, simCode, avgSim)

		if avgSim > bestSim {
			bestSim = avgSim
			bestMatch = s
		}
	}

	matchType := "none"
	if bestSim >= threshold {
		matchType = "auto"
		matchedID = &bestMatch.PersonalDataID
	} else if bestSim >= 0.5 {
		matchType = "manual"
	}

	// log
	log.Printf("Best Match → %s (%s) with similarity %.2f → MatchType: %s\n", bestMatch.FullName, bestMatch.StudentCode, bestSim, matchType)

	return response.MatchLog{
		OCRFullName:           ocrName,
		OCRStudentCode:        ocrStudentCode,
		MatchedPersonalDataID: matchedID,
		Similarity:            bestSim,
		MatchType:             matchType,
	}
}

func RemoveMatchedStudent(students []response.StudentListForOCRResponse, matchedID uuid.UUID) []response.StudentListForOCRResponse {
	var updated []response.StudentListForOCRResponse
	for _, s := range students {
		if s.PersonalDataID != matchedID {
			updated = append(updated, s)
		}
	}
	return updated
}
