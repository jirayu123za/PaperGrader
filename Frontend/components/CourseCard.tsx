"use client";

import React from 'react';
import CreateCourse from './Create/CreateCourse';
import { useRouter } from 'next/navigation';
import { useCourseStore } from '../store/useCourseStore';
import { Anchor, ScrollArea, Card, Text, Tooltip, useMantineTheme } from '@mantine/core';
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


  const grouped = courses.reduce((acc: Record<string, Course[]>, c) => {
    const key = `${c.academic_year}-${c.semester}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const allKeys = Object.keys(grouped).sort((a, b) => {
    const [yearA, semA] = a.split('-').map(Number);
    const [yearB, semB] = b.split('-').map(Number);
    if (yearA !== yearB) {
      return yearB - yearA;
    }
    return semB - semA;
  });
  const latestKeys = allKeys.slice(0, 2);
  const olderKeys = allKeys.slice(2);

  const selectCourse = (c: Course) => {
    setSelectedCourseId(c.course_id);
    const base = studentMode ? '/student/overview/' : '/instructor/course/';
    router.push(`${base}${c.course_id}/dashboard`);
  };

  const EmptyCard = (
    <Card
      withBorder
      radius="lg"
      shadow="xs"
      className="w-full h-[180px] flex items-center justify-center cursor-pointer border-2 border-dashed"
      style={{ borderColor: theme.colors.teal[6] }}
      onClick={() => form.setFieldValue('isModalOpen', true)}
    >
      <div className="text-center" style={{ color: theme.colors.teal[6] }}>
        <Text size="xl" fw={700} className="mb-1">+</Text>
        <Text size="md">Create a new course</Text>
      </div>
    </Card>
  );

  const renderOne = (course: Course) => (
    <Card
      key={course.course_id}
      withBorder
      radius="md"
      shadow="sm"
      className="w-full h-[180px] flex flex-col cursor-pointer transition-transform duration-150 hover:scale-105"
      onClick={() => selectCourse(course)}
    >
      <Text size="sm" color="gray" className="mb-1">{course.course_code}</Text>
      <Text size="lg" fw={500} className="mb-1">{course.course_name}</Text>
      <div className="mt-auto flex flex-col gap-1">
        <Tooltip label={course.course_description} withArrow position="top">
          <Text size="sm" color="gray" lineClamp={2}>
            {course.course_description}
          </Text>
        </Tooltip>

        <Card.Section style={{ backgroundColor: theme.colors.violet[9] }}>
          <Text ta="center" c="white" py="xs">
            {course.total_assignments
              ? `${course.total_assignments} assignments`
              : 'No assignments'}
          </Text>
        </Card.Section>
      </div>
    </Card>
  );

  const renderGroup = (key: string) => {
    const [year, semester] = key.split('-');
    const displayYear = (parseInt(year, 10) + 543).toString();
    return (
      <div key={key} className="mb-6 pl-3 ">
        <Text size="lg" fw={600} className="mb-2">
          {semester} / {displayYear}
        </Text>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {grouped[key].map(renderOne)}
          {latestKeys[0] === key && !studentMode && EmptyCard}
        </div>
      </div>
    );
  };

  return (
    <ScrollArea style={{ height: 'calc(100vh - 150px)' }} type="auto" >
      {courses.length === 0 && !studentMode ? (
        EmptyCard
      ) : (
        <>
          {latestKeys.map(renderGroup)}

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

          {form.values.showOlderCourses && olderKeys.map(renderGroup)}
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
