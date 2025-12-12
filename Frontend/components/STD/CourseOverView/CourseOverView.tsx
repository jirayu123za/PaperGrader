import React, { useMemo } from 'react'
import { useFetchInsCourses } from '@/hooks/useFetchCourse';
import { useCourseStore } from '@/store/useCourseStore';
import { Anchor, Box, Collapse, Divider, Stack } from '@mantine/core';
import { ErrorCourse } from "@/components/STD/CourseOverView/ErrorCourse";
import { CourseTerm } from '@/components/STD/CourseOverView/CourseTerm';
import { LoadingCourse } from '@/components/STD/CourseOverView/LoadingCourse';
import { useDisclosure } from '@mantine/hooks';

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

export const CourseOverView = () => {
  const { isLoading, error } = useFetchInsCourses();
  const { courses } = useCourseStore();
  const [ showOlder, { toggle: toggleShowOlder }] = useDisclosure(false);

  const { grouped, latestKeys, olderKeys, labelByKey } = useMemo(() => {
    const grouped: Record<number, Course[]> = {};
    const labelByKey: Record<number, string> = {};

    for (const c of courses ?? []) {
      const key = Number(c.term_key);
      (grouped[key] ??= []).push(c);
      if (!labelByKey[key]) labelByKey[key] = c.term_label;
    }

    const keys = Object.keys(grouped).map(Number).sort((a, b) => b - a);
    const latestKeys = keys.slice(0, 2);
    const olderKeys = keys.slice(2);

    return { grouped, latestKeys, olderKeys, labelByKey };
  }, [courses]);

  if (isLoading) return <LoadingCourse />;
  if (error) return <ErrorCourse />;

  return (
    <Stack gap="xl">
      {latestKeys.map((key) => (
        <CourseTerm
          key={key}
          termKey={key}
          label={labelByKey[key] ?? `Term ${key}`}
          courses={grouped[key] ?? []}
        />
      ))}

      {olderKeys.length > 0 && (
        <Box>
          <Divider my="md" />
          <Anchor component="button" underline="hover" onClick={toggleShowOlder}>
            {showOlder ? "Hide older courses" : "See older courses"}
          </Anchor>

          <Collapse in={showOlder}>
            <Stack gap="xl" mt="xl">
              {olderKeys.map((key) => (
                <CourseTerm
                  key={key}
                  termKey={key}
                  label={labelByKey[key] ?? `Term ${key}`}
                  courses={grouped[key] ?? []}
                />
              ))}
            </Stack>
          </Collapse>
        </Box>
      )}
    </Stack>
  );
}