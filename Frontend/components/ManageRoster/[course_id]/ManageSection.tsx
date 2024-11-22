import React from 'react';
import { useRouter } from 'next/router';
import { Table, Text, Button, Divider, Loader } from '@mantine/core';
import { useFetchSections } from '../../../hooks/Roster/useFetchSections';
import { useSectionDetailsStore } from '../../../store/useRosterStore';

const ManageSection: React.FC = () => {
  const router = useRouter();
  const { course_id } = router.query; // ดึง course_id จาก query
  const { isLoading, error } = useFetchSections(course_id as string); // ใช้ React Query ดึงข้อมูล
  const { sectionDetails } = useSectionDetailsStore(); // Zustand Store สำหรับเก็บข้อมูล sections

  // Debug ดูว่ามี sectionDetails ถูกอัปเดตหรือไม่
  console.log('Section Details:', sectionDetails);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader size="md" />
      </div>
    );
  }

  if (error) {
    return <Text color="red">Error loading sections: {error.message}</Text>;
  }

  return (
    <div>
      <Text size="xl" fw={700} className="mb-4">Sections</Text>
      <Text size="sm" color="dimmed" className="mb-4">
        {sectionDetails.length > 0 
          ? `${sectionDetails.length} Sections` 
          : 'No sections available for this course.'}
      </Text>

      <Divider className="mb-4" />

      {sectionDetails.length > 0 ? (
        <Table highlightOnHover>
          <thead>
            <tr>
              <th style={{ textAlign: 'center', padding: '12px 0' }}>Section Name</th>
              <th style={{ textAlign: 'center', padding: '12px 0' }}>No of Students</th>
              <th style={{ textAlign: 'center', padding: '12px 0' }}>View</th>
              <th style={{ textAlign: 'center', padding: '12px 0' }}>Remove</th>
            </tr>
          </thead>
          <tbody>
            {sectionDetails.map((section) => (
              <tr key={section.section_id}>
                <td style={{ textAlign: 'center', padding: '12px 0' }}>{section.section_name}</td>
                <td style={{ textAlign: 'center', padding: '12px 0' }}>{section.total_students}</td>
                <td style={{ textAlign: 'center', padding: '12px 0' }}>
                  <Button variant="subtle" size="xs" onClick={() => console.log(`View Student List for ${section.section_id}`)}>
                    View Student List
                  </Button>
                </td>
                <td style={{ textAlign: 'center', padding: '12px 0' }}>
                  <Button variant="outline" color="red" size="xs" onClick={() => console.log(`Remove Section ${section.section_id}`)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Text ta="center" color="dimmed">
          This course has no sections created yet.
        </Text>
      )}
    </div>
  );
};

export default ManageSection;
