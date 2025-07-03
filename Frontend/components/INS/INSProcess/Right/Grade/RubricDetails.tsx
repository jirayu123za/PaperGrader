'use client';
import React from 'react';
import { Box, Text } from '@mantine/core';

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

  return (
    <Box pl="52px" mt={2}>
        {rubric.rubric_details.map((detail) => (
            <Box key={detail.rubric_details_id}>
                <Text size="sm" fw={400} c="#495057" lineClamp={1} mt={4}>
                    <Text span fw={600} c={detail.points >= 0 ? 'green' : 'red'}>
                        {detail.points >= 0 ? `+ ${detail.points}` : `– ${Math.abs(detail.points)}`} pts
                    </Text>{" "}
                        {detail.description}
                </Text>
            </Box>
        ))}
    </Box>
  );
};