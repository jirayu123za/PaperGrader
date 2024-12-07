import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAssignmentSettingStore } from '../../store/useAssignmentSettingStore';

interface AssignmentSections {
  section_id: string;
  sectionName: string;
  releaseDate: string | null;
  dueDate: string | null;
  cutOffDate: string | null;
}

interface Assignment {
  assignment_id: string;
  assignmentName: string;
  assignmentDescription: string;
  gradingType: string;
  groupSubmiss: boolean;
  lateSubmiss: boolean;
  published: boolean;
  regrades: boolean;
  submissBy: string;
}

interface AssignmentSettingResponse {
  assignment: Assignment;
  assignmentSections: AssignmentSections[];
}


export const useFetchAssignmentSetting = (course_id: string, assignment_id: string) => {
  const setAssignmentSetting = useAssignmentSettingStore((state) => state.setAssignmentSetting);

  return useQuery<AssignmentSettingResponse, Error>({
    queryKey: ['assignment_setting', course_id, assignment_id],
    queryFn: async (): Promise<AssignmentSettingResponse> => {
      const response = await axios.get('/api/api/instructor/assignment', {
        params: { course_id, assignment_id },
      });

      if (response.status !== 200) {
        throw new Error('Failed to fetch assignment setting');
      }

      const { assignment, assignment_sections } = response.data.assignment_setting;

      const assignmentSectionsData = assignment_sections.map((AssignmentSections: any) => ({
        section_id: AssignmentSections.section_id,
        sectionName: AssignmentSections.section_name,
        releaseDate: AssignmentSections.release_date,
        dueDate: AssignmentSections.due_date,
        cutOffDate: AssignmentSections.cut_off_date,
      }));

      const assignmentData: Assignment = {
        assignment_id: assignment.assignment_id,
        assignmentName: assignment.assignment_name,
        assignmentDescription: assignment.assignment_description,
        gradingType: assignment.grading_type,
        groupSubmiss: assignment.group_submiss,
        lateSubmiss: assignment.late_submiss,
        published: assignment.published,
        regrades: assignment.regrades,
        submissBy: assignment.submiss_by,
      };

      const assignmentSetting: AssignmentSettingResponse = {
        assignment: assignmentData,
        assignmentSections: assignmentSectionsData,
      };

      setAssignmentSetting(assignmentSetting);
      return assignmentSetting;
    },
    enabled: !!course_id && !!assignment_id,
  });
};

// interface UpdatePayload {
//   sections: string[];
//   releaseDate: string;
//   dueDate: string;
//   cutOffDate: string;
// }

// Update data function
// const updateCustomizeTimeApi = async (payload: UpdatePayload): Promise<FetchResponse> => {
//   const response = await fetch(`/api/assignments/${assignmentId}/customize-time`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(payload),
//   });

//   if (!response.ok) {
//     throw new Error('Failed to update customize time');
//   }
//   return response.json();
// };

// // UseQuery for fetching data
// const { data, isFetching, error } = useQuery<FetchResponse>({
//   queryKey: ['customizeTime', assignmentId],
//   queryFn: fetchCustomizeTime,
//   enabled: Boolean(assignmentId),
// });

// // UseEffect to manage the query results
// useEffect(() => {
//   if (data) {
//     setSections(data.sections || []);
//     setDates({
//       releaseDate: data.releaseDate,
//       dueDate: data.dueDate,
//       cutOffDate: data.cutOffDate,
//     });
//   }
// }, [data, setSections, setDates]);

// // UseMutation for updating data
// const mutation = useMutation<FetchResponse, Error, UpdatePayload>({
//   mutationFn: updateCustomizeTimeApi,
//   onSuccess: (data: FetchResponse) => {
//     setSections(data.sections || []);
//     setDates({
//       releaseDate: data.releaseDate,
//       dueDate: data.dueDate,
//       cutOffDate: data.cutOffDate,
//     });
//     queryClient.invalidateQueries({
//       queryKey: ['customizeTime', assignmentId], // ใช้ queryKey ผ่าน object
//     });
//     console.log('Data updated successfully');
//   },
//   onError: (error: Error) => {
//     console.error('Error updating data:', error);
//   },
// });

// return {
//   data,
//   isFetching, // ใช้ isFetching แทน isLoading
//   error,
//   isUpdating: mutation.status === 'pending', // แก้ไขจาก isLoading เป็น status === 'pending'
//   updateCustomizeTime: mutation.mutate,
// };
// };
