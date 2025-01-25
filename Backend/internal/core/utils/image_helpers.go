package utils

import (
	"encoding/base64"
	"errors"
	"fmt"
	"log"
	"regexp"
	"strings"
)

var base64Regex = regexp.MustCompile(`^data:image\/[a-z]+;base64,`)

func DecodeBase64(base64Str string) ([]byte, error) {
	base64Str = base64Regex.ReplaceAllString(base64Str, "")
	base64Str = strings.TrimSpace(base64Str)

	if len(base64Str) == 0 {
		return nil, errors.New("empty Base64 string")
	}

	base64Str = strings.ReplaceAll(base64Str, "-", "+")
	base64Str = strings.ReplaceAll(base64Str, "_", "/")

	if len(base64Str)%4 != 0 {
		base64Str += strings.Repeat("=", 4-(len(base64Str)%4))
	}

	data, err := base64.StdEncoding.DecodeString(base64Str)
	if err != nil {
		log.Println("Error decoding Base64:", err)
		return nil, errors.New("invalid Base64 encoding")
	}
	return data, nil
}

func EncodeBase64(data []byte) string {
	return fmt.Sprintf("data:image/png;base64,%s", base64.StdEncoding.EncodeToString(data))
}
