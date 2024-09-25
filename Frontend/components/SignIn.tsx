import { useEffect, useState } from 'react';
import { useEmailStore, useFirstNameStore, useLastNameStore } from '../store/useUserStore';
import { useUniversityStore } from '../store/useUniversityStore';
import { Modal, Button, TextInput, Select } from '@mantine/core';
import { useFetchUniversity } from '../hooks/useFetchUniversities';
import { useCreateUser } from '../hooks/useCreateUser'; 
import { jwtDecode } from 'jwt-decode';

interface SignUpProps {
  opened: boolean;
  onClose: () => void;
}

export default function SignUp({ opened, onClose }: SignUpProps) {
  const [role, setRole] = useState('Instructor');
  const [studentID, setStudentID] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const { email, setEmail } = useEmailStore();
  const { firstName, setFirstName } = useFirstNameStore();
  const { lastName, setLastName } = useLastNameStore();
  const { universities, setUniversities } = useUniversityStore();
  const { data: universityData, isSuccess: universitySuccess } = useFetchUniversity();
  const createUserMutation = useCreateUser(); // เรียกใช้ useCreateUser

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setEmail((decodedUser as { email?: string }).email || "");
        setFirstName((decodedUser as { firstName?: string }).firstName || "");
        setLastName((decodedUser as { lastName?: string }).lastName || "");
        console.log("Decoded User:", decodedUser);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    } else {
      console.error("Token is missing");
    }
  }, []);

  useEffect(() => {
    if (universitySuccess && universityData) {
      setUniversities(universityData);
    }
  }, [universityData, universitySuccess, setUniversities]);

  // ฟังก์ชันสำหรับจัดการการสมัครสมาชิก
  const handleSubmit = async () => {
    const formData = {
      email,
      firstName,
      lastName,
      university: universities.find((uni) => uni.university_name === "Your University Name")?.university_id || "", 
      role,
      studentID: role === 'Student' ? studentID : '',
      dateOfBirth,
    };

    // เรียกใช้ mutation เพื่อส่งข้อมูล
    createUserMutation.mutate(formData, {
      onSuccess: () => {
        console.log("User created successfully");
        onClose(); // ปิด Modal หลังจากสร้างผู้ใช้เสร็จ
      },
      onError: (error) => {
        console.error("Error creating user:", error);
      },
    });
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

          <TextInput
            label="Email"
            value={email}
            readOnly
            className="mb-2"
          />
          <div className="flex space-x-6 mb-2">
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

          {role === 'Student' && (
            <div className="flex mb-2">
              <TextInput
                label="Student ID"
                placeholder="Enter your Student ID"
                value={studentID}
                onChange={(event) => setStudentID(event.currentTarget.value)}
                required
              />
            </div>
          )}

          <div className=" mb-2">
            <TextInput
              label="Date of Birth"
              placeholder="Select your date of birth"
              type="date"
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.currentTarget.value)} // อัพเดท state เมื่อมีการเปลี่ยนแปลง
            />
          </div>

          <Select
            label="University"
            placeholder="Select your University"
            data={universities?.map((university) => ({
              value: university.university_id,
              label: university.university_name,
            })) || []}
            searchable
            required
            className="mb-2"
          />

          <div className="flex justify-center">
            <Button className="bg-[#b7410e] w-full" onClick={handleSubmit}>{`Sign up as an ${role}`}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
