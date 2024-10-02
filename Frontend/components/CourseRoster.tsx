import React, { useState } from 'react'; 
import { Button, Select, Table } from '@mantine/core'; // ใช้ Mantine สำหรับ UI
import AddMember from '../components/AddStudent/AddMember'; // นำเข้า AddMemberModal ที่คุณสร้างไว้

interface Member {
  name: string;
  email: string;
  role: string;
  submissions: number;
}

const CourseRoster: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([
    {
      name: 'Olga Korobova',
      email: 'olga@gradescope.com',
      role: 'Instructor',
      submissions: 0,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false); // สร้าง state สำหรับ modal

  // ฟังก์ชันสำหรับเปิด modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // ฟังก์ชันสำหรับปิด modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Course Roster</h1>

      {/* ส่วนค้นหา */}
      <div className="flex justify-between items-center mb-4">
        <Select
          placeholder="All"
          data={['All', 'Instructor', 'Student','Staff']}
          className="w-1/4"
        />
        <input
          type="search"
          placeholder="Search"
          className="border rounded-lg px-4 py-2 w-1/3"
        />
      </div>

      {/* ตารางแสดงสมาชิก */}
      <Table>
        <thead>
          <tr>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Email</th>
            <th className="text-left p-2" style={{ width: '150px' }}>Role</th>
            <th className="text-left p-2">Submissions</th>
            <th className="text-left p-2">Remove</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <tr key={index}>
              <td className="p-2">{member.name}</td>
              <td className="p-2">{member.email}</td>
              <td className="p-2">
                <Select
                  value={member.role}
                  data={['Instructor', 'Student', 'Staff']}
                  onChange={(value) => {
                    const updatedMembers = [...members];
                    updatedMembers[index].role = value || 'Student';
                    setMembers(updatedMembers);
                  }}
                  style={{ width: '130px' }} 
                />
              </td>
              <td className="p-2">{member.submissions}</td>
              <td className="p-2">
                <Button
                  variant="outline"
                  color="red"
                  onClick={() => {
                    setMembers(members.filter((_, i) => i !== index));
                  }}
                  size="xs" // ลดขนาดปุ่ม Remove
                >
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* กรณีที่ยังไม่มีสมาชิก */}
      {members.length === 0 && (
        <div className="text-center mt-8">
          <p>You haven't added anyone to your course yet.</p>
          <Button variant="default" onClick={openModal}> {/* เมื่อกดปุ่มจะเปิด modal */}
            Add Members
          </Button>
        </div>
      )}

      {/* ปุ่มเพิ่มสมาชิก */}
      <div className="text-center mt-8">
        <Button onClick={openModal}>Add Members</Button>
      </div>

      {/* แสดง AddMemberModal เมื่อกดปุ่ม */}
      <AddMember isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default CourseRoster;
