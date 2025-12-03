"use client";

import { Progress } from "@mantine/core";
import React, { useEffect, useState } from "react";

type RingProgressProcessProps = {
  durationMs?: number;
};

export const RingProgressProcess: React.FC<RingProgressProcessProps> = ({durationMs = 60_000}) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const percent = Math.min((elapsed / durationMs) * 100, 100);
      setValue(percent);
      if (percent >= 100) {
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [durationMs]);

  return (
    <Progress
      value={value}
      radius="xl"
      size="lg"
      color="yellow"
      striped
      animated
    />
  );
};
