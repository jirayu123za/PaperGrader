import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import useBoundingBoxStore from '../../store/BoundingBox/useBoundingBoxStore';

const API_BASE_URL = '/api/api/instructor/boundingBoxes';

interface BoundingBox {
  id: string;
  assignmentId: string;
  position: string;
  type: string;
  page: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Rubric {
  id: string;
  assignmentId: string;
  rubricData: string; // JSON string
  createdAt?: string;
  updatedAt?: string;
}

// Fetch all bounding boxes and rubrics for an assignment
export const useFetchBoundingBoxesAndRubrics = (assignmentId: string) => {
  const { setBoundingBoxes, setRubric } = useBoundingBoxStore();

  return useQuery({
    queryKey: ['boundingBoxesAndRubrics', assignmentId],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}?assignmentId=${assignmentId}`);
      setBoundingBoxes(response.data.boundingBoxes);
      setRubric(response.data.rubric);
      return response.data;
    },
    enabled: Boolean(assignmentId),
  });
};

// Add bounding box and rubric
export const useAddBoundingBoxAndRubric = (assignmentId: string) => {
  const queryClient = useQueryClient();
  const { addBoundingBox, setRubric } = useBoundingBoxStore();

  return useMutation<
    { boundingBox: BoundingBox; rubric: Rubric },
    Error,
    { boundingBox: Omit<BoundingBox, 'id'>; rubric: Omit<Rubric, 'id'> }
  >({
    mutationFn: async (data) => {
      const response = await axios.post(`${API_BASE_URL}?assignmentId=${assignmentId}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      addBoundingBox(data.boundingBox);
      setRubric(data.rubric);
      queryClient.invalidateQueries({ queryKey: ['boundingBoxesAndRubrics'] });
    },
  });
};

// Update bounding box and rubric
export const useUpdateBoundingBoxAndRubric = (assignmentId: string) => {
  const queryClient = useQueryClient();
  const { updateBoundingBox } = useBoundingBoxStore();

  return useMutation<
    { boundingBox: BoundingBox; rubric: Rubric },
    Error,
    {
      boundingBox: { id: string; updatedBox: Partial<Omit<BoundingBox, 'id'>> };
      rubric?: { id: string; updatedRubric: Partial<Rubric> }; // ทำให้ rubric เป็น optional
    }
  >({
    mutationFn: async (data) => {
      const response = await axios.put(`${API_BASE_URL}?assignmentId=${assignmentId}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      updateBoundingBox(data.boundingBox.id, data.boundingBox);
      queryClient.invalidateQueries({ queryKey: ['boundingBoxesAndRubrics'] });
    },
  });
};


// Remove bounding box and rubric
export const useRemoveBoundingBoxAndRubric = (assignmentId: string) => {
  const queryClient = useQueryClient();
  const { removeBoundingBox, clearRubric } = useBoundingBoxStore();

  return useMutation<
    { boundingBoxId: string; rubricId: string },
    Error,
    { boundingBoxId: string; rubricId: string }
  >({
    mutationFn: async (data) => {
      await axios.delete(`${API_BASE_URL}?assignmentId=${assignmentId}`, { data });
      return data;
    },
    onSuccess: (data) => {
      removeBoundingBox(data.boundingBoxId);
      clearRubric();
      queryClient.invalidateQueries({ queryKey: ['boundingBoxesAndRubrics'] });
    },
  });
};
