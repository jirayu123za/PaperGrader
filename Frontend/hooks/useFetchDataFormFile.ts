import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface FileUploadParams {
    file: File;
}

const uploadFile = async ({ file }: FileUploadParams) => {
    console.log('Uploading file:', file);

    const formData = new FormData();
    formData.append('file', file);

    const { data } = await axios.post('/api/api/instructor/roster/file', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return data;
};

export const useUploadFile = () => {
    return useMutation({
        mutationFn: uploadFile,
        onSuccess: (data) => {
            console.log('Upload successful:', data);
            alert('File uploaded successfully!');
        },
        onError: (error) => {
            console.error('Upload failed:', error);
            alert('Failed to upload the file. Please try again.');
        },
    });
};