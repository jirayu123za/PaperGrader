"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { Flex, Title, Text, Tooltip, Divider } from '@mantine/core';
import { useFetchCourse } from '@/hooks/useFetchCourse';
import { useInsCourseStore } from '@/store/useCourseStore';

const HeaderCourse: React.FC = () => {
  const params = useParams();
  const course_id = params?.course_id as string;
  const { isLoading, error } = useFetchCourse(course_id);
  const { course } = useInsCourseStore();

  const fullName = course?.course_name ?? 'No Course Selected';
  const displayName = fullName.length > 30 ? `${fullName.slice(0, 30)}…` : fullName;
  const showTooltip = fullName.length > 30;

  return (
    <Flex direction="column" pl="24px" pr="24px" pt="16px" gap="2px">
      <Flex align="center" gap="6px">
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

        <Divider size="sm" orientation="vertical" />

        <Title order={2} fw={600}>
          {course  ? `(${course.semester}/${Number(course.academic_year) + 543})` : 'No Course Info'}
        </Title>
      </Flex>

      <Text size="sm" c="dimmed" className="mt-0">
        Course code: {course?.course_code ?? '-'}
      </Text>
    </Flex>
  );
};

export default HeaderCourse;