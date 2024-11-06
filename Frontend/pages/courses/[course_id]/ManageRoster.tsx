import React, { useState } from 'react';
import LeftMain from '../../../components/LeftINS/LeftMain';
import CourseRoster from '../../../components/ManageRoster/CourseRoster';
import ManageSection from '../../../components/ManageRoster/ManageSection';
import { useRouter } from 'next/router';
import { useCourseStore } from '../../../store/useCourseStore';
import { Button } from '@mantine/core';
import CreateSection from '../../../components/Create/CreateSection'; // นำเข้า CreateSection modal

const ManageRoster: React.FC = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const selectedCourseId = useCourseStore((state) => state.selectedCourseId);

  const actualCourseId = Array.isArray(courseId) ? courseId[0] : courseId || selectedCourseId;

  const [isRosterView, setIsRosterView] = useState(true); // state เพื่อสลับ view
  const [isModalOpen, setIsModalOpen] = useState(false); // state สำหรับควบคุมการเปิด/ปิด modal

  if (!actualCourseId) {
    return <div>Please select a course first!</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <LeftMain courseId={actualCourseId} />
      <div className="flex-grow p-6">
        <h1 className="text-2xl font-bold mb-4">Roster</h1>

        {/* ปุ่มเพื่อสลับระหว่าง CourseRoster และ ManageSection ชิดขวา */}
        <div className="flex justify-end space-x-4 mb-4">
          <Button
            variant={isRosterView ? 'filled' : 'outline'}
            onClick={() => setIsRosterView(true)}
          >
            Manage Roster
          </Button>
          <Button
            variant={!isRosterView ? 'filled' : 'outline'}
            onClick={() => setIsRosterView(false)}
          >
            Manage Section
          </Button>
        </div>

        {/* แสดง component ตาม state */}
        {isRosterView ? <CourseRoster /> : <ManageSection />}

        {/* ปุ่ม Create Section ที่มุมล่างขวาเมื่ออยู่ใน Manage Section */}
        {!isRosterView && (
          <div className="fixed bottom-6 right-6">
            <Button
              variant="filled"
              color="blue"
              onClick={() => setIsModalOpen(true)}
            >
              Create Section
            </Button>
          </div>
        )}

        {/* Modal สำหรับสร้าง Section */}
        <CreateSection
          opened={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default ManageRoster;
