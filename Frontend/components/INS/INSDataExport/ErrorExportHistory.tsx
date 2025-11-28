'use client'

import React from 'react'
import { Flex, Text, Image } from '@mantine/core'

export const ErrorExportHistory = () => {
    return (
        <Flex direction="column" align="center" justify="center" gap="xs" py="xl" w='100%'>
            <Image
                src="/Image/table/server_error.svg"
                alt="No review statistics available"
                w="auto"
                h={200}
                fit="contain"
                fallbackSrc="https://placehold.co/200x200?text=Placeholder"
            />
            <Text size="lg" fw={500} mt="md">
                Error loading export history
            </Text>
            <Text size="sm" c="dimmed">
                There was an error loading the export history for this assignment. Please try again later.
            </Text>
        </Flex>
    )
}
