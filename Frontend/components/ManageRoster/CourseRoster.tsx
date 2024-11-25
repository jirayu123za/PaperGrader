import React, { useState } from 'react';
import { Button, Select, Table, Menu } from '@mantine/core';
import AddMember from '../AddStudent/AddMember';
import { useFetchUsersRoster } from '../../hooks/Roster/useFetchUsersRoster';
import { useRouter } from 'next/router';
import { useRosterStore } from '../../store/useRosterStore';
import EditCourseMember from '../Customize/EditCourseMember'; // Import modal component

const CourseRoster: React.FC = () => {
  const router = useRouter();
  const { course_id } = router.query;
  const { data, isLoading, error } = useFetchUsersRoster(course_id as string);
  const { usersList } = useRosterStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null); // Track selected user

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openEditModal = (member: any) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => setIsEditModalOpen(false);

  if (isLoading) return <div>Loading Roster Users list...</div>;
  if (error) return <div>Error loading Roster Users list: {error.message}</div>;

  return (
    <div className="p-8 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Course Roster</h1>

      {/* Search */}
      <div className="flex justify-between items-center mb-4">
        <Select
          placeholder="All"
          data={['All', 'Instructor', 'Student', 'Staff']}
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
            <th className="text-left p-2">Section</th>
            <th className="text-left p-2">Submissions</th>
          </tr>
        </thead>
        <tbody>
          {usersList.map((member) => (
            <tr key={member.personal_data_id}>
              <td className="p-2">{member.full_name}</td>
              <td className="p-2">{member.email}</td>
              <td className="p-2">
                <Select
                  value={member.role_type}
                  data={['INSTRUCTOR', 'STUDENT', 'TA', 'STAFF']}
                  searchable
                  nothingFoundMessage="Nothing found..."
                  style={{ width: '140px' }}
                />
              </td>
              <td className="p-2">{member.section_name || 'All'}</td>
              <td className="p-2">
                {member.role_type === 'INSTRUCTOR' ? '-' : member.submissions_count}
              </td>
              <td className="p-2">
                <Menu>
                  <Menu.Target>
                    <Button variant="subtle">•••</Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      onClick={() => openEditModal(member)}
                    >
                      Update Information
                    </Menu.Item>
                    <Menu.Item color="red">
                      Remove User
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* No members */}
      {usersList.length === 0 && (
        <div className="text-center mt-8">
          <p>You haven't added anyone to your course yet.</p>
          <Button variant="default" onClick={openModal}>
            Add Members
          </Button>
        </div>
      )}

      {/* Add Members Button */}
      <div className="text-center mt-8">
        <Button onClick={openModal}>Add Members</Button>
      </div>

      {/* AddMember Modal */}
      <AddMember isOpen={isModalOpen} onClose={closeModal} />

      {/* EditCourseMember Modal */}
      <EditCourseMember
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        member={selectedMember}
      />
    </div>
  );
};

export default CourseRoster;
