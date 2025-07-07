'use client';
import React from 'react';
import { Box, Flex, Group, Text } from '@mantine/core';
import { FaCheck } from 'react-icons/fa';

interface RubricDetail {
  rubric_details_id: string;
  description: string;
  points: number;
  has_selected: boolean;
}

interface Rubric {
  rubric_id: string;
  rubric_details: RubricDetail[];
}

interface Props {
  rubric: Rubric | undefined;
}

export const RubricDetails: React.FC<Props> = ({ rubric }) => {
  if (!rubric || !rubric.rubric_details?.length) return null;

  const allUnselected = rubric.rubric_details.every((d) => !d.has_selected);

  return (
    <Flex pl="52px" mt={2} direction="column" gap="xs">
      {rubric.rubric_details.map((detail) => {
        const pointColor = detail.points >= 0 ? 'green' : 'red';
        const pointText = detail.points >= 0 ? `+ ${detail.points}` : `– ${Math.abs(detail.points)}`;

        return allUnselected ? (
          <Group
            key={detail.rubric_details_id}
            align="center"
            gap="sm"
            wrap="nowrap"
          >
            <Text size="sm" fw={600} c={pointColor}>
              {pointText} pts
            </Text>
            <Text size="sm" fw={400} c="#495057">
              {detail.description}
            </Text>
          </Group>
        ) : detail.has_selected ? (
          <Box
            key={detail.rubric_details_id}
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
                {detail.description}
              </Text>
            </Group>
          </Box>
        ) : (
          <Group
            key={detail.rubric_details_id}
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
              {detail.description}
            </Text>
          </Group>
        );
      })}
    </Flex>
  );
};