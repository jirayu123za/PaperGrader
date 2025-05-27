package utils

import "paperGrader/internal/adapters/response"

func CountTotalQuestions(questions []response.RubricQuestion) int {
	count := 0
	for _, q := range questions {
		if len(q.SubQuestions) > 0 {
			count += len(q.SubQuestions)
		} else {
			count++
		}
	}
	return count
}
