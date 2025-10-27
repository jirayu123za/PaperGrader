package utils

import (
	"encoding/json"
	"fmt"
	"paperGrader/internal/adapters/response"
	"strings"

	"github.com/google/uuid"
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

func PruneRubricByBoundingBoxes(rubricJSON map[string]interface{}, ids []uuid.UUID) (map[string]interface{}, bool, error) {
	if rubricJSON == nil || len(rubricJSON) == 0 {
		return rubricJSON, false, nil
	}
	if len(ids) == 0 {
		return rubricJSON, false, nil
	}

	idSet := make(map[string]struct{}, len(ids))
	for _, id := range ids {
		idSet[strings.ToLower(id.String())] = struct{}{}
	}

	qsRaw, ok := rubricJSON["questions_data"]
	if !ok || qsRaw == nil {
		return rubricJSON, false, nil
	}
	qsSlice, ok := qsRaw.([]interface{})
	if !ok {
		return nil, false, fmt.Errorf("questions_data is not an array")
	}

	changed := false
	keptQs := make([]interface{}, 0, len(qsSlice))

	for _, qRaw := range qsSlice {
		qMap, ok := qRaw.(map[string]interface{})
		if !ok {
			keptQs = append(keptQs, qRaw)
			continue
		}

		if del, hit, err := shouldDeleteByBBox(qMap, "bounding_box_id", idSet); err != nil {
			return nil, false, err
		} else if hit && del {
			changed = true
			continue
		}

		if sqRaw, hasSQ := qMap["sub_questions"]; hasSQ && sqRaw != nil {
			if sqSlice, ok := sqRaw.([]interface{}); ok {
				keptSubs := make([]interface{}, 0, len(sqSlice))
				for _, one := range sqSlice {
					sqMap, ok := one.(map[string]interface{})
					if !ok {
						keptSubs = append(keptSubs, one)
						continue
					}
					if del, hit, err := shouldDeleteByBBox(sqMap, "bounding_box_id", idSet); err != nil {
						return nil, false, err
					} else if hit && del {
						changed = true
						continue
					}
					keptSubs = append(keptSubs, sqMap)
				}
				qMap["sub_questions"] = keptSubs
			}
		}

		if isNilOrEmpty(qMap["bounding_box_id"]) && isNilOrEmptyArray(qMap["sub_questions"]) {
			changed = true
			continue
		}

		keptQs = append(keptQs, qMap)
	}

	rubricJSON["questions_data"] = keptQs
	return rubricJSON, changed, nil
}

func shouldDeleteByBBox(m map[string]interface{}, key string, idSet map[string]struct{}) (delete bool, hit bool, err error) {
	v, ok := m[key]
	if !ok || v == nil {
		return false, false, nil
	}
	switch vv := v.(type) {
	case string:
		_, hit = idSet[strings.ToLower(vv)]
		return hit, hit, nil
	default:
		s := fmt.Sprintf("%v", vv)
		if _, parseErr := uuid.Parse(s); parseErr == nil {
			_, hit = idSet[strings.ToLower(s)]
			return hit, hit, nil
		}
		return false, false, nil
	}
}

func isNilOrEmpty(v interface{}) bool {
	return v == nil || v == ""
}

func isNilOrEmptyArray(v interface{}) bool {
	if v == nil {
		return true
	}
	if arr, ok := v.([]interface{}); ok {
		return len(arr) == 0
	}
	return false
}

func ParseRubricQuestions(rubricMap map[string]interface{}) ([]response.QuestionDetails, error) {
	b, err := json.Marshal(rubricMap)
	if err != nil {
		return nil, err
	}

	var wrap struct {
		QuestionsData []response.QuestionDetails `json:"questions_data"`
	}

	if err := json.Unmarshal(b, &wrap); err != nil {
		return nil, fmt.Errorf("invalid rubric_data: %w", err)
	}
	return wrap.QuestionsData, nil
}

func ClearAllSelections(questions *[]response.QuestionDetails) {
	for i := range *questions {
		q := &(*questions)[i]
		if q.Rubrics != nil {
			for j := range q.Rubrics.RubricDetails {
				q.Rubrics.RubricDetails[j].HasSelected = false
			}
		}
		for si := range q.SubQuestions {
			sq := &q.SubQuestions[si]
			if sq.Rubrics != nil {
				for dj := range sq.Rubrics.RubricDetails {
					sq.Rubrics.RubricDetails[dj].HasSelected = false
				}
			}
		}
	}
}

func CollectSelectedIDs(gradeMap map[string]interface{}) map[string]bool {
	selected := map[string]bool{}
	var walk func(v interface{})

	walk = func(v interface{}) {
		switch t := v.(type) {
		case map[string]interface{}:
			if id, ok := t["rubric_detail_id"].(string); ok {
				if hs, ok := t["has_selected"].(bool); ok && hs {
					selected[id] = true
				}
			}
			for _, vv := range t {
				walk(vv)
			}
		case []interface{}:
			for _, vv := range t {
				walk(vv)
			}
		}
	}
	walk(gradeMap)
	return selected
}

func ApplySelections(questions *[]response.QuestionDetails, selected map[string]bool) {
	for i := range *questions {
		q := &(*questions)[i]
		if q.Rubrics != nil {
			for j := range q.Rubrics.RubricDetails {
				id := q.Rubrics.RubricDetails[j].RubricDetailID
				q.Rubrics.RubricDetails[j].HasSelected = selected[id.String()]
			}
		}
		for si := range q.SubQuestions {
			sq := &q.SubQuestions[si]
			if sq.Rubrics != nil {
				for dj := range sq.Rubrics.RubricDetails {
					id := sq.Rubrics.RubricDetails[dj].RubricDetailID
					sq.Rubrics.RubricDetails[dj].HasSelected = selected[id.String()]
				}
			}
		}
	}
}
