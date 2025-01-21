import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import useBoundingBoxStore from '../../store/BoundingBox/useBoundingBoxStore';

const API_BASE_URL = 'http://localhost:8000/api/bounding-boxes';

interface BoundingBox {
  id: string;
  assignmentId: string;
  position: string;
  type: string;
  page: number;
  createdAt?: string;
  updatedAt?: string;
}

// Fetch all bounding boxes for an assignment
export const useFetchBoundingBoxes = (assignmentId: string) => {
    const { setBoundingBoxes } = useBoundingBoxStore();
  
    return useQuery<BoundingBox[], Error>({
      queryKey: ['boundingBoxes', assignmentId] as const,
      queryFn: async () => {
        const response = await axios.get<BoundingBox[]>(`${API_BASE_URL}?assignmentId=${assignmentId}`);
        setBoundingBoxes(response.data);
        return response.data;
      },
      enabled: Boolean(assignmentId), 
    });
  };
  

// Add a new bounding box
export const useAddBoundingBox = () => {
  const queryClient = useQueryClient();
  const { addBoundingBox } = useBoundingBoxStore();

  return useMutation<BoundingBox, Error, Omit<BoundingBox, 'id'>>({
    mutationFn: async (newBox: Omit<BoundingBox, 'id'>) => {
      const response = await axios.post<BoundingBox>(API_BASE_URL, newBox);
      return response.data;
    },
    onSuccess: (data: BoundingBox) => {
      addBoundingBox(data);
      queryClient.invalidateQueries({ queryKey: ['boundingBoxes'] });
    },
  });
};

// Update a bounding box
export const useUpdateBoundingBox = () => {
  const queryClient = useQueryClient();
  const { updateBoundingBox } = useBoundingBoxStore();

  return useMutation<BoundingBox, Error, { id: string; updatedBox: Partial<Omit<BoundingBox, 'id'>> }>({
    mutationFn: async ({ id, updatedBox }) => {
      const response = await axios.put<BoundingBox>(`${API_BASE_URL}/${id}`, updatedBox);
      return response.data;
    },
    onSuccess: (data: BoundingBox) => {
      updateBoundingBox(data.id, data);
      queryClient.invalidateQueries({ queryKey: ['boundingBoxes'] });
    },
  });
};

// Remove a bounding box
export const useRemoveBoundingBox = () => {
  const queryClient = useQueryClient();
  const { removeBoundingBox } = useBoundingBoxStore();

  return useMutation<string, Error, string>({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_BASE_URL}/${id}`);
      return id;
    },
    onSuccess: (id: string) => {
      removeBoundingBox(id);
      queryClient.invalidateQueries({ queryKey: ['boundingBoxes'] });
    },
  });
};
