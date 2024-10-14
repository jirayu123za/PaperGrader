import { useEffect } from 'react';
import { useUserStore } from '../store/useUserStore';
import { useUniversityStore } from '../store/useUniversityStore';
import { Modal, Button, TextInput, Select } from '@mantine/core';
import { useFetchUniversity } from '../hooks/useFetchUniversities';
import { useCreateUser } from '../hooks/useCreateUser';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/router';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import '@mantine/dates/styles.css';



interface SignUpProps {
  opened: boolean;
  onClose: () => void;
}

export default function SignUp({ opened, onClose }: SignUpProps) {
  const { setGoogleId , google_id } = useUserStore();
  const { universities, setUniversities } = useUniversityStore();
  const { data: universityData, isSuccess: universitySuccess } = useFetchUniversity();
  const createUserMutation = useCreateUser();
  const router = useRouter();
  

  // ใช้ useForm สำหรับการจัดการฟอร์ม
  const form = useForm({
    initialValues: {
      email: '',
      first_name: '',
      last_name: '',
      birth_date: '',
      student_id: '',
      role: 'Instructor', // ค่าเริ่มต้นเป็น Instructor
      selectedUniversity: '',
    },

    validate: {
      first_name: (value) => (value.length < 2 ? 'First name must have at least 2 characters' : null),
      last_name: (value) => (value.length < 2 ? 'Last name must have at least 2 characters' : null),
      selectedUniversity: (value) => (value ? null : 'University is required'),
    },
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      try {
        const decodedUser = jwtDecode(token);

        // ตรวจสอบว่าค่าที่จะเซ็ตนั้นมีการเปลี่ยนแปลงหรือไม่ก่อนที่จะเซ็ตค่าใหม่
        if (!form.values.email) {
          form.setFieldValue('email', (decodedUser as { email?: string }).email || '');
        }

        if (!form.values.first_name) {
          form.setFieldValue('first_name', (decodedUser as { firstName?: string }).firstName || '');
        }

        if (!form.values.last_name) {
          form.setFieldValue('last_name', (decodedUser as { lastName?: string }).lastName || '');
        }

        setGoogleId((decodedUser as { googleID?: string }).googleID || '');
        console.log("Decoded User:", decodedUser);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    } else {
      console.error("Token is missing");
    }
  }, [setGoogleId]);

  useEffect(() => {
    if (universitySuccess && universityData) {
      setUniversities(universityData);
    }
  }, [universityData, universitySuccess, setUniversities]);

  const handleRoleBasedRedirect = (group_id: number) => {
    if (group_id === 1) {
      router.push("/INSCourseOverview");
    } else if (group_id === 2) {
      router.push("/STDCourseOverview");
    }
  };

  const handleSubmit = (values: typeof form.values) => {
    const formData = {
      google_id: google_id, 
      group_id: values.role === 'Instructor' ? 1 : 2,
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      birth_date: values.birth_date ? dayjs(values.birth_date, "YYYY-MM-DD").format("DD-MM-YYYY") : '',
      student_id: values.role === 'Student' ? values.student_id : null,
      university: values.selectedUniversity,
    };

    createUserMutation.mutate(formData, {
      onSuccess: () => {
        console.log("User created successfully");
        onClose();
        handleRoleBasedRedirect(formData.group_id);
      },
      onError: (error) => {
        console.error("Error creating user:", error);
      },
    });
  };

  return (
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

        {/* สลับ Role */}
        <div className="flex justify-center space-x-2 mb-4">
          <Button
            variant={form.values.role === 'Instructor' ? 'filled' : 'outline'}
            onClick={() => form.setFieldValue('role', 'Instructor')}
            className={form.values.role === 'Instructor' ? 'bg-[#b7410e]' : ''}
          >
            Instructor
          </Button>
          <Button
            variant={form.values.role === 'Student' ? 'filled' : 'outline'}
            onClick={() => form.setFieldValue('role', 'Student')}
            className={form.values.role === 'Student' ? 'bg-[#b7410e]' : ''}
          >
            Student
          </Button>
        </div>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="Email" value={form.values.email} readOnly className="mb-2" />

          <div className="flex space-x-6 mb-2">
            <TextInput
              label="First name"
              placeholder="Enter your first name"
              {...form.getInputProps('first_name')}  // รับค่าและสามารถแก้ไขได้
              className="flex-1"
            />

            <TextInput
              label="Last name"
              placeholder="Enter your last name"
              {...form.getInputProps('last_name')}  // รับค่าและสามารถแก้ไขได้
              className="flex-1"
            />
          </div>

          {form.values.role === 'Student' && (
            <TextInput
              label="Student ID"
              placeholder="Enter your Student ID"
              {...form.getInputProps('student_id')}
              required
              className="mb-2"
            />
          )}

         
            <DatePickerInput
              label="Birth date"
              placeholder="Pick a date"
              allowDeselect
              clearable
              required
              minDate={new Date(1900, 0, 1)}
              maxDate={new Date()}
              closeOnChange
              valueFormat="DD/MM/YYYY"
              dropdownType="popover"
              {...form.getInputProps("birth_date")}
            />
  


          <Select
            label="University"
            placeholder="Select your University"
            data={universities?.map((university) => ({
              value: university.university_name,
              label: university.university_name,
            })) || []}
            searchable
            required
            className="mb-2"
            {...form.getInputProps('selectedUniversity')}
          />

          <Button type="submit" className="bg-[#b7410e] w-full">{`Sign up as an ${form.values.role}`}</Button>
        </form>
      </div>
    </Modal>
  );
}
