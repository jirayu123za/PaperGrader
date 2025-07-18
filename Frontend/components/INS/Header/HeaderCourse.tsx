"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { Flex, Title, Text, Tooltip } from '@mantine/core';
import { useFetchCourse } from '@/hooks/useFetchCourse';
import { useInsCourseStore } from '@/store/useCourseStore';

const HeaderCourse: React.FC = () => {
  const params = useParams();
  const course_id = params?.course_id as string;

  // Fetch ข้อมูลคอร์ส
  useFetchCourse(course_id);
  const { course } = useInsCourseStore();

  // เตรียมชื่อเต็มและชื่อที่จะแสดง (ไม่เกิน 30 ตัว)
  const fullName = course?.course_name ?? 'No Course Selected';
  const displayName =
    fullName.length > 30 ? `${fullName.slice(0, 30)}…` : fullName;
  const showTooltip = fullName.length > 30;

  return (
    <div className="bg-white px-6 pt-4 pb-2">
      <Flex align="center">
        <Tooltip
          label={fullName}
          disabled={!showTooltip}
          withArrow
          position="bottom"
        >
          <Title
            order={2}
            fw={600}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '360px',
              cursor: showTooltip ? 'help' : 'default',
            }}
          >
            {displayName}
          </Title>
        </Tooltip>

        <Text size="xl" color="gray" className="mx-2">
          |
        </Text>

        <Title order={2} fw={600}>
          {course ? `${course.semester}/${course.academic_year}` : 'No Course Info'}
        </Title>
      </Flex>

      <Text size="sm" color="dimmed" className="mt-0">
        Course code: {course?.course_code ?? '-'}
      </Text>
    </div>
  );
};

export default HeaderCourse;