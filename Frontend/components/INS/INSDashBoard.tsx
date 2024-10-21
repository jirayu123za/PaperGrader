import React, { useState, useEffect } from 'react';
import { useCourseStore } from '../../store/useCourseStore';
import CreateAssignmentModal from '../Create/CreateAssignment';
import { useActiveAssignmentStore } from '../../store/useActiveAssignmentStore';
import { useFetchActiveAssignments } from '../../hooks/useFetchActiveAssignment';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'; // นำเข้า plugin
import { Progress } from '@mantine/core';
import { useRouter } from 'next/router';

dayjs.extend(isSameOrBefore); // เปิดใช้งาน plugin

// ฟังก์ชัน parseDate สำหรับแปลงรูปแบบวันที่
const parseDate = (dateString: string): Date => {
  const [day, month, year] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const INSDashBoard = () => {
  const router = useRouter(); // ใช้ router เพื่อนำทาง
  const selectedCourseId = useCourseStore((state) => state.selectedCourseId);
  const selectedCourse = useCourseStore((state) =>
    state.courses.find((course) => course.course_id === selectedCourseId)
  );

  const { activeAssignments } = useActiveAssignmentStore();
  const { isLoading, error, refetch } = useFetchActiveAssignments(selectedCourseId || '');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    refetch();
  };

  // ฟังก์ชันคำนวณ Time Progress ระหว่าง release date และ due date
  const calculateTimeProgress = (releaseDate: string, dueDate: string) => {
    const now = dayjs();
    const start = dayjs(parseDate(releaseDate));
    const end = dayjs(parseDate(dueDate));
    const totalDuration = end.diff(start, 'day');
    const elapsedTime = now.diff(start, 'day');
    const progress = (elapsedTime / totalDuration) * 100;
    return progress > 100 ? 100 : progress < 0 ? 0 : progress;
  };

  // กรอง assignments ที่ยังไม่เกิน due date หรือเท่ากับ due date
  const filteredAssignments = (activeAssignments || [])
    .filter(assignment => {
      const now = dayjs();
      const dueDate = dayjs(parseDate(assignment.assignment_due_date));

      return now.isSameOrBefore(dueDate);
    })
    .slice(0, 4);

  return (
    <div className="bg-white-50 p-8">
      {/* แสดงผลชื่อ course และ semester */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {selectedCourse ? `${selectedCourse.course_name} ${selectedCourse.semester}/${selectedCourse.academic_year}` : 'No Course Selected'}
          </h1>
        </div>
      </div>

      {/* Section สำหรับ DESCRIPTION และ THINGS TO DO */}
      <div className="flex justify-between items-start mb-8">
        <div className="w-1/2">
          <h2 className="text-lg font-semibold mb-2">DESCRIPTION</h2>
          <p className="text-gray-700">{selectedCourse ? selectedCourse.course_description : 'No description available.'}</p>
        </div>
        <div className="w-1/2">
          <h2 className="text-lg font-semibold mb-2">THINGS TO DO</h2>
          <ul className="list-disc ml-6 text-gray-700">
            <li>Add students or staff to your course from the Roster page.</li>
            <li>Create your first assignment from the Assignments page.</li>
          </ul>
        </div>
      </div>

      {/* Section สำหรับ Active Assignments */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Active Assignments</h2>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-300"
            onClick={openModal}
          >
            Create Assignment
          </button>
        </div>

        {/* ตรวจสอบสถานะโหลดข้อมูล */}
        {isLoading ? (
          <div>Loading assignments...</div>
        ) : error ? (
          <div>Error loading assignments: {error.message}</div>
        ) : filteredAssignments.length > 0 ? (
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left">Active Assignments</th>
                <th className="py-2 px-4 text-left">Released</th>
                <th className="py-2 px-4 text-left">Time Progress</th>
                <th className="py-2 px-4 text-left">Due</th>
                <th className="py-2 px-4 text-left">% Submissions</th>
                <th className="py-2 px-4 text-left">% Graded</th>
                <th className="py-2 px-4 text-left">Published</th>
                <th className="py-2 px-4 text-left">Regrades</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.assignment_id} className="border-b">
                  <td
                    className="py-2 px-4 cursor-pointer  hover:underline"
                    onClick={() => router.push(`/courses/${selectedCourseId}/process/${assignment.assignment_id}/CreateOutline`)}
                  >
                    {assignment.assignment_name}
                  </td>
                  <td className="py-2 px-4">
                    {parseDate(assignment.assignment_release_date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-2 px-4">
                    <div className="relative">
                      <Progress
                        value={calculateTimeProgress(
                          assignment.assignment_release_date,
                          assignment.assignment_due_date
                        )}
                        color="blue"
                        size="sm"
                        radius="lg"
                        className="absolute w-full"
                      />
                      <span className="absolute w-full top-0 h-full bg-gray-200 rounded-lg"></span>
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    {parseDate(assignment.assignment_due_date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-2 px-4">0</td>
                  <td className="py-2 px-4">0%</td>
                  <td className="py-2 px-4">ON</td>
                  <td className="py-2 px-4">ON</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-gray-500">
            You currently have no active assignments. Create an assignment to get started.
          </div>
        )}
      </div>

      {/* เรียกใช้ CreateAssignmentModal และกำหนด prop isOpen และ onClose */}
      <CreateAssignmentModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default INSDashBoard;

