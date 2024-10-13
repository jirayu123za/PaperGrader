import React, { useEffect, useState } from 'react'; 
import { Button, Select, Table } from '@mantine/core';
import AddMember from '../components/AddStudent/AddMember';
import { useFetchUsersRoster } from '../hooks/useFetchUsersRoster';
import { useRouter } from 'next/router';
import { useRosterStore } from '../store/useRosterStore';

// interface Member {
//   name: string;
//   email: string;
//   role: string;
//   submissions: number;
// }

const CourseRoster: React.FC = () => {
  // const [members, setMembers] = useState<Member[]>([
  //   {
  //     name: 'Olga Korobova',
  //     email: 'olga@gradescope.com',
  //     role: 'Instructor',
  //     submissions: 0,
  //   },
  // ]);
  const router = useRouter();
  const { course_id } = router.query;
  const { data, isLoading, error } = useFetchUsersRoster(course_id as string); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { usersList, setUsersList } = useRosterStore(); 

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (isLoading) return <div>Loading Roster Users list...</div>;
  if (error) return <div>Error loading Roster Users list: {error.message}</div>;

  return (
    <div className="p-8 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Course Roster</h1>

      {/* Search */}
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

      {/* Table */}
      <Table>
        <thead>
          <tr>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Email</th>
            <th className="text-left p-2">Role</th>
            <th className="text-left p-2">Submissions</th>
            <th className="text-left p-2">Remove</th>
          </tr>
        </thead>
        <tbody>
          {usersList.map((member, index) => (
            <tr key={index}>
              <td className="p-2">{member.full_name}</td>
              <td className="p-2">{member.email}</td>
              <td className="p-2">
                <Select
                  value={member.user_group_name}
                  data={['INSTRUCTOR', 'STUDENT', 'TA', 'STAFF']}
                  searchable
                  nothingFoundMessage="Nothing found..."
                  //disabled
                  style={{ width: '140px' }} 
                />
              </td>
              <td className="p-2">{member.submissions_count}</td>
              <td className="p-2">
                <Button
                  variant="outline"
                  color="red"
                  onClick={() => {
                    //setMembers(members.filter((_, i) => i !== index));
                  }}
                >
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* กรณีที่ยังไม่มีสมาชิก */}
      {usersList.length === 0 && (
        <div className="text-center mt-8">
          <p>You haven't added anyone to your course yet.</p>
          <Button variant="default" onClick={openModal}>
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
