import { useEffect, useState } from 'react';
import { useEmailStore } from '../store/useUserStore'; // Zustand store สำหรับ email
import { useSchoolStore } from '../store/useSchoolStore'; // Zustand store สำหรับ school
import { Modal, Button, TextInput, Select } from '@mantine/core';
import { useFetchEmails } from '../hooks/useFetchEmails'; // Custom Hook สำหรับดึงข้อมูล email
import { useFetchSchools } from '../hooks/useFetchSchools'; // Custom Hook สำหรับดึงข้อมูล school

interface SignUpProps {
  opened: boolean;
  onClose: () => void;
}

export default function SignUp({ opened, onClose }: SignUpProps) {
  const [role, setRole] = useState('Instructor');
  const { email, setEmails } = useEmailStore();
  const { schools, setSchools } = useSchoolStore();
  const [studentID, setStudentID] = useState(''); // State สำหรับ StudentID

  // ดึงข้อมูล email
  const { data: emailData, isSuccess: emailSuccess } = useFetchEmails();

  useEffect(() => {
    if (emailSuccess && emailData) {
      setEmails(emailData);
    }
  }, [emailData, emailSuccess, setEmails]);

  // ดึงข้อมูลโรงเรียน
  const { data: schoolData, isSuccess: schoolSuccess } = useFetchSchools();

  useEffect(() => {
    if (schoolSuccess && schoolData) {
      setSchools(schoolData);
    }
  }, [schoolData, schoolSuccess, setSchools]);

  const userId = "1";
  const user = email.find((user) => user.user_id === userId);

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={null}
        withCloseButton={false}
        centered
        overlayProps={{
          color: 'rgba(0, 0, 0, 0.5)',
          blur: 3,
        }}
        styles={{
          content: {
            backgroundColor: '#f5f5dc',
          },
        }}
      >
        <div className="p-6">
          <h2 className="text-center text-xl font-semibold mb-4">Sign up</h2>
          <div className="flex justify-center space-x-2 mb-4">
            <Button
              variant={role === 'Instructor' ? 'filled' : 'outline'}
              onClick={() => setRole('Instructor')}
              className={role === 'Instructor' ? 'bg-[#b7410e]' : ''}
            >
              Instructor
            </Button>
            <Button
              variant={role === 'Student' ? 'filled' : 'outline'}
              onClick={() => setRole('Student')}
              className={role === 'Student' ? 'bg-[#b7410e]' : ''}
            >
              Student
            </Button>
          </div>

          {/* แสดง email ในฟิลแต่ไม่ให้แก้ไข */}
          <TextInput
            label="Email"
            value={user?.email || ''}
            readOnly
            className="mb-2"
          />

          <div className="flex space-x-4 mb-2">
            <TextInput
              label="First name"
              placeholder="Enter your first name"
              required
              className="flex-1"
            />
            <TextInput
              label="Last name"
              placeholder="Enter your last name"
              required
              className="flex-1"
            />
          </div>

          {/* แสดงฟิล Student ID เมื่อเลือก role เป็น Student */}
          {role === 'Student' && (
            <div className="mb-2">
              <TextInput
                label="Student ID"
                placeholder="Enter your Student ID"
                value={studentID}
                onChange={(event) => setStudentID(event.currentTarget.value)}
                required
              />
            </div>
          )}

          <div className="mb-2">
            <TextInput
              label="Date of Birth"
              placeholder="Select your date of birth"
              type="date"
            />
          </div>

          {/* Dropdown ที่มีฟังก์ชันค้นหา */}
          <Select
            label="School"
            placeholder="Select your school"
            data={schools?.map((school) => ({
              value: school.id,  // ใช้ 'id' เป็น value
              label: school.school,  // ใช้ 'school' เป็น label
            })) || []}  // ถ้า schools ยังไม่ถูกดึงมาก็ให้เป็น array ว่าง
            searchable  // ทำให้ช่องนี้สามารถพิมพ์ค้นหาได้
            required
            className="mb-2"
          />

          {/* ปรับปุ่ม Sign up ให้อยู่ตรงกลาง */}
          <div className="flex justify-center">
            <Button className="bg-[#b7410e] w-full">{`Sign up as an ${role}`}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
