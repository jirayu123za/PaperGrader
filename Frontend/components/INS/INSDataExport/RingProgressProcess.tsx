"use client";
import React from "react";
import { ActionIcon, Center, RingProgress } from "@mantine/core";
import { TbAlertSmall } from "react-icons/tb";

export const RingProgressProcess = () => {
  return (
    <RingProgress
      size={26}
      thickness={2}
      sections={[{ value: 100, color: "yellow" }]}
      label={
        <Center>
          <ActionIcon color="yellow" variant="light" radius="xl" size="xs">
            <TbAlertSmall size={24} />
          </ActionIcon>
        </Center>
      }
    />
  );
};
