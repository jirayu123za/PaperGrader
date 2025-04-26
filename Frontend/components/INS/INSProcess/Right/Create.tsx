"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { Container, Title, Button, Flex, Tabs } from '@mantine/core';
import { FaRegArrowAltCircleLeft } from "react-icons/fa";
import { useDisclosure } from '@mantine/hooks';
import { Rubric } from './Rubric';

const Create: React.FC = () => {
  const params = useParams();
  const course_id = params.course_id as string;
  const assignment_id = params.assignment_id as string;
  const [ isCollapsed, { toggle }] = useDisclosure(false);

  return (
    <Container className={`overflow-hidden transition-all duration-400 bg-white border-1 ${isCollapsed ? 'w-25' : 'w-[500px]'} h-screen flex flex-col`}>
      <Flex justify="space-between" align="center" p="md" c={"white"} className='bg-[#6665AC]'>
        <Title order={4} className={`${isCollapsed ? 'hidden' : 'block'}`}>Create bounding box & Rubric</Title>
        <Button onClick={toggle} variant="transparent" color="white" className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
          <FaRegArrowAltCircleLeft size={24} />
        </Button>
      </Flex>

      {!isCollapsed && (
        <Tabs defaultValue="outline" mb="lg" className="flex-grow flex flex-col overflow-hidden">
          <Tabs.List grow>
            <Tabs.Tab value="outline">Create Outline</Tabs.Tab>
            <Tabs.Tab value="grading">Create Rubrics</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="outline" className="flex-grow h-full p-0">
            <div className=' bg-amber-400 h-full'> test outline </div> {/** replace with component */}
          </Tabs.Panel>
          <Tabs.Panel value="grading" className="flex-grow flex flex-col overflow-auto">
            <Rubric />
          </Tabs.Panel>
        </Tabs>
      )}
    </Container>
  );
};

export default Create;
