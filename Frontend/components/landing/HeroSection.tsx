// components/landing/HeroSection.tsx
"use client";

import React from "react";
import { Badge, Box, Button, Container, Group, Stack, Text, Title } from "@mantine/core";
import { IconGauge } from "@tabler/icons-react";

interface HeroSectionProps {
  onSecondaryCtaClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSecondaryCtaClick }) => {
  return (
    <Box
      id="top"
      className="bg-gradient-to-b from-[#F5F3FF] via-[#F7F8FF] to-[#FFFFFF] py-16 sm:py-24"
    >
      <Container fluid>
        <Box className="max-w-[110rem] mx-auto px-8">
          <Stack
            gap="md"
            align="center"
            className="text-center"
          >
            <Group gap="xs">
              <Badge
                variant="gradient"
                gradient={{ from: 'violet', to: 'grape', deg: 10 }}
                leftSection={<IconGauge size={16} color="#ffffff" />}
              >
                BUILT FOR PAPER-BASED EXAMS
              </Badge>
            </Group>

            {/* text main */}
            <Title
              order={1}
              fw={600}
              className="text-center drop-shadow-xl"
              style={{
                fontSize: "clamp(32px, 4vw, 56px)",
                lineHeight: 1.15,
              }}
            >
              <span
                className="
                  block
                  text-transparent bg-clip-text 
                  bg-gradient-to-r from-[#4C6EF5] via-[#6665AC] to-[#B197FC]
                  !drop-shadow-xl
                "
              >
                PaperGrader
              </span>

              <span className="block text-slate-900 mt-1">
                turns paper grading into a modern digital workflow.
              </span>
            </Title>

            <Text
              c="dimmed"
              fw={600}
              style={{
                fontSize: "clamp(14px, 1.1vw, 32px)",
                lineHeight: 1.5,
              }}
              className="max-w-3xl mx-auto text-center"
            >
              Upload scans, define rubrics, match students with OCR,
              {" "}
              <span className="block sm:inline">
                and export clear, beautiful grade reports — all in one place built for real classrooms.
              </span>
            </Text>

            <Group gap="md" mt="sm" justify="center" wrap="wrap">
              <Button
                size="md"
                radius="md"
                variant="filled"
                color="violet"
                className="shadow-md"
                onClick={onSecondaryCtaClick}
              >
                Get started
              </Button>
              <Button
                size="md"
                radius="md"
                variant="white"
                className="shadow-md"
                color="violet"
              >
                Demo
              </Button>
            </Group>

            <Group gap="xl" mt="sm" justify="center" wrap="wrap">
              <div>
                <Text fw={600} size="lg" className="text-slate-900">
                  2× faster
                </Text>
                <Text size="xs" c="dimmed">
                  grading vs manual workflow
                </Text>
              </div>
              <div>
                <Text fw={600} size="lg" className="text-slate-900">
                  OCR-ready
                </Text>
                <Text size="xs" c="dimmed">
                  name & ID detection built-in
                </Text>
              </div>
            </Group>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};