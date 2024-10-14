import React, { useState } from 'react';
import Link from 'next/link'; // นำเข้า Link จาก Next.js
import { useAssignments } from '../../hooks/useFetchSTD_Assignment';
import { useAssignmentStore } from '../../store/useSTD_AssignmentStore';
import { Card, Progress, Text, Checkbox, ScrollArea } from '@mantine/core';
import dayjs from 'dayjs';
import STDSubmit from '../STD/STD_submit'; // Import STDSubmit component

const STD_Dashboard = () => {
  const { data: assignments, isLoading, error } = useAssignments('courseId');
  const { assignments: assignmentList } = useAssignmentStore();

  // State สำหรับควบคุมการเปิด modal และเก็บ assignmentId
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  if (isLoading) return <div>Loading assignments...</div>;
  if (error) return <div>Error loading assignments: {error.message}</div>;

  // ฟังก์ชันคำนวณ Progress bar และจำนวนวันคงเหลือ
  const calculateProgress = (releaseDate: string, dueDate: string) => {
    const now = dayjs();
    const release = dayjs(releaseDate);
    const due = dayjs(dueDate);

    if (!release.isValid() || !due.isValid()) {
      return { diff: "Invalid date", progress: 0 };
    }

    const totalDuration = due.diff(release, 'day');
    const timePassed = now.diff(release, 'day');
    const progress = totalDuration > 0 ? (timePassed / totalDuration) * 100 : 100;
    const diff = due.diff(now, 'day');

    return { diff, progress: progress > 100 ? 100 : progress < 0 ? 0 : progress };
  };

  // ฟังก์ชันเปิด modal เมื่อคลิก assignment name
  const openModal = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId); // เก็บ assignmentId ที่เลือก
    setIsModalOpen(true); // เปิด modal
  };

  // ปิด modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAssignmentId(null); // รีเซ็ตค่า assignmentId
  };

  // กรอง assignment ที่ยังไม่เลย due date
  const filteredAssignments = assignmentList.filter((assignment) => {
    const dueDate = dayjs(assignment.due_date);
    return dueDate.isAfter(dayjs()); // แสดง assignments ที่ไม่เลยกำหนด
  });

  // เรียง assignments ตามเวลาที่เหลือก่อน due date
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    const timeLeftA = dayjs(a.due_date).diff(dayjs(), 'day');
    const timeLeftB = dayjs(b.due_date).diff(dayjs(), 'day');
    return timeLeftA - timeLeftB;
  });

  return (
    <div>
      <ScrollArea h={700} type="never">
        <div className="space-y-4">
          {sortedAssignments.map((assignment) => {
            const { diff, progress } = calculateProgress(assignment.release_Date, assignment.due_date);

            return (
              <Card key={assignment.assignment_id} shadow="sm" padding="lg" radius="md" withBorder>
                <div className="flex justify-between items-center">

                  {/* คลิกที่ชื่อ Course จะแสดงเป็น course_code แต่ส่ง course_id */}
                  <div className="w-1/4">
                    <Link href={`/STDCourseOverview/Course/${assignment.course_id}`} passHref>
                      <Text style={{ fontWeight: 500 }} className="cursor-pointer hover:underline">
                        Course Code: {assignment.course_code} {/* แสดงเป็น course_code */}
                      </Text>
                    </Link>

                    <Text size="sm" color="dimmed">
                      {assignment.course_name || "Unknown Course"}
                    </Text>
                  </div>

                  {/* คลิกที่ชื่อ Assignment เพื่อเปิด modal */}
                  <div className="w-2/4 flex items-center">
                    <Checkbox />
                    <Text
                      size="sm"
                      color="dimmed"
                      className="ml-2 cursor-pointer"
                      onClick={() => openModal(assignment.assignment_id)}
                    >
                      {assignment.assignment_name}
                    </Text>
                  </div>

                  <div className="w-1/4">
                    <Text size="sm" color="dimmed">
                      {typeof diff === 'number' && diff > 0 ? `Due in: ${diff} Days` : "Overdue"}
                    </Text>
                    <Progress value={progress} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* เปิด modal สำหรับการ submit assignment */}
      {selectedAssignmentId && (
        <STDSubmit
          isOpen={isModalOpen}
          onClose={closeModal}
          assignmentId={selectedAssignmentId}
        />
      )}
    </div>
  );
};

export default STD_Dashboard;
