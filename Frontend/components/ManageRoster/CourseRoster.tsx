import React, { useState } from 'react';
import { Button, Table, Menu } from '@mantine/core';
import AddMember from '../AddStudent/AddMember';
import { useFetchUsersRoster } from '../../hooks/Roster/useFetchUsersRoster';
import { useRouter } from 'next/router';
import { useRosterStore } from '../../store/useRosterStore';
import EditCourseMember from '../Customize/EditCourseMember';

const CourseRoster: React.FC = () => {
  const router = useRouter();
  const { course_id } = router.query;
  const { data, isLoading, error } = useFetchUsersRoster(course_id as string);
  const { usersList } = useRosterStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPersonalDataId, setSelectedPersonalDataId] = useState<string | null>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openEditModal = (personal_data_id: string) => {
    setSelectedPersonalDataId(personal_data_id);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedPersonalDataId(null);
    setIsEditModalOpen(false);
  };

  if (isLoading) return <div>Loading Roster Users list...</div>;
  if (error) return <div>Error loading Roster Users list: {error.message}</div>;

  return (
    <div className="p-8 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Course Roster</h1>

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
              <td className="p-2">{member.role_type}</td>
              <td className="p-2">{member.section_name || 'All'}</td>
              <td className="p-2">
                {member.role_type === 'INSTRUCTOR' ? '-' : member.submissions_count || 0}
              </td>
              <td className="p-2">
                <Menu>
                  <Menu.Target>
                    <Button variant="subtle">•••</Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item onClick={() => openEditModal(member.personal_data_id)}>
                      Update Information
                    </Menu.Item>
                    <Menu.Item color="red">Remove User</Menu.Item>
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
        personal_data_id={selectedPersonalDataId}
      />
    </div>
  );
};

export default CourseRoster;
