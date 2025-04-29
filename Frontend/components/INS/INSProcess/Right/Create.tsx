"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { Container, Title, Button, Flex, Tabs } from '@mantine/core';
import { FaRegArrowAltCircleLeft } from "react-icons/fa";
import { useDisclosure } from '@mantine/hooks';
import { Rubric } from './Rubric';
import Question from './Question'
import { useCreateSidebarStore } from '@/store/process-outline/createSidebarStore';

const Create: React.FC = () => {
  const params = useParams();
  const course_id = params.course_id as string;
  const assignment_id = params.assignment_id as string;
  // const [ isCollapsed, { toggle }] = useDisclosure(false);
  const isCollapsed: boolean = useCreateSidebarStore((state: { isCollapsed: boolean }) => state.isCollapsed);
  const toggle: () => void = useCreateSidebarStore((state: { toggle: () => void }) => state.toggle);

  return (
    <Container className={`transition-all duration-300 ease-in-out bg-white border-1 ${isCollapsed ? 'w-[100px] min-w-[100px]' : 'w-[500px] min-w-[500px]'} flex-shrink-0 h-screen flex flex-col`}>
      <Flex justify="space-between" align="center" p="md" c={"white"} className='bg-[#6665AC]'>
        <Title order={4} className={`${isCollapsed ? 'hidden' : 'block'}`}>Create bounding box & Rubric</Title>
        <Button onClick={toggle} variant="transparent" color="white" className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
          <FaRegArrowAltCircleLeft size={24} />
        </Button>
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
