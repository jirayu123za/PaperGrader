// hooks/useFetchGradebox.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useGradeboxStore } from '@/store/BoundingBox/useGradeboxStore';
import { API_BASE, api, qf } from '@/src/lib/api';

export interface BoundingBox {
  bounding_box_id: string;
  bounding_box_page: number;
  point_x: number;
  point_y: number;
  width: number;
  height: number;
  question_id: string;
  sub_question_id?: string;
}

/**
 * Hook to fetch grade bounding boxes for a given assignment,
 * and automatically save into Zustand store.
 * Similar pattern as useFetchRubric.
 */
export const useFetchGradebox = (assignmentId: string) => {
  const setBoundingBoxes = useGradeboxStore((state) => state.setBoundingBoxes);

  return useQuery<BoundingBox[], Error>({
    queryKey: ['gradeboxes', assignmentId] as const,
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/instructor/boundingBoxes/data`, {
        params: { assignment_id: assignmentId },
      });
      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }
      const boxes: BoundingBox[] = response.data.bounding_boxes_data;
      setBoundingBoxes(boxes);
      return boxes;
    },
    enabled: Boolean(assignmentId),
    refetchOnWindowFocus: false,
  });
};

