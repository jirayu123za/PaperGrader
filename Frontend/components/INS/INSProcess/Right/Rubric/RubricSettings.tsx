'use client';

import React from 'react';
import { Popover, Button, Radio, Text, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { IoIosSettings } from "react-icons/io";
import { useRubricStore } from '@/store/rubric/useRubricStore';
import { useQuestionStore } from '@/store/question/useQuestionStore';

export function RubricSettings() {
  const { rubricData, setRubricData } = useRubricStore();
  const { questions, selectedQuestion, defaultSelectedQuestion } = useQuestionStore();

  const getSelectedQuestionPoint = (): number | null => {
    const target = selectedQuestion ?? defaultSelectedQuestion;
    if (!target) return null;

    const question = questions.find(q => q.question_id === target.question_id);
    if (!question) return null;

    if (target.sub_question_id) {
        const sub = question.sub_questions?.find(sq => sq.sub_question_id === target.sub_question_id);
        return sub?.sub_question_point ?? null;
    }
    return question.question_point;
  };
  
  return (
    <Popover
      width={380}
      position="bottom"
      withArrow
      arrowSize={14}
      shadow="xs"
      offset={-2}
    >
      <Popover.Target>
        <Button
          leftSection={<IoIosSettings size={18} />}
          variant="transparent"
          color="#495057"
          p={0}
        >
          Rubric Settings
        </Button>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Alert
          icon={<IconInfoCircle size={20} />}
          title="Set rubric settings for this question."
          color="blue"
        />

        <Text size="sm" fw={500} pl={16} pr={16} pt={8} pb={8}>Select scoring method:</Text>

        <Radio.Group
          name="scoring-method"
          value={rubricData?.rubric_setting || 'Positive scoring'}
          onChange={(value) => {
            setRubricData({
              rubric_id: rubricData?.rubric_id ?? null,
              rubric_details: rubricData?.rubric_details ?? null,
              rubric_setting: value,
            });
          }}
          className="pl-4 pr-4 pb-2"
        >
          <Radio
            value="Negative scoring"
            label={
              getSelectedQuestionPoint() !== null
                ? `Negative scoring (${getSelectedQuestionPoint()?.toFixed(1)} pts)`
                : '0 pts'
            }
            classNames={{
              root: 'mb-2 ml-2 hover:text-blue-600 transition-colors',
            }}
          />
          <Radio
            value="Positive scoring"
            label="Positive scoring (points are added to 0)"
            classNames={{
              root: 'mb-2 ml-2 hover:text-blue-600 transition-colors',
            }}
          />
        </Radio.Group>
      </Popover.Dropdown>
    </Popover>
  );
}
