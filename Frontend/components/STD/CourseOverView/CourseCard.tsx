"use client";

import React from "react";
import { useCourseStore } from "@/store/useCourseStore";
import { useRouter } from "next/navigation";
import { Card, Text, Tooltip } from "@mantine/core";

type Courses = {
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

interface CourseCardProps {
  course: Courses;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const router = useRouter();
  const { setSelectedCourseId } = useCourseStore();
  const selectCourse = (course_id: string) => {
    setSelectedCourseId(course_id);
    router.push(`/student/course/${course_id}/dashboard`);
  };

  return (
    <Card
      key={course.course_id}
      withBorder
      radius="md"
      shadow="sm"
      className="w-full h-[180px] flex flex-col cursor-pointer transition-transform duration-150 hover:scale-105"
      onClick={() => selectCourse(course.course_id)}
    >
      <Text size="sm" c="gray" className="mb-1">{course.course_code}</Text>
      <Text size="lg" fw={500} className="mb-1">{course.course_name}</Text>
      <div className="mt-auto flex flex-col gap-1">
        <Tooltip label={course.course_description} withArrow position="top">
          <Text size="sm" c="gray" lineClamp={2}>
            {course.course_description}
          </Text>
        </Tooltip>

        <Card.Section bg="#5C3C92">
          <Text ta="center" c="white" py="xs">
            {course.total_assignments
              ? `${course.total_assignments} assignments`
              : 'No assignments'}
          </Text>
        </Card.Section>
      </div>
    </Card>
    );
};
