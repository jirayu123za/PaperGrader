package utils

import (
	"fmt"
	"time"
)

func GetStringValue(data map[string]interface{}, key string) string {
	if val, ok := data[key]; ok && val != nil {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return ""
}

func GetStringPointer(data map[string]interface{}, key string) *string {
	if val, ok := data[key]; ok && val != nil {
		if str, ok := val.(string); ok && str != "" {
			return &str
		}
	}
	return nil
}

func ParseDate(dateStr, layout string) (*time.Time, error) {
	if dateStr == "" {
		return nil, nil
	}
	parsedDate, err := time.Parse(time.RFC3339, dateStr)
	if err != nil {
		fmt.Printf("Failed to parse date: %s\nError: %v\n", dateStr, err)
		return nil, err
	}
	location, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		return nil, fmt.Errorf("failed to load location: %v", err)
	}
	localDate := parsedDate.In(location)
	fmt.Printf("Parsed Date in Local Timezone: %v\n", localDate)
	return &localDate, nil
}
