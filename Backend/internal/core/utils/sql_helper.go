package utils

import (
	"path/filepath"
	"regexp"
	"strings"

	"github.com/google/uuid"
)

var (
	reSubmission = regexp.MustCompile(`(?i)[-_]submission[-_]\d+$`)
	reSubmitted  = regexp.MustCompile(`(?i)[-_]submitted$`)
)

func StripLeadingUUID(name string) (string, bool) {
	if len(name) < 36 {
		return name, false
	}
	cand := name[:36]
	if _, err := uuid.Parse(cand); err != nil {
		return name, false
	}
	rest := name[36:]
	rest = strings.TrimLeft(rest, "-_")
	return rest, true
}

func CleanFileName(name string) string {
	n, _ := StripLeadingUUID(name)

	ext := filepath.Ext(n)
	base := strings.TrimSuffix(n, ext)
	base = reSubmission.ReplaceAllString(base, "")
	base = reSubmitted.ReplaceAllString(base, "")
	return base + ext
}

func FilePrefix(name string) string {
	cleaned := CleanFileName(name)
	ext := filepath.Ext(cleaned)
	return strings.TrimSuffix(cleaned, ext)
}
