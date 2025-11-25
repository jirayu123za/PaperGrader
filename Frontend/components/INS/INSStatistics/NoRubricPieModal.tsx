'use client'

import React from 'react'
import { Flex, Text, Image } from '@mantine/core'

export const NoRubricPieModal = () => {
    return (
        <Flex direction="column" align="center" justify="center" gap="xs" py="xl" w='100%'>
            <Image
                src="/Image/statistic/rubric.svg"
                alt="Error loading statistics"
                w="auto"
                h={200}
                fit="contain"
                fallbackSrc="https://placehold.co/200x200?text=Placeholder"
            />
            <Text size="lg" fw={500} mt="md">
                No rubric data available
            </Text>
            <Text size="sm" c="dimmed">
                There are no rubric data available for this assignment. Please check back later.
            </Text>
        </Flex>
    )
}
