import React from 'react'
import { Flex, Image, Text } from '@mantine/core';

export const NoDueAssignment = () => {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="xs"
      py="xl"
      w="100%"
      h="80vh"
    >
      <Image
        src="/Image/list/check_list.svg"
        alt="No overdue assignments"
        w="auto"
        h={200}
        fit="contain"
        fallbackSrc="https://placehold.co/200x200?text=Placeholder"
      />
      <Text size="lg" fw={500} mt="md">
        No due assignments
      </Text>
      <Text size="sm" c="dimmed">
        You have no assignments due at the moment. Please check back later for upcoming assignments.
      </Text>
    </Flex>
  )
}
