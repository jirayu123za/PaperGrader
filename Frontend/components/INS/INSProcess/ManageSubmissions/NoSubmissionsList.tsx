'use client'

import React from 'react'
import { Flex, Text, Image } from '@mantine/core'

export const NoSubmissionsList = () => {
    return (
        <Flex direction="column" align="center" justify="center" gap="xs" py="xl" w='100%' h="80vh">
            <Image
                src="/Image/table/no_data.svg"
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
        </Flex>
    )
}
