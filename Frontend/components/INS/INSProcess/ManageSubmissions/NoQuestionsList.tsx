'use client'

import React from 'react'
import { Flex, Text, Image, Button } from '@mantine/core'
import { useParams, useRouter } from 'next/navigation'
import { IoChevronBackOutline } from "react-icons/io5";

export const NoQuestionsList = () => {
    const router = useRouter();
    const { course_id, assignment_id } = useParams() as { course_id: string; assignment_id: string };
    const handleBack = () => {
        router.push(`/instructor/course/${course_id}/process/${assignment_id}/create-outline`)
    }

    return (
        <Flex direction="column" align="center" justify="center" gap="xs" py="xl" w='100%' h="80vh">
            <Image
                src="/Image/table/add_notes.svg"
                alt="No question"
                w="auto"
                h={200}
                fit="contain"
                fallbackSrc="https://placehold.co/200x200?text=Placeholder"
            />
            <Text size="lg" fw={500} mt="md">
                No question found
            </Text>
            <Text size="sm" c="dimmed">
                Please define bounding boxes to display the list of questions.
            </Text>
            <Button mt="lg" onClick={handleBack} leftSection={<IoChevronBackOutline />} variant="light" color="blue">
                Back to create
            </Button>
        </Flex>
    )
}
