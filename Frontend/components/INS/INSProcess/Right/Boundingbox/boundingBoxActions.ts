

import { nanoid } from 'nanoid';
import useBoundingBoxStore from '@/store/BoundingBox/useBoundingBoxStore';

export const handleAddNameBoundingBox = () => {
  const { addBoundingBox } = useBoundingBoxStore.getState();
  addBoundingBox({
    bounding_box_id: nanoid(),
    bounding_box_position: '100,100,200,50',
    bounding_box_type: 'name',
    bounding_box_page: 1,
  });
};

export const handleAddIdBoundingBox = () => {
  const { addBoundingBox } = useBoundingBoxStore.getState();
  addBoundingBox({
    bounding_box_id: nanoid(),
    bounding_box_position: '100,200,200,50',
    bounding_box_type: 'id',
    bounding_box_page: 1,
  });
};

export const handleAddQuestionAndBoundingBox = () => {
  const { addBoundingBox, addQuestion } = useBoundingBoxStore.getState();
  const newQuestionId = nanoid();

  addQuestion({
    question_id: newQuestionId,
    question_point: 1,
    question_title: 'New Question',
    subquestions: [],
  });

  addBoundingBox({
    bounding_box_id: nanoid(),
    bounding_box_position: '100,300,200,50',
    bounding_box_type: 'question',
    bounding_box_page: 1,
  });
};
