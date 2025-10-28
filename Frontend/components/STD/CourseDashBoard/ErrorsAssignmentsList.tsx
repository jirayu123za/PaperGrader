"use client";

import React from "react";
import { Text, Flex, Image } from "@mantine/core";

export const ErrorsAssignmentsList = () => {
    return (
        <Flex direction="column" align="center" justify="center" gap="xs" py="xl" w='100%' h="80vh">
            <Image
                src="/Image/table/server_error.svg"
                alt="No submissions list"
                w="auto"
                h={200}
                fit="contain"
                fallbackSrc="https://placehold.co/200x200?text=Placeholder"
            />
            <Text size="lg" fw={500} mt="md">
                Errors loading assignments
            </Text>
            <Text size="sm" c="dimmed">
                There was an error loading the assignments for this course. Please try again later.
            </Text>
        </Flex>
    );
}