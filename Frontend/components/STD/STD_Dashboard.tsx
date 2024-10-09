import React from 'react';
import { useAssignments } from '../../hooks/useFetchSTD_Assignment';
import { useAssignmentStore } from '../../store/useSTD_AssignmentStore';
import { Card, Progress, Text, Checkbox } from '@mantine/core';
import dayjs from 'dayjs';

// ฟังก์ชันสำหรับแปลงวันที่จาก DD-MM-YYYY เป็น MM-DD-YYYY
const convertToMMDDYYYY = (dateStr: string) => {
  const [day, month, year] = dateStr.split('-');
  return `${month}-${day}-${year}`;
};

const STD_Dashboard = () => {
  const { data: assignments, isLoading, error } = useAssignments();
  const { assignments: assignmentList } = useAssignmentStore();

  if (isLoading) return <div>Loading assignments...</div>;
  if (error) return <div>Error loading assignments: {error.message}</div>;

  // ฟังก์ชันคำนวณเวลาที่เหลือจนถึงกำหนดส่งงาน
  const calculateTimeLeft = (dueDate: string) => {
    const now = dayjs();
    
    // แปลงฟอร์แมตวันที่เป็น MM-DD-YYYY
    const convertedDueDate = convertToMMDDYYYY(dueDate);
    
    // แปลงวันที่โดยใช้ฟอร์แมต MM-DD-YYYY
    const due = dayjs(convertedDueDate, "MM-DD-YYYY");

    // ถ้าวันที่ไม่ถูกต้อง ให้แสดง Invalid date
    if (!due.isValid()) {
      return { diff: "Invalid date", progress: 0 };
    }

    // คำนวณวันที่เหลือ
    const diff = due.diff(now, 'day');
    const totalDuration = due.diff(now, 'day');
    const progress = diff > 0 ? ((totalDuration - diff) / totalDuration) * 100 : 0; 

    return { diff, progress };
  };

  // จัดเรียง assignments ตามเวลาที่เหลือ (น้อยสุดอยู่บน)
  const sortedAssignments = [...assignmentList].sort((a, b) => {
    const timeLeftA = dayjs(convertToMMDDYYYY(a.due_date), "MM-DD-YYYY").diff(dayjs(), 'day');
    const timeLeftB = dayjs(convertToMMDDYYYY(b.due_date), "MM-DD-YYYY").diff(dayjs(), 'day');
    return timeLeftA - timeLeftB;
  });

  return (
    <div className="space-y-4 max-h-[800px] overflow-y-auto p-4 no-scrollbar">
      {sortedAssignments.map((assignment) => {
        const { diff, progress } = calculateTimeLeft(assignment.due_date);

        return (
          <Card key={assignment.assignment_id} shadow="sm" padding="lg" radius="md" withBorder>
            <div className="flex justify-between items-center">
              {/* ด้านซ้าย: ข้อมูล Course */}
              <div className="w-1/4">
                <Text style={{ fontWeight: 500 }}>Course Code: {assignment.course_code}</Text>
                <Text size="sm" color="dimmed">
                  {assignment.course_name || "Unknown Course"}
                </Text>
              </div>

              {/* กลาง: Assignment name */}
              <div className="w-2/4 flex items-center">
                <Checkbox />
                <Text size="sm" color="dimmed" className="ml-2">
                  {assignment.assignment_name}
                </Text>
              </div>

              {/* ด้านขวา: Progress bar */}
              <div className="w-1/4">
                <Text size="sm" color="dimmed">
                  Due in: {typeof diff === 'number' ? `${diff} Days` : diff}
                </Text>
                <Progress value={progress} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default STD_Dashboard;
