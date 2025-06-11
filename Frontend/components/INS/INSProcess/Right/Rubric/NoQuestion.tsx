'use client'
import { Flex, Text, Image } from '@mantine/core'
import React from 'react'

export const NoQuestion = () => {
    return (
        <Flex direction="column" align="center" justify="center" gap="xs" py="xl" w='100%'>
            <Image
                src="/Image/template/blank_canvas.svg"
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
                Please create bounding box for question to view or edit rubrics.
            </Text>
        </Flex>
    )
}
