'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Popover, Button, Radio, Text, Alert, Loader, Flex, Checkbox, Group } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { IoIosSettings } from "react-icons/io";
import { useRubricStore } from '@/store/rubric/useRubricStore';
import { useQuestionStore } from '@/store/question/useQuestionStore';
import { useUpdateRubricScoringMethod } from '@/hooks/Rubric/useUpdateRubricSetting';

export const RubricSettingsParams = () => {
  const params = useParams();
  const question_id = params.question_id as string;
  const sub_question_id = params.sub_question_id as string | undefined;
  const assignment_id = params.assignment_id as string;
  const { rubricData, setRubricData } = useRubricStore();
  const { questions } = useQuestionStore();
  const { mutate: updateRubricScoringMethod, isPending } = useUpdateRubricScoringMethod(assignment_id);

  const getSelectedQuestionPoint = (): number | null => {
    if (!question_id) return null;

    const question = questions.find(q => q.question_id === question_id);
    if (!question) return null;

    if (sub_question_id) {
        const sub = question.sub_questions?.find(sq => sq.sub_question_id === sub_question_id);
        return sub?.sub_question_point ?? null;
    }
    return question.question_point;
  };

  const handleUpdateRubricSetting = (rubric_id: string, rubric_setting: "Positive scoring" | "Negative scoring") => {
    updateRubricScoringMethod({
        assignment_id,
        question_id: question_id,
        sub_question_id: sub_question_id,
        rubric: {
          rubric_id: rubric_id,
          rubric_setting: rubric_setting,
        },
    });
  }
  
  return (
    <Popover
      width={400}
      position="bottom-end"
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
        {!rubricData || !rubricData.rubric_setting ? (
          <Text size="sm" c="gray" px="46" py="sm" fs="italic">
            No rubric data found for this question. Please create rubric first.
          </Text>
        ) : isPending ? (
          <Flex justify="center" align="center">
            <Loader size="sm" variant="bars" mx="auto" my="md" type="bars"/>
          </Flex>
        ) : (
          <>
            <Text size="sm" fw={500} pl={16} pr={16} pt={8} pb={8}>Select scoring method:</Text>
            <Radio.Group
              name="scoring-method"
              value={(rubricData?.rubric_setting || 'Positive scoring') as "Positive scoring" | "Negative scoring"}
              onChange={(value) => {
                setRubricData({
                  rubric_id: rubricData?.rubric_id ?? null,
                  rubric_details: rubricData?.rubric_details ?? null,
                  rubric_setting: value,
                });
                handleUpdateRubricSetting(rubricData?.rubric_id ?? '', value as "Positive scoring" | "Negative scoring");
              }}
              className="pl-4 pr-4 pb-2"
            >
              <Radio
                value="Negative scoring"
                label={
                  `Negative scoring (points are subtracted from ${getSelectedQuestionPoint()?.toFixed(1) ?? '0.0'})`
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

            <Text size="sm" fw={500} pl={16} pr={16} pb={8}>Score bounds:</Text>
            <Group className="pl-4 pr-4 pb-4" gap="4px" align="center">
              <Checkbox
                w="100%"
                size='sm' 
                value="Ceiling"
                label="Ceiling (maximum score is 5.0)"
                classNames={{
                  root: 'ml-2 hover:text-blue-600 transition-colors',
                }}
              />
              <Checkbox
                w="100%"
                size='sm'
                value="Floor"
                label="Floor (minimum score is 0)"
                classNames={{
                  root: 'ml-2 hover:text-blue-600 transition-colors',
                }}
              />
            </Group>          
          </>
        )}
      </Popover.Dropdown>
    </Popover>
  )
}
