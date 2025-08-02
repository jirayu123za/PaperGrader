package utils

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
