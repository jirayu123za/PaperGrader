'use client';
import React from 'react';
import { Box, Flex, Text } from '@mantine/core';
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
  
  if (noRubric) {
    return (
      <Flex pl="52px" mt="xs">
        <Box
          px="sm"
          py={8}
          bg="#FFF5F5"
          style={{ borderRadius: 8, border: '1px dashed #FFA8A8' }}
        >
          <Text size="xs" fw={500} c="#E03131" fs="italic">
            This question has no rubric
          </Text>
        </Box>
      </Flex>
    );
  }

  return (
      <Flex direction="column" gap="xs" pt="xs" pb="xs">
        {rubric!.rubric_details.map((detail) => {
          const isSelected = detail.has_selected;
          const pointIsPositive = detail.rubric_point >= 0;
          const pointColor = pointIsPositive ? '#12B886' : '#FA5252';
          const pointText = pointIsPositive? `+ ${detail.rubric_point}`  : `– ${Math.abs(detail.rubric_point)}`;
          const variant: 'idle' | 'selected' | 'unselected' = allUnselected ? 'idle' : isSelected ? 'selected' : 'unselected';
          const colorStyle = variant === 'selected' ? '#F7F7FF' : 'white';
          const borderStyle = variant === 'selected' ? '2px solid #ADB5FF' : '2px solid #E0E4FF';
          const shadowStyle = variant === 'selected' ? '0 2px 6px rgba(15, 23, 42, 0.06)' : 'none';
          const descColor = variant === 'selected' ? '#212529' : variant === 'unselected' ? '#868E96' : '#495057';
          const pointWeight = variant === 'selected' ? 700 : 500;
          const descWeight = variant === 'selected' ? 500 : 400;
          const hasDescription = detail.rubric_description.trim() !== '';

          return (
            <Box
              key={detail.rubric_detail_id}
              px="xs"
              py="xs"
              bg={colorStyle}
              bd={borderStyle}
              bdrs="md"
              style={{ boxShadow: shadowStyle }}
            >
            <Flex justify="space-between" align="flex-start" gap="xs">
              <Box
                mt={2}
                style={{
                  flex: '0 0 10%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                }}
              >
                {variant === 'selected' && (
                  <Box
                    w={18}
                    h={18}
                    bdrs={999}
                    bg="#EDF2FF"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FaCheck size={10} color="#364FC7" />
                  </Box>
                )}
              </Box>

              <Box
                style={{
                  flex: '1 1 0',
                  minWidth: 0,
                }}
              >
                <Text
                  size="sm"
                  fw={descWeight}
                  c={hasDescription ? descColor : 'dimmed'}
                  fs={hasDescription ? undefined : 'italic'}
                  lh={1.4}
                  style={{ wordBreak: 'break-word' }}
                >
                  {hasDescription
                    ? detail.rubric_description
                    : 'No rubric description provided'}
                </Text>
              </Box>
              <Box
                mt={2}
                style={{
                  flex: '0 0 20%',
                  textAlign: 'right',
                }}
              >
                <Text size="sm" fw={pointWeight} c={pointColor}>
                  {pointText} pts
                </Text>
              </Box>
            </Flex>
            </Box>
          );
        })}
      </Flex>
  );
};