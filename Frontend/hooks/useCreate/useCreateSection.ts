import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const CreateSections = async ({ section_name, course_id }: { section_name: string[], course_id: string }) => {
  const sectionArray = section_name.map(name => ({ section_name: name }));

  const { data: createSectionsResponse } = await axios.post('/api/api/sections',
    sectionArray, {
    params: { course_id },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return createSectionsResponse;
};

export const useCreateSections = () => {
  return useMutation({
    mutationFn: ({ section_name, course_id }: { section_name: string[], course_id: string }) => CreateSections({ section_name, course_id }),
    onSuccess: (data) => {
      console.log('Section created successfully:', data);
    },
    onError: (error: any) => {
      console.error('Error creating section:', error);
    },
  });
};
