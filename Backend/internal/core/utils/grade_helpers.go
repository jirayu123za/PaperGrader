package utils

import (
	"errors"
	"paperGrader/internal/adapters/response"
)

func UpdateRubricSelection(gradeData map[string]interface{}, req response.CreateGradeRequest) error {
	questions, ok := gradeData["questions_data"].([]interface{})
	if !ok {
		return errors.New("invalid questions_data structure")
	}

	for _, q := range questions {
		question := q.(map[string]interface{})
		if question["question_id"] == req.QuestionID.String() {
			// Check if sub_questions exists
			if subQs, ok := question["sub_questions"].([]interface{}); ok && req.SubQuestionID != nil {
				for _, s := range subQs {
					subQ := s.(map[string]interface{})
					if subQ["sub_question_id"] == req.SubQuestionID.String() {
						return setSelectedRubric(subQ, req)
					}
				}
			} else {
				return setSelectedRubric(question, req)
			}
		}
	}

	return errors.New("rubric detail not found")
}

func setSelectedRubric(item map[string]interface{}, req response.CreateGradeRequest) error {
	rubrics, ok := item["rubrics"].(map[string]interface{})
	if !ok || rubrics["rubric_id"] != req.RubricID.String() {
		return errors.New("rubric_id not matched")
	}

	details, ok := rubrics["rubric_details"].([]interface{})
	if !ok {
		return errors.New("rubric_details missing or invalid")
	}

	for _, d := range details {
		detail := d.(map[string]interface{})
		if detail["rubric_detail_id"] == req.RubricDetailID.String() {
			detail["has_selected"] = req.HasSelected
			return nil
		}
	}

	return errors.New("rubric_detail_id not found")
}
