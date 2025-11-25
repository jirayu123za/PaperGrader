'use client'

import React from 'react'
import { Flex, Text, Image } from '@mantine/core'

export const NoRubricTable = () => {
    return (
        <Flex direction="column" align="center" justify="center" gap="xs" py="xl" w='100%'>
            <Image
                src="/Image/table/no_data.svg"
                alt="Error loading statistics"
                w="auto"
                h={200}
                fit="contain"
                fallbackSrc="https://placehold.co/200x200?text=Placeholder"
            />
            <Text size="lg" fw={500} mt="md">
                No rubric available
            </Text>
            <Text size="sm" c="dimmed">
                There is no rubric defined for this assignment. Please add a rubric to view statistics.
            </Text>
        </Flex>
    )
}
