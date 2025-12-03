"use client";
import React from "react";
import { ActionIcon, Center, RingProgress, Tooltip } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

export const RingProgressReady = () => {
  return (
    <Center>
      <Tooltip label="Ready for Download" withArrow transitionProps={{ duration: 200 }}>
        <RingProgress
          size={26}
          thickness={2}
          sections={[{ value: 100, color: "teal"}]}
          label={
            <Center>
              <ActionIcon color="teal" variant="light" radius="xl" size="xs">
                <IconCheck size={14} />
              </ActionIcon>
            </Center>
          }
        />
      </Tooltip>
    </Center>
  );
};
