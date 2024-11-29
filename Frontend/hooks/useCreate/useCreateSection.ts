import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const CreateSections = async ({ section_name, course_id }: { section_name: string[], course_id: string }) => {
  const sectionArray = section_name.map(name => ({ section_name: name }));

  const { data: createSectionsResponse } = await axios.post('/api/api/sections', 
    sectionArray, 
    {
      params: { course_id },
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return createSectionsResponse;
};

export const useCreateSections = () => {
  const queryClient = useQueryClient(); // สร้าง instance ของ queryClient

  return useMutation({
    mutationFn: ({ section_name, course_id }: { section_name: string[], course_id: string }) =>
      CreateSections({ section_name, course_id }),

    onSuccess: (data, variables) => {
      console.log('Section created successfully:', data);

      queryClient.invalidateQueries({
        queryKey: ['sections', variables.course_id], // ส่งเป็น object
      });
    },
    
    onError: (error: any) => {
      console.error('Error creating section:', error);
    },
  });
};
