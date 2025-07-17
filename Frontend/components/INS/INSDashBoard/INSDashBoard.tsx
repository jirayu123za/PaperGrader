"use client";

import React, { useState } from 'react';
import CreateAssignmentModal from '../../Create/CreateAssignment';
import ActiveAssignments from './ActiveAssignment';
import { useInsCourseStore } from '../../../store/useCourseStore';
import { useFetchActiveAssignments } from '../../../hooks/useFetchActiveAssignment';
import { Divider, Flex, Title, Highlight, List } from '@mantine/core';
import { BsFillInfoCircleFill } from "react-icons/bs";
import { useParams } from 'next/navigation';
import { useFetchCourse } from '../../../hooks/useFetchCourse';

const INSDashBoard = () => {
  const params = useParams();
  const course_id = params?.course_id as string;
  const { isLoading, error } = useFetchCourse(course_id as string);
  const { course } = useInsCourseStore();
  const { refetch } = useFetchActiveAssignments(course_id as string);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    refetch();
  };

  const iconInfoCircler = <BsFillInfoCircleFill size={15} color='teal' />;

  return (
    <div >
      <Flex gap="xl" pb="lg">
        <div className="w-1/2">
          <Title order={5} fw={600} pb={4}>DESCRIPTION</Title>
          <Divider size="sm" pb={4} />
          <Highlight
            highlight={['Course Settings.', 'default']}
            highlightStyles={{
              backgroundImage:
                'linear-gradient(45deg, var(--mantine-color-cyan-5), var(--mantine-color-indigo-5))',
              fontWeight: 700,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
            {course ? (course.course_description ? course.course_description : 'You can edit your course description on the Course Settings.') : 'You can edit your course description on the Course Settings.'}
          </Highlight>
        </div>
        <div className="w-1/2">
          <Title order={5} fw={600} pb={4}>THINGS TO DO</Title>
          <Divider size="sm" pb={4} />
          <List icon={iconInfoCircler}>
            <List.Item className='text-gray-600'>
              Add students or staff to your course from the Roster page.
            </List.Item>
            <List.Item className='text-gray-600'>
              Create your first assignment from the Assignments page.
            </List.Item>
          </List>
        </div>
      </Flex>

      <ActiveAssignments openModal={openModal}/>
      <CreateAssignmentModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default INSDashBoard;
