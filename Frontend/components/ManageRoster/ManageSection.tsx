import React, { useEffect } from 'react';
import { Table, Text, Button, Divider } from '@mantine/core';
import { useManageSectionStore } from '../../store/useManageSectionStore';
import { useFetchSections } from '../../hooks/Roster/useFetchSections';

const ManageSection: React.FC = () => {
  const { sections, setSections } = useManageSectionStore();
  const { data: fetchedSections = [], isLoading, error } = useFetchSections();

  useEffect(() => {
    if (fetchedSections && JSON.stringify(fetchedSections) !== JSON.stringify(sections)) {
      setSections(fetchedSections);
    }
  }, [fetchedSections, setSections, sections]);

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error loading sections: {error.message}</Text>;

  return (
    <div>
      <Text size="xl" fw={700} className="mb-4">Sections</Text>
      <Text size="sm" color="dimmed" className="mb-4">
        {sections && sections.length > 0 ? `${sections.length} Sections` : 'This course has no sections created yet.'}
      </Text>

      <Divider className="mb-4" /> {/* เพิ่ม Divider ตรงนี้ */}

      {sections && sections.length > 0 ? (
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
            {sections.map((section) => (
              <tr key={section.id}>
                <td style={{ textAlign: 'center', padding: '12px 0' }}>{section.name}</td>
                <td style={{ textAlign: 'center', padding: '12px 0' }}>{section.studentCount}</td>
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
