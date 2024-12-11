import React, { useState } from 'react';
import LeftMain from '../../../components/LeftINS/LeftMain';
import CourseRoster from '../../../components/ManageRoster/CourseRoster';
import ManageSection from '../../../components/ManageRoster/[course_id]/ManageSection';
import CreateSection from '../../../components/Create/CreateSection';
import { useRouter } from 'next/router';
import { useCourseStore } from '../../../store/useCourseStore';
import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

const ManageRoster: React.FC = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const selectedCourseId = useCourseStore((state) => state.selectedCourseId);
  const actualCourseId = Array.isArray(courseId) ? courseId[0] : courseId || selectedCourseId;
  const [isRosterView, { open: showRoster, close: showSection }] = useDisclosure(true);

  if (!actualCourseId) {
    return <div>Please select a course first!</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <LeftMain/>
      <div className="flex-grow p-6">

        {/* ปุ่มเพื่อสลับระหว่าง CourseRoster และ ManageSection ชิดขวา */}
        <div className="flex justify-end space-x-4 mb-4">
          <Button
            variant={isRosterView ? 'filled' : 'outline'}
            onClick={showRoster}
          >
            Manage Roster
          </Button>
          <Button
            variant={!isRosterView ? 'filled' : 'outline'}
            onClick={showSection}
          >
            Manage Section
          </Button>
        </div>

        {isRosterView ? <CourseRoster /> : <ManageSection />}
        {!isRosterView && ( <CreateSection />)}
      </div>
    </div>
  );
};

export default ManageRoster;
