"use client";

import React from 'react';
import CreateCourse from './Create/CreateCourse';
import { useRouter } from 'next/navigation';
import { useCourseStore } from '../store/useCourseStore';
import { Anchor, ScrollArea, Card, Text, useMantineTheme } from '@mantine/core';
import { useForm } from '@mantine/form';

interface Course {
  course_id: string;
  course_name: string;
  course_code: string;
  course_description: string;
  total_assignments: string;
  academic_year: string;
  semester: string;
}

interface CourseCardProps {
  courses?: Course[];
  studentMode?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ courses = [], studentMode = false }) => {
  const router = useRouter();
  const { setSelectedCourseId } = useCourseStore();
  const theme = useMantineTheme();

  const form = useForm({
    initialValues: {
      isModalOpen: false,
      showOlderCourses: false,
    },
  });

  const groupedCourses = courses.reduce((acc: Record<string, Course[]>, course) => {
    const key = `${course.academic_year} / ${course.semester}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  const sortedKeys = Object.keys(groupedCourses).sort().reverse();
  const latestKeys = sortedKeys.slice(0, 2);
  const olderKeys = sortedKeys.slice(2);

  const handleSelectCourse = (course: Course) => {
    setSelectedCourseId(course.course_id);
    const base = studentMode ? '/student/overview/' : '/instructor/course/';
    router.push(`${base}${course.course_id}/dashboard`);
  };

  const handleCreateCourseClick = () => {
    form.setFieldValue('isModalOpen', true);
  };

  const EmptyCourseCard = (
    <Card
      withBorder
      radius="lg"
      shadow="xs"
      onClick={handleCreateCourseClick}
      className="w-[380px] h-[180px] flex items-center justify-center cursor-pointer border-2 border-dashed"
      style={{ borderColor: theme.colors.teal[6] }}
    >
      <div className="text-center" style={{ color: theme.colors.teal[6] }}>
        <Text size="xl" fw={700} style={{ marginBottom: theme.spacing.xs }}>
          +
        </Text>
        <Text size="md">Create a new course</Text>
      </div>
    </Card>
  );

  return (
    <ScrollArea style={{ height: 600 }} type="auto">
      {courses.length === 0 && !studentMode ? (
        EmptyCourseCard
      ) : (
        <>
          {latestKeys.map((key) => (
            <div key={key} className="mb-6">
              <Text size="lg" fw={600} style={{ marginBottom: theme.spacing.sm }}>
                {key}
              </Text>
              <div className="flex gap-4 items-stretch">
                {groupedCourses[key].map((course) => (
                  <Card
                    key={course.course_id}
                    withBorder
                    radius="md"
                    shadow="sm"
                    onClick={() => handleSelectCourse(course)}
                    className="w-[380px] h-[180px] flex flex-col cursor-pointer transition-transform duration-150 hover:scale-105"
                  >
                    <Text size="sm" color="gray" className="mb-2">
                      {course.course_code}
                    </Text>
                    <Text size="lg" fw={500} className="mb-2">
                      {course.course_name}
                    </Text>
                    <Text size="sm" color="gray" className="flex-grow mb-2">
                      {course.course_description}
                    </Text>
                    <div
                      className="text-white text-center"
                      style={{ backgroundColor: theme.colors.violet[9], padding: theme.spacing.xs }}
                    >
                      {course.total_assignments
                        ? `${course.total_assignments} assignments`
                        : 'No assignments'}
                    </div>
                  </Card>
                ))}
                {key === latestKeys[0] && !studentMode && EmptyCourseCard}
              </div>
            </div>
          ))}

          {olderKeys.length > 0 && (
            <div className="mt-4 mb-4">
              <Anchor
                component="button"
                onClick={() => form.setFieldValue('showOlderCourses', !form.values.showOlderCourses)}
                underline="hover"
              >
                {form.values.showOlderCourses ? 'Hide older courses' : 'See older courses'}
              </Anchor>
            </div>
          )}

          {form.values.showOlderCourses &&
            olderKeys.map((key) => (
              <div key={key} className="mb-6">
                <Text size="lg" fw={600} style={{ marginBottom: theme.spacing.sm }}>
                  {key}
                </Text>
                <div className="flex gap-4 items-stretch">
                  {groupedCourses[key].map((course) => (
                    <Card
                      key={course.course_id}
                      withBorder
                      radius="md"
                      shadow="sm"
                      onClick={() => handleSelectCourse(course)}
                      className="w-[380px] h-[180px] flex flex-col cursor-pointer transition-transform duration-150 hover:scale-105"
                    >
                      <Text size="sm" color="gray" className="mb-2">
                        {course.course_code}
                      </Text>
                      <Text size="lg" fw={500} className="mb-2">
                        {course.course_name}
                      </Text>
                      <Text size="sm" color="gray" className="flex-grow mb-2">
                        {course.course_description}
                      </Text>
                      <div
                        className="text-white text-center"
                        style={{ backgroundColor: theme.colors.purple[9], padding: theme.spacing.xs }}
                      >
                        {course.total_assignments
                          ? `${course.total_assignments} assignments`
                          : 'No assignments'}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </>
      )}

      {!studentMode && (
        <CreateCourse
          isOpen={form.values.isModalOpen}
          onClose={() => form.setFieldValue('isModalOpen', false)}
        />
      )}
    </ScrollArea>
  );
};

export default CourseCard;
