'use client';
import React from 'react';
import { Box, Flex, Group, Text } from '@mantine/core';
import { FaCheck } from 'react-icons/fa';

interface RubricDetailItem {
  rubric_detail_id: string;
  rubric_description: string;
  rubric_point: number;
  has_selected: boolean;
}

interface Rubrics {
  rubric_id: string;
  rubric_details: RubricDetailItem[];
  has_floor?: boolean;
  has_ceiling?: boolean;
  rubric_setting?: string;
}

interface Props {
  rubric?: Rubrics;
}

export const RubricDetails: React.FC<Props> = ({ rubric }) => {
  const noRubric = !rubric || !Array.isArray(rubric.rubric_details) || rubric.rubric_details.length === 0;
  const allUnselected = rubric?.rubric_details.every((d) => !d.has_selected);
  
  return (
    <Flex pl="52px" mt={2} direction="column" gap="xs">
      {noRubric ? (
        <Group align="center" gap="sm" wrap="nowrap" ml="sm">
          <Box w={12} />
          <Text size="sm" fw={400} c="red" fs="italic">
            This question has no rubric
          </Text>
        </Group>
      ) : (
        rubric?.rubric_details.map((detail) => {
          const pointColor = detail.rubric_point >= 0 ? 'green' : 'red';
          const pointText = detail.rubric_point >= 0 ? `+ ${detail.rubric_point}` : `– ${Math.abs(detail.rubric_point)}`;

          return allUnselected ? (
            <Group
              key={detail.rubric_detail_id}
              align="center"
              gap="sm"
              wrap="nowrap"
            >
              <Text size="sm" fw={600} c={pointColor}>
                {pointText} pts
              </Text>
              <Text size="sm" fw={400} c="#495057">
                {detail.rubric_description}
              </Text>
            </Group>
          ) : detail.has_selected ? (
            <Box
              key={detail.rubric_detail_id}
              p="sm"
              bd="1px solid #CED4DA"
              bg="white"
            >
              <Group align="center" gap="sm">
                <FaCheck size={10} color="#495057" />
                <Text size="sm" fw={600} c={pointColor}>
                  {pointText} pts
                </Text>
                <Text size="sm" fw={400} c="#495057">
                  {detail.rubric_description}
                </Text>
              </Group>
            </Box>
          ) : (
            <Group
              key={detail.rubric_detail_id}
              align="center"
              gap="sm"
              wrap="nowrap"
              ml="sm"
            >
              <Box w={12} />
              <Text size="sm" fw={600} c={pointColor}>
                {pointText} pts
              </Text>
              <Text size="sm" fw={400} c="#495057">
                {detail.rubric_description}
              </Text>
            </Group>
          );
        })
      )}
    </Flex>
  );
};