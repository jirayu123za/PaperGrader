import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { API_BASE } from '@/src/lib/api';
import { useAssignmentStore } from '@/store/Student/useSTD_AssignmentStore';

interface UploadFileParams {
  assignment_id: string;
  course_id: string;
  file: File;
}

interface DownloadFileParams {
  fileUrl: string;
  fileName: string;
}

const uploadStudentFile = async ({ assignment_id, course_id, file }: UploadFileParams) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await axios.post(`${API_BASE}/student/file`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      assignment_id,
      course_id,
    },
  });

  return data;
};

export const useUploadStudentFile = () => {
  const { updateAssignment } = useAssignmentStore();

  return useMutation({
    mutationFn: uploadStudentFile,
    onSuccess: (_data, variables) => {
      updateAssignment(variables.assignment_id, { has_submitted: true });
      notifications.show({
        title: 'File uploaded successfully!',
        message: `Submission File name: ${variables.file.name}`,
        color: 'green',
        autoClose: 5000,
        position: 'bottom-right',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Upload failed',
        message: 'Failed to upload the file. Please try again.',
        color: 'red',
        autoClose: 5000,
        position: 'bottom-right',
      });
    },
  });
};

const downloadStudentFile = async ({ fileUrl, fileName }: DownloadFileParams) => {
  const res = await axios.get(fileUrl, {
    responseType: 'blob',
  });

  const blobUrl = URL.createObjectURL(res.data);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};

export const useDownloadStudentFile = () => {
  return useMutation({
    mutationFn: downloadStudentFile,
    onError: () => {
      notifications.show({
        title: 'Download failed',
        message: 'Failed to download the file. Please try again.',
        color: 'red',
        autoClose: 5000,
        position: 'bottom-right',
      });
    },
    onSuccess(data, variables, context) {
      notifications.show({
        title: 'Download started',
        message: `Downloading file: ${variables.fileName}`,
        color: 'green',
        autoClose: 5000,
        position: 'bottom-right',
      });
    },
  });
};