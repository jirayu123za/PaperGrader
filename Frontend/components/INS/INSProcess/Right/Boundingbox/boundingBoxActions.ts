

import { nanoid } from 'nanoid';
import useBoundingBoxStore from '@/store/BoundingBox/useBoundingBoxStore';

export function handleAddNameBoundingBox() {
  const { boundingBoxes, addBoundingBox } = useBoundingBoxStore.getState();
  const hasName = boundingBoxes.some(b => b.bounding_box_type === 'name');
  if (hasName) return;
  addBoundingBox({
    bounding_box_id: nanoid(),
    bounding_box_position: '100,100,200,50',
    bounding_box_type: 'name',
    bounding_box_page: 1,
  });
};

export function handleAddIdBoundingBox() {
  const { boundingBoxes, addBoundingBox } = useBoundingBoxStore.getState();
  const hasId = boundingBoxes.some(b => b.bounding_box_type === 'id');
  if (hasId) return;
  addBoundingBox({
    bounding_box_id: nanoid(),
    bounding_box_position: '100,200,200,50',
    bounding_box_type: 'id',
    bounding_box_page: 1,
  });
};

export function handleAddQuestionAndBoundingBox() {
  const {
    addBoundingBox,
    addQuestion,
  } = useBoundingBoxStore.getState();

  const boundingBoxId = nanoid(); 


  addBoundingBox({
    bounding_box_id: boundingBoxId,
    bounding_box_type: 'question',
    bounding_box_position: '100,100,150,100',
    bounding_box_page: 0
  });


  addQuestion({
    question_id: nanoid(),
    bounding_box_id: boundingBoxId, 
    question_title: 'New Question',
    question_point: 0,
    subquestions: [],
  });
}
