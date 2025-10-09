import { useEffect } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { useUniversityStore } from '../../store/useUniversityStore';
import { Modal, Button, TextInput, Select, Title, Flex, NumberInput } from '@mantine/core';
import { useFetchUniversity } from '../../hooks/useFetchUniversities';
import { useCreateUser } from '../../hooks/useCreate/useCreateUser';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import '@mantine/dates/styles.css';

interface SignUpProps {
  opened: boolean;
  onClose: () => void;
}

export default function SignUp({ opened, onClose }: SignUpProps) {
  const router = useRouter();
  const { setGoogleId, google_id } = useUserStore();
  const { universities, setUniversities } = useUniversityStore();
  const { data: universityData, isSuccess: universitySuccess } = useFetchUniversity();
  const createUserMutation = useCreateUser();

  const form = useForm({
    initialValues: {
      email: '',
      first_name: '',
      last_name: '',
      birth_date: null,
      student_id: '',
      role: 'Instructor',
      selectedUniversity: '',
    },

    validate: {
      first_name: (value) => (value.length < 2 ? 'First name must have at least 2 characters' : null),
      last_name: (value) => (value.length < 2 ? 'Last name must have at least 2 characters' : null),
      selectedUniversity: (value) => (value ? null : 'University is required'),
    },
  });

  const normalizeName = (s: string) => {
    const v = (s || '').trim();
    if (!v) return '';
    const lower = v.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        if (!form.values.email) {
          form.setFieldValue('email', (decodedUser as { email?: string }).email || '');
        }

        if (!form.values.first_name) {
          form.setFieldValue('first_name', normalizeName((decodedUser as { firstName?: string }).firstName || ''));
        }

        if (!form.values.last_name) {
          form.setFieldValue('last_name', normalizeName((decodedUser as { lastName?: string }).lastName || ''));
        }

        if (!form.values.student_id) {
          form.setFieldValue('student_id', (decodedUser as { studentID?: string }).studentID || '');
        }

        setGoogleId((decodedUser as { googleID?: string }).googleID || '');
        console.log("Decoded User:", decodedUser);
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to decode token. Please try signing up again.',
          color: 'red',
        });
      }
    } else {
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
        onClose();
        handleRoleBasedRedirect(formData.group_id);
        notifications.show({
          title: 'Success',
          message: 'Account created successfully!',
          color: 'green',
        });
      },
      onError: (error) => {
        notifications.show({
          title: 'Error',
          message: 'Failed to create account. Please try again.',
          color: 'red',
        });
      },
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      overlayProps={{
        color: 'rgba(0, 0, 0, 0.5)',
        blur: 3,
      }}
      styles={{
        content: {
          backgroundColor: '#F9F9F9',
          boxShadow: '0 4px 24px rgba(72, 124, 224, 0.15)',
        },
      }}
    >
      <Flex direction="column" align="center" p="sm">
        <Title order={2} className="text-center mb-4 text-[#484CA3]" mb="md">Sign up</Title>
        <Button.Group mb="md" style={{ width: '100%' }} >
          <Button
            fullWidth
            variant={form.values.role === 'Instructor' ? 'filled' : 'outline'}
            onClick={() => form.setFieldValue('role', 'Instructor')}
            styles={{
              root: {
                backgroundColor: form.values.role === 'Instructor' ? '#4877E0' : 'transparent',
                borderColor: '#4877E0',
                color: form.values.role === 'Instructor' ? '#fff' : '#4877E0',
                '&:hover': {
                  backgroundColor: form.values.role === 'Instructor' ? '#4C6EF5' : '#E9E9E9',
                },
              },
            }}
          >
            Instructor
          </Button>
          <Button
            fullWidth
            variant={form.values.role === 'Student' ? 'filled' : 'outline'}
            onClick={() => form.setFieldValue('role', 'Student')}
            styles={{
              root: {
                backgroundColor: form.values.role === 'Student' ? '#4877E0' : 'transparent',
                borderColor: '#4877E0',
                color: form.values.role === 'Student' ? '#fff' : '#4877E0',
                '&:hover': {
                  backgroundColor: form.values.role === 'Student' ? '#4C6EF5' : '#E9E9E9',
                },
              },
            }}
          >
            Student
          </Button>
        </Button.Group>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="Email" value={form.values.email} readOnly className="mb-2" />

          <div className="flex space-x-6 mb-2">
            <TextInput
              label="First name"
              placeholder="Enter your first name"
              required
              className="flex-1"
              onBlur={(e) => {
                form.setFieldValue('first_name', normalizeName(e.target.value));
              }} 
              {...form.getInputProps('first_name')}
            />

            <TextInput
              label="Last name"
              placeholder="Enter your last name"
              required
              className="flex-1"
              onBlur={(e) => {
                form.setFieldValue('last_name', normalizeName(e.target.value));
              }}
              {...form.getInputProps('last_name')}
            />
          </div>

          {form.values.role === 'Student' && (
            <NumberInput
              hideControls
              required
              label="Student ID"
              placeholder="Enter your Student ID"
              className="mb-2"
              {...form.getInputProps('student_id')}
            />
          )}

          <DatePickerInput
            label="Birth date"
            placeholder="Pick a date"
            allowDeselect
            clearable
            required
            mb="xs"
            minDate={new Date(1980, 0, 1)}
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

          <Button
            type="submit"
            fullWidth
            styles={{
              root: {
                backgroundColor: '#4877E0',
                color: '#fff',
                fontWeight: 500,
                '&:hover': { backgroundColor: '#4C6EF5' },
              },
            }}
            mt="lg"
          >
            {`Sign up as an ${form.values.role}`}
          </Button>

        </form>
      </Flex>
    </Modal>
  );
}
