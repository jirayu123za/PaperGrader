"use client";
import React from "react";
import { ActionIcon, Center, RingProgress } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

export const RingProgressReady = () => {
  return (
    <RingProgress
      size={26}
      thickness={2}
      sections={[{ value: 100, color: "teal" }]}
      label={
        <Center>
          <ActionIcon color="teal" variant="light" radius="xl" size="xs">
            <IconCheck size={14} />
          </ActionIcon>
        </Center>
      }
    />
  );
};
