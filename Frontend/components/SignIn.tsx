import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore'; // Zustand store สำหรับข้อมูลการเข้าสู่ระบบ
import { useSchoolStore } from '../store/useSchoolStore'; // Zustand store สำหรับ school
import { Modal, Button, TextInput, Select, Notification } from '@mantine/core'; // เพิ่ม Notification หากต้องการแสดงข้อความ
import { useFetchSchools } from '../hooks/useFetchSchools'; // Custom Hook สำหรับดึงข้อมูล school

interface SignUpProps {
  opened: boolean;
  onClose: () => void;
}

export default function SignUp({ opened, onClose }: SignUpProps) {
  const [role, setRole] = useState<'Instructor' | 'Student'>('Instructor');
  const email = useAuthStore((state) => state.email) || ''; // ดึง email จาก Auth store ที่เก็บไว้หลังจาก login สำเร็จ และใช้ '' แทน null
  const { schools, setSchools } = useSchoolStore();
  const [studentID, setStudentID] = useState(''); // State สำหรับ StudentID
  const [firstName, setFirstName] = useState(''); // State สำหรับ FirstName
  const [lastName, setLastName] = useState(''); // State สำหรับ LastName
  const [dateOfBirth, setDateOfBirth] = useState(''); // State สำหรับ Date of Birth
  const [university, setUniversity] = useState<string | null>(null); // แก้ไขให้รองรับทั้ง string และ null
  const [error, setError] = useState<string | null>(null); // State สำหรับจัดการ Error message

  // ดึงข้อมูลโรงเรียน
  const { data: schoolData, isSuccess: schoolSuccess } = useFetchSchools();

  useEffect(() => {
    if (schoolSuccess && schoolData) {
      setSchools(schoolData);
    }
  }, [schoolData, schoolSuccess, setSchools]);

  // ฟังก์ชันสำหรับการตรวจสอบและส่งข้อมูล
  const handleSignUp = () => {
    // ตรวจสอบว่า field ที่จำเป็นต้องมีข้อมูลถูกกรอกครบถ้วนหรือไม่
    if (!firstName || !lastName || !dateOfBirth || !university || (role === 'Student' && !studentID)) {
      setError('Please fill in all required fields.');
      return;
    }

    // ส่งข้อมูลไปยัง backend หรือทำ action ที่ต้องการ
    console.log({
      email,
      firstName,
      lastName,
      dateOfBirth,
      university,
      studentID: role === 'Student' ? studentID : undefined, // ถ้า role เป็น Student ถึงจะส่ง studentID
      role,
    });

    // หากส่งข้อมูลสำเร็จ ให้ reset error และปิด modal
    setError(null);
    onClose();
  };

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
            value={email}
            readOnly
            className="mb-2"
          />

          <div className="flex space-x-4 mb-2">
            <TextInput
              label="First name"
              placeholder="Enter your first name"
              value={firstName}
              onChange={(event) => setFirstName(event.currentTarget.value)}
              required
              className="flex-1"
            />
            <TextInput
              label="Last name"
              placeholder="Enter your last name"
              value={lastName}
              onChange={(event) => setLastName(event.currentTarget.value)}
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
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.currentTarget.value)}
            />
          </div>

          {/* Dropdown ที่มีฟังก์ชันค้นหา */}
          <Select
            label="University"
            placeholder="Select your University"
            data={schools?.map((school) => ({
              value: school.id,  // ใช้ 'id' เป็น value
              label: school.school,  // ใช้ 'school' เป็น label
            })) || []}  // ถ้า schools ยังไม่ถูกดึงมาก็ให้เป็น array ว่าง
            searchable  // ทำให้ช่องนี้สามารถพิมพ์ค้นหาได้
            required
            className="mb-2"
            value={university}
            onChange={(value) => setUniversity(value)} // ปรับให้รองรับการเปลี่ยนค่าได้ทั้ง string และ null
          />

          {/* แสดง error message */}
          {error && (
            <Notification color="red" onClose={() => setError(null)}>
              {error}
            </Notification>
          )}

          {/* ปรับปุ่ม Sign up ให้อยู่ตรงกลาง */}
          <div className="flex justify-center">
            <Button className="bg-[#b7410e] w-full" onClick={handleSignUp}>
              {`Sign up as an ${role}`}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
