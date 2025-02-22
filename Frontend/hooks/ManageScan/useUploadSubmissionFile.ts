import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface UploadFileParams {
    assignment_id: string;
    course_id: string;
    files: File[];
}

const uploadSubmissionFile = async ({ assignment_id, course_id, files }: UploadFileParams) => {
    console.log('Uploading submission files:', files, 'for assignment:', assignment_id, 'and course:', course_id);
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const { data } = await axios.post(`/api/api/instructor/submission/file`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        params: {
            assignment_id: assignment_id,
            course_id: course_id,
        },
    });

    return data;
};

export const useUploadSubmissionFile = () => {
    return useMutation({
        mutationFn: uploadSubmissionFile,
        onSuccess: (data) => {
            console.log('Upload successful:', data);
            alert(`File uploaded successfully!`);
        },
        onError: (error) => {
            console.error('Upload failed:', error);
            alert('Failed to upload the file. Please try again.');
        },
    });
};