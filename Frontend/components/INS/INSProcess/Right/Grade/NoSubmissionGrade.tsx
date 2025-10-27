'use client'
import React from 'react'
import { Flex, Text, Image } from '@mantine/core'

export const NoSubmissionGrade = () => {
    return (
        <Flex direction="column" align="center" justify="center" gap="xs" py="xl" w='100%' h="80vh">
            <Image
                src="/Image/table/not_found.svg"
                alt="No submission"
                w="auto"
                h={200}
                fit="contain"
                fallbackSrc="https://placehold.co/200x200?text=Placeholder"
            />
            <Text size="lg" fw={500} mt="md">
                No submissions found
            </Text>
            <Text size="sm" c="dimmed">
                There are no submissions available to grade at the moment.
            </Text>
        </Flex>
    )
}
