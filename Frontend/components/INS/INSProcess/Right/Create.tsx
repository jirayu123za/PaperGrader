"use client";

import React from 'react';
import Question from './Question'
import { useParams } from 'next/navigation';
import { Container, Title, Flex, Tabs, Burger } from '@mantine/core';
import { Rubric } from './Rubric/Rubric';
import { useCreateSidebarStore } from '@/store/process-outline/createSidebarStore';

const Create: React.FC = () => {
  const params = useParams();
  const course_id = params.course_id as string;
  const assignment_id = params.assignment_id as string;
  const isCollapsed: boolean = useCreateSidebarStore((state: { isCollapsed: boolean }) => state.isCollapsed);
  const toggle: () => void = useCreateSidebarStore((state: { toggle: () => void }) => state.toggle);

  return (
    <Container className={`transition-all duration-300 ease-in-out bg-white border-1 ${isCollapsed ? 'w-[70px] min-w-[65px]' : 'w-[500px] min-w-[500px]'} flex-shrink-0 h-screen flex flex-col`}>
      <Flex justify="space-between" align="center" p="md" className='bg-[#6665AC]'>
        <Burger lineSize={4} size="md" opened={!isCollapsed} onClick={toggle} color="white" aria-label="Toggle navigation" />
        <Title c="white" order={4} className={`${isCollapsed ? 'hidden' : 'block'}`}>Create bounding box & Rubric</Title>
      </Flex>

      {!isCollapsed && (
        <Tabs defaultValue="outline" mb="lg">
          <Tabs.List grow>
            <Tabs.Tab value="outline">Create Outline</Tabs.Tab>
            <Tabs.Tab value="grading">Create Rubrics</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="outline" className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <Question />
          </Tabs.Panel>
          <Tabs.Panel value="grading" className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <Rubric />
          </Tabs.Panel>
        </Tabs>
      )}
    </Container>
  );
};

export default Create;
