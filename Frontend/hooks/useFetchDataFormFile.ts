import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import useCSVdataStore from '../store/add member/useCSVdataStore';

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

    return data.result;
};

export const useUploadFile = () => {
    const { setCsvData } = useCSVdataStore();

    return useMutation({
        mutationFn: uploadFile,
        onSuccess: (data) => {
            console.log('Upload successful:', data);
            setCsvData(data);
            alert('File uploaded successfully!');
        },
        onError: (error) => {
            console.error('Upload failed:', error);
            alert('Failed to upload the file. Please try again.');
        },
    });
};