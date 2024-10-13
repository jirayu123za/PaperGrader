import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAssignmentStore } from '../store/useCreateAssignmentStore';

// Interface สำหรับข้อมูล Assignment
interface AssignmentData {
  course_id: string;
  assignment_name: string;
  assignment_description: string;
  //templateFile: File | null;
  submiss_by: string;
  release_date: string;
  due_date: string;
  group_submiss: boolean;
  late_submiss: boolean;
  cut_off_date: string;
}

/*
const createAssignment = async (assignmentData: AssignmentData) => {
  const formData = new FormData();

  formData.append('assignment_name', assignmentData.assignment_name);

  if (assignmentData.templateFile) {
    formData.append('templateFile', assignmentData.templateFile);
  }

  formData.append('submiss_by', assignmentData.submiss_by);
  formData.append('release_date', assignmentData.release_date);
  formData.append('due_date', assignmentData.due_date);
  formData.append('group_submiss', String(assignmentData.group_submiss));
  formData.append('late_submiss', String(assignmentData.late_submiss));

  if (assignmentData.late_submiss) {
    formData.append('cut_off_date', assignmentData.cut_off_date);
  }

  const response = await axios.post('/api/api/assignment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
*/

// const createAssignment = async (assignmentData: AssignmentData) => {
//   const assignmentBody = {
//     course_id: assignmentData.course_id,
//     assignment_name: assignmentData.assignment_name,
//     assignment_description: assignmentData.assignment_description,
//     submiss_by: assignmentData.submiss_by,
//     release_date: assignmentData.release_date,
//     due_date: assignmentData.due_date,
//     group_submiss: assignmentData.group_submiss,
//     late_submiss: assignmentData.late_submiss,
//     cut_off_date: assignmentData.cut_off_date,
//   };

//   const { data: assignmentResponse } = await axios.post('/api/api/instructor/assignment', assignmentBody, {
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     params: { course_id: assignmentData.course_id },
//   });

//   /*
//   if (assignmentData.templateFile && assignmentResponse.assignment_id) {
//     const formData = new FormData();

//     formData.append('templateFile', assignmentData.templateFile);

//     await axios.post(`/api/api/assignment/${assignmentResponse.assignment_id}/upload`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//   }
//     */

//   return assignmentResponse;
// };

const createAssignment = async (formData: FormData) => {
  const course_id = formData.get('course_id');
  const { data: assignmentResponse } = await axios.post('/api/api/instructor/assignment/files',
    formData, {
    params: { course_id },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return assignmentResponse;
};

export const useCreateAssignment = () => {
  const reset = useAssignmentStore((state) => state.reset);

  return useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      reset();
    },
    onError: (error: any) => {
      console.error("Error creating assignment:", error);
    },
  });
};
