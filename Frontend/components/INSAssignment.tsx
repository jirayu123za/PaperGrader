import React, { useEffect } from 'react';
import { useAssignmentStore } from '../store/useAssignmentStore'; // นำเข้า Zustand store
import { useFetchAssignments } from '../hooks/useFetchAssignments'; // นำเข้า custom hook สำหรับดึงข้อมูล assignments

interface INTAssignmentProps {
  courseId: string; // รับ CourseId เพื่อใช้ในการดึงข้อมูล assignments
}

const INTAssignment: React.FC<INTAssignmentProps> = ({ courseId }) => {
  const { data, isLoading, error } = useFetchAssignments(courseId); // ดึงข้อมูลจาก custom hook
  const assignments = useAssignmentStore((state) => state.assignments); // ดึงข้อมูล assignments จาก Zustand store

  useEffect(() => {
    // แสดงข้อมูล assignments ใน console เพื่อตรวจสอบ
    console.log(assignments);
  }, [assignments]);

  if (isLoading) return <div>Loading assignments...</div>;
  if (error) return <div>Error loading assignments: {error.message}</div>;

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">{assignments.length} Assignments</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-4 text-left">NAME</th>
            <th className="py-2 px-4 text-left">POINTS</th>
            <th className="py-2 px-4 text-left">RELEASED</th>
            <th className="py-2 px-4 text-left">DUE (PST)</th>
            <th className="py-2 px-4 text-left">SUBMISSIONS</th>
            <th className="py-2 px-4 text-left">% GRADED</th>
            <th className="py-2 px-4 text-left">PUBLISHED</th>
            <th className="py-2 px-4 text-left">REGRADES</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment.assignment_id} className="border-b">
              <td className="py-2 px-4">{assignment.assignment_name}</td>
              <td className="py-2 px-4">0.0</td> {/* ถ้ายังไม่มีข้อมูล ให้แสดง 0.0 */}
              <td className="py-2 px-4">{new Date(assignment.assignment_duedate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
              <td className="py-2 px-4">{new Date(assignment.assignment_duedate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
              <td className="py-2 px-4">0</td>
              <td className="py-2 px-4">0%</td> {/* ถ้ายังไม่มีข้อมูล ให้แสดง 0% */}
              <td className="py-2 px-4">ON</td> {/* ถ้ายังไม่มีข้อมูล ให้แสดง ON */}
              <td className="py-2 px-4">ON</td> {/* ถ้ายังไม่มีข้อมูล ให้แสดง ON */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default INTAssignment;
