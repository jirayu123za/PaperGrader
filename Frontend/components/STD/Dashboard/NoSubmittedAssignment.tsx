import React from 'react'
import { Flex, Image, Text } from '@mantine/core';

export const NoSubmittedAssignment = () => {
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
        alt="No submitted assignments"
        w="auto"
        h={200}
        fit="contain"
        fallbackSrc="https://placehold.co/200x200?text=Placeholder"
      />
      <Text size="lg" fw={500} mt="md">
        No submitted assignments
      </Text>
      <Text size="sm" c="dimmed">
        You have not submitted any assignments yet. Please submit your assignments to see them here.
      </Text>
    </Flex>
  );
}
