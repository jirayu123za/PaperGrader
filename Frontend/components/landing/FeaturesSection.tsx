// components/landing/FeaturesSection.tsx
"use client";

import React from "react";
import { Box, Container, SimpleGrid, Title, Text, Card, Group, Image } from "@mantine/core";
import { IconGauge, IconUser, IconCookie } from "@tabler/icons-react";

const instructorFeatures = [
  {
    icon: IconGauge,
    title: "Rubric-based grading",
    description:
      "Create detailed rubrics with sections and sub-questions. Apply them consistently across all submissions.",
  },
  {
    icon: IconCookie,
    title: "OCR matching",
    description:
      "Let PaperGrader help match student name & ID from scanned papers with your enrollment list.",
  },
  {
    icon: IconUser,
    title: "Export & analytics",
    description:
      "Export grades to Excel and use statistics to understand class performance quickly.",
  },
];

const studentFeatures = [
  {
    icon: IconUser,
    title: "Clear assignment status",
    description:
      "See upcoming, open, and closed assignments with due dates in one dashboard.",
  },
  {
    icon: IconGauge,
    title: "Template downloads",
    description:
      "Download assignment templates directly, so your answers match exactly with the rubric.",
  },
  {
    icon: IconCookie,
    title: "Transparent grading",
    description:
      "Understand how each question is scored based on the rubric your instructor defined.",
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <Box
      id="features"
      className="bg-white py-16 sm:py-24 border-t border-[#E1E3FF]"
    >
      <Container fluid>
        <Box className="max-w-[110rem] mx-auto px-8">
          <Title order={2} className="text-3xl sm:text-4xl mb-4 text-slate-900">
            Built for real classrooms.
          </Title>
          <Text c="dimmed" size="sm" className="max-w-2xl mb-10">
            PaperGrader connects instructors and students in a single grading
            workflow — from creating assignments to returning scores.
          </Text>

          <SimpleGrid
            cols={{ base: 1, md: 2 }}
            spacing={{ base: "xl", md: "xl" }}
          >
            {/* Instructor column */}
            <Box id="instructors">
              <Text
                size="lg"
                fw={600}
                className="text-[#4C6EF5] mb-3 tracking-wide"
              >
                For instructors
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {instructorFeatures.map((feature) => (
                  <Card
                    key={feature.title}
                    radius="lg"
                    padding="lg"
                    className="bg-white border border-[#E0E4FF] shadow-sm h-full"
                  >
                    <Group gap="xs" mb="sm">
                      <feature.icon size={22} color="#6665AC" />
                      <Text fw={500} className="text-slate-900">
                        {feature.title}
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {feature.description}
                    </Text>
                  </Card>
                ))}
              </SimpleGrid>
            </Box>

            {/* Student column */}
            <Box id="students">
              <Text
                size="lg"
                fw={600}
                className="text-[#6665AC] mb-3 tracking-wide"
              >
                For students
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {studentFeatures.map((feature) => (
                  <Card
                    key={feature.title}
                    radius="lg"
                    padding="lg"
                    className="bg-white border border-[#E0E4FF] shadow-sm h-full"
                  >
                    <Group gap="xs" mb="sm">
                      <feature.icon size={22} color="#4C6EF5" />
                      <Text fw={500} className="text-slate-900">
                        {feature.title}
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {feature.description}
                    </Text>
                  </Card>
                ))}
              </SimpleGrid>
            </Box>
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
};