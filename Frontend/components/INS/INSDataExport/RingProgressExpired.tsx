"use client";
import React from "react";
import { ActionIcon, Center, RingProgress } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

export const RingProgressExpired = () => {
  return (
    <RingProgress
      size={26}
      thickness={2}
      sections={[{ value: 100, color: "red" }]}
      label={
        <Center>
          <ActionIcon color="red" variant="light" radius="xl" size="xs">
            <IconX size={14} />
          </ActionIcon>
        </Center>
      }
    />
  );
};
