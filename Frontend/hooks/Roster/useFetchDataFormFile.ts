import axios from 'axios';
import useCSVdataStore from '@/store/add member/useCSVdataStore';
import useTemplateStore from '@/store/BoundingBox/useTemplateStore';
import { useMutation } from '@tanstack/react-query';
import { API_BASE } from '@/src/lib/api';

interface FileUploadParams {
    file: File;
}

export const useUploadFile = () => {
    const { setCsvData } = useCSVdataStore();
    const { selectedTemplate } = useTemplateStore();

    const uploadFile = async ({ file }: FileUploadParams) => {
        const formData = new FormData();
        formData.append('file', file);

        let apiUri = '';

        if (selectedTemplate === 1) {
            apiUri = `${API_BASE}/instructor/roster/file`;
        } else if (selectedTemplate === 2) {
            apiUri = `${API_BASE}/instructor/roster/optionFile`;
        } else {
            throw new Error('Invalid template selected: ' + selectedTemplate);
        }

        const { data } = await axios.post(apiUri, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return data.result;
    };

    return useMutation({
        mutationFn: uploadFile,
        onSuccess: (data) => {
            setCsvData(data);
        },
        onError: (error: any) => {
        },
    });
};