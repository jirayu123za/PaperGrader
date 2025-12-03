"use client";
import React from "react";
import { ActionIcon, Center, RingProgress, Tooltip } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

export const RingProgressExpired = () => {
  return (
    <Center>
      <Tooltip label="File has expired" withArrow transitionProps={{ duration: 200 }}>
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
      </Tooltip>
    </Center>
  );
};
