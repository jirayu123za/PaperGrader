"use client";

import React, { useEffect } from 'react';
import { useFetchInsCourses } from '@/hooks/useFetchCourse';
import { useCourseStore } from '@/store/useCourseStore';
import { Card, Flex, Grid, Skeleton } from '@mantine/core';
import CourseCard from '@/components/CourseCard';

const INSCourseOverview = () => {
  const { data: courses, isLoading, error } = useFetchInsCourses();
  const { setCourses } = useCourseStore();

  useEffect(() => {
    if (courses) {
      setCourses(courses);
    }
  }, [courses, setCourses]);

  return (
    <div className="flex max-h-[calc(100vh-20px)] bg-gray-50 overflow-hidden">
      <div className="grow p-8">
        <h1 className="text-3xl font-bold mb-8">Courses Overview</h1>

        {isLoading ? (
          <Grid gutter="lg">
            {Array.from({ length: 4 }).map((_, index) => (
              <Grid.Col span={{ base: 12, sm: 6, lg: 4 }} key={index}>
                <Card shadow="sm" padding="md" radius="md" withBorder>
                  <Skeleton height={160} radius="md" />
                  <Skeleton height={20} mt="md" radius="md" width="70%" />
                  <Skeleton height={15} mt="sm" radius="md" width="90%" />
                  <Flex mt="lg" justify="space-between">
                    <Skeleton height={30} width="40%" radius="md" />
                    <Skeleton height={30} width="30%" radius="md" />
                  </Flex>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        ) : error ? (
          <div>Error loading courses: {error.message}</div>
        ) :  (
          <div className="grow p-6">
            <CourseCard courses={courses || []} studentMode={false} />
          </div>

        )}
      </div>
    </div>
  );
};

export default INSCourseOverview;
