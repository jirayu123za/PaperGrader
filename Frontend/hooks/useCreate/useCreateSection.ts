import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface CreateSectionData {
  name: string;
}

export const useCreateSection = () => {
  return useMutation((data: CreateSectionData) =>
    axios.post('/api/sections', data) // กำหนด endpoint ของ API ที่จะส่งข้อมูล section
  );
};
