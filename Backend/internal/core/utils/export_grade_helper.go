package utils

import "strings"

func Slugify(s string) string {
	s = strings.TrimSpace(s)
	s = strings.ToLower(s)
	s = strings.ReplaceAll(s, " ", "-")

	var b strings.Builder
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			b.WriteRune(r)
		}
	}

	out := b.String()
	if out == "" {
		return "export"
	}

	return out
}
