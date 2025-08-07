package utils

import (
	"encoding/json"
	"paperGrader/internal/adapters/response"
)

func MergeRubricsFromMap(rubricData []response.RubricQuestion, rubricMap map[string]interface{}) []response.RubricQuestion {
	questionsData, ok := rubricMap["questions_data"].([]interface{})
	if !ok {
		return rubricData
	}

	questionRubricMap := map[string]map[string]interface{}{}
	subQuestionRubricMap := map[string]map[string]interface{}{}

	for _, qRaw := range questionsData {
		qMap := qRaw.(map[string]interface{})
		qID := qMap["question_id"].(string)

		if _, ok := questionRubricMap[qID]; !ok && qMap["rubrics"] != nil {
			questionRubricMap[qID] = qMap["rubrics"].(map[string]interface{})
		}

		if subs, ok := qMap["sub_questions"].([]interface{}); ok {
			for _, sqRaw := range subs {
				sqMap := sqRaw.(map[string]interface{})
				sqID := sqMap["sub_question_id"].(string)
				if _, ok := subQuestionRubricMap[sqID]; !ok && sqMap["rubrics"] != nil {
					subQuestionRubricMap[sqID] = sqMap["rubrics"].(map[string]interface{})
				}
			}
		}
	}

	for i, q := range rubricData {
		if q.Rubrics == nil && q.QuestionID != nil {
			if rubricMapData, ok := questionRubricMap[q.QuestionID.String()]; ok {
				jsonBytes, _ := json.Marshal(rubricMapData)
				var parsedRubric response.RubricResponse
				if err := json.Unmarshal(jsonBytes, &parsedRubric); err == nil {
					rubricData[i].Rubrics = &parsedRubric
				}
			}
		}

		for j, sq := range q.SubQuestions {
			if sq.Rubrics == nil && sq.SubQuestionID != nil {
				if rubricMapData, ok := subQuestionRubricMap[sq.SubQuestionID.String()]; ok {
					jsonBytes, _ := json.Marshal(rubricMapData)
					var parsedRubric response.RubricResponse
					if err := json.Unmarshal(jsonBytes, &parsedRubric); err == nil {
						rubricData[i].SubQuestions[j].Rubrics = &parsedRubric
					}
				}
			}
		}
	}

	return rubricData
}
