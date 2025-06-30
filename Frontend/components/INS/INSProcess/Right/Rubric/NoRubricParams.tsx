'use client'

import React from 'react'
import { Flex, Image, Button, Text } from '@mantine/core'
import { FaPlus } from 'react-icons/fa'
import { useCreateRubric } from '@/hooks/Rubric/useCreateRubric'
import { useParams } from 'next/navigation'

export const NoRubricParams = () => {
  const params = useParams();
  const assignment_id = params.assignment_id as string;
  const question_id = params.question_id as string;
  const sub_question_id = params.sub_question_id as string | undefined;
  const { mutate: createRubric, isPending } = useCreateRubric(assignment_id);

  const handleCreateRubric = () => {
    createRubric({ 
        assignment_id, 
        question_id: question_id,
        sub_question_id: sub_question_id,
        rubric: {
            rubric_setting: "Negative scoring",
            rubric_details: [{
                rubric_point: 0,
                rubric_description: "",
            }],
        },
    });
  };

  return (
    <Flex direction="column" align="center" justify="center" gap="xs" py="xl" w='100%'>
        <Image
            src="/Image/table/no_data.svg"
            alt="No rubrics found"
            w="auto"
            h={150}
            fit="contain"
            fallbackSrc="https://placehold.co/200x200?text=Placeholder"
        />
        <Text size="lg" fw={500} mt="md">
            No rubrics found
        </Text>
        <Text size="sm" c="dimmed">
            You haven’t created any rubrics yet.
        </Text>

        <Button
            leftSection={<FaPlus size={12} />}
            w={456}
            variant="outline"
            color="violet"
            className="mt-2"
            onClick={handleCreateRubric}
            loading={isPending}
        >
            Add rubric item
        </Button>
    </Flex>
  )
}
