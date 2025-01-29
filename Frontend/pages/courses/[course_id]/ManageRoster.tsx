import React from 'react';
import LeftMain from '../../../components/LeftINS/LeftMain';
import CourseRoster from '../../../components/ManageRoster/CourseRoster';
import ManageSection from '../../../components/ManageRoster/ManageSection';
import { Tabs } from '@mantine/core';

const ManageRoster: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <LeftMain/>
      <div className="flex-grow p-6">
        <Tabs defaultValue="roster">
          <Tabs.List>
            <Tabs.Tab value="roster">Manage roster</Tabs.Tab>
            <Tabs.Tab value="section">Manage section</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="roster">
            <CourseRoster />
          </Tabs.Panel>
          <Tabs.Panel value="section">
            <ManageSection />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
};

export default ManageRoster;
