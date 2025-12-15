"use client";

import React from 'react';
import { ActiveAssignments } from '@/components/INS/INSDashBoard/ActiveAssignment';
import { useInsCourseStore } from '@/store/useCourseStore';
import { Divider, Highlight, List, Stack, SimpleGrid, ThemeIcon, Card, Group, Badge, Text, Alert, Skeleton } from '@mantine/core';
import { BsInfoSquareFill } from "react-icons/bs";
import { useParams } from 'next/navigation';
import { useFetchCourse } from '@/hooks/useFetchCourse';

export const INSDashBoard = () => {
  const params = useParams();
  const course_id = params?.course_id as string;
  const { isLoading: isLoadingCourse, isError: isErrorCourse } = useFetchCourse(course_id as string);
  const { course } = useInsCourseStore();

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: "md", md: "xl" }}>
        <Card
          p="xl"
          style={{
            background: "light-dark(rgba(255,255,255,0.75), rgba(20,20,20,0.55))",
            border: "1px solid light-dark(rgba(0,0,0,0.06), rgba(255,255,255,0.08))",
            backdropFilter: "blur(10px)",
            overflow: "hidden",
          }}
        >
          <Card.Section
            h={5}
            style={{
              background:"linear-gradient(90deg, var(--mantine-color-cyan-5), var(--mantine-color-indigo-5))",
            }}
          />
          <Group justify="space-between" mt="md" mb="xs">
            <Group gap="xs">
              <ThemeIcon variant="white" c="blue">
                <BsInfoSquareFill size={18} />
              </ThemeIcon>
              <Text fw={700}>Description</Text>
            </Group>
            <Badge variant="light" radius="sm">
              Course
            </Badge>
          </Group>

          <Divider opacity={0.6} my="sm" />

          <Text c="dimmed" size="sm" mb={6}>
            Quick summary for this course
          </Text>

        {isErrorCourse ? (
          <Alert
            color="red"
            variant="light"
            radius="md"
            title="Load course failed"
            icon={<BsInfoSquareFill />}
          >
            <Text size="sm" c="dimmed">
              Something went wrong while loading the course data. Please try again.
            </Text>
          </Alert>
        ) : isLoadingCourse ? (
          <Stack gap="xs">
            <Skeleton height={10} width="55%" />
            <Skeleton height={10} />
            <Skeleton height={10} />
          </Stack>
        ) : (
          <Highlight
            highlight={["Course Settings.", "default"]}
            highlightStyles={{
              backgroundImage:
                "linear-gradient(45deg, var(--mantine-color-cyan-5), var(--mantine-color-indigo-5))",
              fontWeight: 700,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {course?.course_description
              ? course.course_description
              : "You can edit your course description on the Course Settings."}
          </Highlight>
        )}
        </Card>

        <Alert
          variant="light"
          color="orange"
          icon={<BsInfoSquareFill />}
          title={<Text fw={700} fz="md">Things to do</Text>}
        >
          <Stack gap={6}>
            <List
              size="sm"
              spacing="xs"
              c="dimmed"
              fw="400"
            >
              <List.Item>
                1. Add students or staff to your course from the Roster page.
              </List.Item>
              <List.Item>
                2. Create your first assignment from the Assignments page.
              </List.Item>
            </List>
          </Stack>
        </Alert>
      </SimpleGrid>

      <ActiveAssignments />
    </Stack>
  );
};