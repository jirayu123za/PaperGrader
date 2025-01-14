import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import {Container,Title,Text,Button,Table,Flex,Divider,Box,TextInput,NumberInput,} from '@mantine/core';
import { useForm } from '@mantine/form';
import { FaBars } from 'react-icons/fa';
import { useDisclosure } from '@mantine/hooks';

interface BoundingBox {
  topLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
  pageNumber: number;
  title: string;
  points: number;
  type: 'NAME' | 'STUDENTID' | 'QUESTION';
}

interface CreateOutlineProps {
  onNewQuestion: () => void;
  onEditName: () => void;
  onEditStudentID: () => void;
  boundingBoxes: BoundingBox[];
  updateBoundingBox: (index: number, updatedBox: BoundingBox) => void;
  removeBoundingBox: (index: number) => void;
  onToggleCollapse: (isCollapsed: boolean) => void; // เพิ่ม callback props
}


const CreateOutline: React.FC<CreateOutlineProps> = ({
  onNewQuestion,
  onEditName,
  onEditStudentID,
  boundingBoxes,
  updateBoundingBox,
  removeBoundingBox,
  onToggleCollapse,
}) => {
  const router = useRouter();
  const { assignment_id, course_id } = router.query;
  const [isCollapsed, { toggle }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      boundingBoxes: boundingBoxes as BoundingBox[],
    },
  });

  const handleCancel = () => {
    router.push(`/courses/${course_id}/assignments/${assignment_id}`);
  };

  const handleInputChange = (index: number, field: keyof BoundingBox, value: any) => {
    const updatedBox = { ...form.values.boundingBoxes[index], [field]: value };
    const updatedBoxes = [...form.values.boundingBoxes];
    updatedBoxes[index] = updatedBox;
    form.setFieldValue('boundingBoxes', updatedBoxes);

    if (assignment_id) {
      localStorage.setItem(
        `boundingBoxes-${assignment_id}`,
        JSON.stringify(updatedBoxes)
      );
    }
  };

  const handleSaveOutline = () => {
    if (assignment_id) {
      localStorage.setItem(
        `boundingBoxes-${assignment_id}`,
        JSON.stringify(form.values.boundingBoxes)
      );
      alert('Outline saved successfully!');
    }
  };
  const handleToggle = () => {
    toggle(); // สลับสถานะหุบ/ขยาย
    onToggleCollapse(!isCollapsed); // ส่งสถานะใหม่กลับไป
  };

  useEffect(() => {
    const savedBoxes = localStorage.getItem(`boundingBoxes-${assignment_id}`);
    if (savedBoxes) {
      try {
        const parsedBoxes: BoundingBox[] = JSON.parse(savedBoxes);
        if (Array.isArray(parsedBoxes)) {
          form.setFieldValue('boundingBoxes', parsedBoxes);
        }
      } catch (error) {
        console.error('Error parsing bounding box data:', error);
      }
    }
  }, [assignment_id, form]);



  return (
    <div
      className={`fixed top-0 right-0 h-full transition-all duration-300 bg-white shadow-lg ${isCollapsed ? 'w-25' : 'w-[450px]'
        }`}
      style={{
        overflow: 'hidden',
        backgroundColor: '#f8f9fa', // Background color
      }}
    >
      {/* Header Section */}
      <Flex justify="space-between" align="center" p="md" style={{ backgroundColor: '#6665AC', color: '#F9F9F9' }}>
        <Title order={4} className={`${isCollapsed ? 'hidden' : 'block'}`}>
          Outline for Assignment
        </Title>
        <Button
        
          onClick={handleToggle}
          variant="subtle"
          radius="md"
          styles={() => ({
            root: {
              backgroundColor: '#6665AC',
              color: '#F9F9F9',
              padding: 0,
              height: 'auto',
              ':hover': { backgroundColor: '#4e4d9f' },
            },
          })}
        >
          <FaBars
            size={24}
            className={`transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'
              }`}
          />
        </Button>
      </Flex>

      {!isCollapsed && (
        <Container size="sm" py="xl">
          <Box mb="md">
            <Text size="sm" color="dimmed">
              {form.values.boundingBoxes.length} bounding boxes total
            </Text>
          </Box>

          <Flex mb="lg" gap="sm">
            <Button size="xs" variant="outline" onClick={onEditName}>
              Edit Name
            </Button>
            <Button size="xs" variant="outline" onClick={onEditStudentID}>
              Edit Student ID
            </Button>
          </Flex>

          <Text size="sm" color="dimmed" mb="lg">
            Create questions and subquestions via the + buttons below, or by dragging boxes on the template.
          </Text>

          <Table>
            <thead>
              <tr>
                <th style={{ width: '5%' }}>#</th>
                <th style={{ width: '70%' }}>Title</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Points</th>
                <th style={{ width: '15%', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {form.values.boundingBoxes
                .filter((box) => box.type === 'QUESTION')
                .map((box, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <TextInput
                        size="xs"
                        value={box.title}
                        onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                      />
                    </td>
                    <td>
                      <NumberInput
                        size="xs"
                        value={box.points}
                        onChange={(value) => handleInputChange(index, 'points', value)}
                        hideControls
                      />
                    </td>
                    <td>
                      <Button
                        size="xs"
                        color="red"
                        variant="outline"
                        onClick={() => removeBoundingBox(index)}
                      >
                        X
                      </Button>
                    </td>
                  </tr>
                ))}
              <tr>
                <td colSpan={4} align="center">
                  <Button size="xs" variant="default" onClick={onNewQuestion}>
                    + New Question
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>

          <Divider my="lg" />

          <Flex gap="sm" mt="lg">
            <Button variant="default" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="filled" onClick={handleSaveOutline}>
              Save Outline
            </Button>
          </Flex>
        </Container>
      )}
    </div>
  );
};

export default CreateOutline;
