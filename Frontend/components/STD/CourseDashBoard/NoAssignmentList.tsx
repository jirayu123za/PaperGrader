"use client";

import React from "react";
import { Text, Flex, Image } from "@mantine/core";

export const NoAssignmentList = () => {
  return (
    <Flex direction="column" align="center" justify="center" gap="xs" py="xl" w='100%' h="80vh">
      <Image
        src="/Image/table/add_notes.svg"
        alt="No submissions list"
        w="auto"
        h={200}
        fit="contain"
        fallbackSrc="https://placehold.co/200x200?text=Placeholder"
      />
      <Text size="lg" fw={500} mt="md">
        No assignments yet or all assignments have not been submitted
      </Text>
      <Text size="sm" c="dimmed">
        There are no assignments assigned to this course, or you have not submitted any assignments yet.
      </Text>
    </Flex>
  );
};
