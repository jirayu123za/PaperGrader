'use client'

import React from 'react'
import { Flex, Text, Image } from '@mantine/core'

export const NoSelectAssignment = () => {
    return (
        <Flex direction="column" align="center" justify="center" gap="xs" py="xl" w='100%' h="80vh">
            <Image
                src="/Image/statistic/statistic.svg"
                alt="No selected assignment"
                w="auto"
                h={200}
                fit="contain"
                fallbackSrc="https://placehold.co/200x200?text=Placeholder"
            />
            <Text size="lg" fw={500} mt="md">
                No assignment selected
            </Text>
            <Text size="sm" c="dimmed">
                Please select an assignment to view statistics.
            </Text>
        </Flex>
    )
}
