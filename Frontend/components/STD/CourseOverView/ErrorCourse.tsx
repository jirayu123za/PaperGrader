import React from 'react'
import { Flex, Image, Text } from '@mantine/core'

export const ErrorCourse = () => {
  return (
    <Flex direction="column" align="center" justify="center" gap="xs" py="xl" w='100%' h="80vh">
        <Image
            src="/Image/table/server_error.svg"
            alt="Error loading courses"
            w="auto"
            h={200}
            fit="contain"
            fallbackSrc="https://placehold.co/200x200?text=Placeholder"
        />
        <Text size="lg" fw={500} mt="md">
            Error loading courses
        </Text>
        <Text size="sm" c="dimmed">
            There was an error while fetching the courses. Please try again later.
        </Text>
    </Flex>
  )
}
