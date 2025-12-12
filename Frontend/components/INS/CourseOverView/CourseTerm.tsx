"use client";

import React from "react";
import { Box, Group, SimpleGrid, Text } from "@mantine/core";
import { CourseCard } from "@/components/INS/CourseOverView/CourseCard";
import { CreateCourse } from "@/components/INS/CourseOverView/CreateCourse";

type Course = {
  course_id: string;
  course_name: string;
  course_code: string;
  course_description: string;
  semester: number;
  academic_year: number;
  entry_code: boolean;
  total_assignments: number;
  term_key: number;
  term_label: string;
};

type CourseTermProps = {
  termKey: number;
  label: string;
  courses: Course[];
  showCreate?: boolean;
};

export function CourseTerm({ termKey, label, courses, showCreate }: CourseTermProps) {
  return (
    <Box key={termKey}>
      <Group justify="space-between" mb="sm">
        <Text fw={600} size="xl" c="dimmed">
          Semester{" "}
          <Text component="span" size="sm" fw={500} c="dimmed">
            ({label})
          </Text>
        </Text>
      </Group>

      <SimpleGrid spacing="lg" cols={{ base: 1, sm: 1, md: 2, lg: 4 }}>
        {courses.map((c) => (
          <CourseCard key={c.course_id} course={c} />
        ))}
        {showCreate ? <CreateCourse /> : null}
      </SimpleGrid>
    </Box>
  );
}