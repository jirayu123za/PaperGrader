import React from 'react';
import { useRouter } from 'next/router';
import { Table, Text, Button, Divider } from '@mantine/core';
import { useFetchSections } from '../../../hooks/Roster/useFetchSections';
import { useSectionDetailsStore } from '../../../store/useRosterStore';

const ManageSection: React.FC = () => {
  const router = useRouter();
  const { course_id } = router.query;
  const { data, isLoading, error } = useFetchSections(course_id as string);
  const { sectionDetails } = useSectionDetailsStore();

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error loading sections: {error.message}</Text>;
  // if (data) {
  //   console.log(sectionDetails);
  // }  

  return (
    <div>
      <Text size="xl" fw={700} className="mb-4">Sections</Text>
      <Text size="sm" color="dimmed" className="mb-4">
        {sectionDetails && sectionDetails.length > 0 ? `${sectionDetails.length} Sections` : ''}
      </Text>

      <Divider className="mb-4" />

      {sectionDetails && sectionDetails.length > 0 ? (
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
            {sectionDetails.map((sectionDetails) => (
              <tr key={sectionDetails.section_id}>
                <td style={{ textAlign: 'center', padding: '12px 0' }}>{sectionDetails.section_name}</td>
                <td style={{ textAlign: 'center', padding: '12px 0' }}>{sectionDetails.total_students}</td>
                <td style={{ textAlign: 'center', padding: '12px 0' }}>
                  <Button variant="link" onClick={() => console.log('View Student List')}>
                    View Student List
                  </Button>
                </td>
                <td style={{ textAlign: 'center', padding: '12px 0' }}>
                  <Button variant="link" color="red" onClick={() => console.log('Remove Section')}>
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
