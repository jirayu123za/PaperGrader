'use client'

import React from 'react'
import { Flex, Text, Image } from '@mantine/core'

export const NoExportHistory = () => {
    return (
        <Flex direction="column" align="center" justify="center" gap="xs" py="xl" w='100%'>
            <Image
                src="/Image/table/export_files.svg"
                alt="No review statistics available"
                w="auto"
                h={200}
                fit="contain"
                fallbackSrc="https://placehold.co/200x200?text=Placeholder"
            />
            <Text size="lg" fw={500} mt="md">
                No export history available
            </Text>
            <Text size="sm" c="dimmed">
                There is no export history available for this assignment. Please check back later.
            </Text>
        </Flex>
    )
}
