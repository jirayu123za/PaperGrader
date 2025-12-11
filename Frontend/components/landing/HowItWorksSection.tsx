// components/landing/HowItWorksSection.tsx
"use client";

import React from "react";
import { Box, Container, Title, Text, SimpleGrid, Card, Badge, Group } from "@mantine/core";

const steps = [
  {
    step: "01",
    title: "Upload & organize",
    description:
      "Upload scanned PDFs into MinIO and connect them to your course and assignments inside PaperGrader.",
  },
  {
    step: "02",
    title: "Define rubrics & match students",
    description:
      "Create rubric items, bounding boxes, and use OCR to match each submission with the correct student.",
  },
  {
    step: "03",
    title: "Grade & export",
    description:
      "Grade directly on screen using your rubric, then export scores to Excel or send results back to students.",
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <Box
      id="how-it-works"
      className="bg-gradient-to-b from-white via-[#F5F3FF] to-[#ECE9FF] py-16 sm:py-24 border-t border-[#E1E3FF]"
    >
      <Container fluid>
        <Box className="max-w-[110rem] mx-auto px-8">
          <Title order={2} className="text-3xl sm:text-4xl mb-4 text-slate-900">
            How it works
          </Title>
          <Text c="dimmed" size="sm" className="max-w-2xl mb-10">
            From paper to structured grades in three simple steps.
          </Text>

          <SimpleGrid
            cols={{ base: 1, md: 3 }}
            spacing={{ base: "lg", md: "xl" }}
          >
            {steps.map((item) => (
              <Card
                key={item.step}
                radius="lg"
                padding="lg"
                className="bg-white border border-[#E0E4FF] shadow-sm h-full"
              >
                <Group justify="space-between" mb="sm">
                  <Badge
                    radius="xl"
                    variant="light"
                    className="bg-[#E3E7FF] text-[#4C6EF5] border border-[#C4CBFF]"
                  >
                    Step {item.step}
                  </Badge>
                </Group>
                <Text fw={500} mb={4} className="text-slate-900">
                  {item.title}
                </Text>
                <Text size="sm" c="dimmed">
                  {item.description}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
};