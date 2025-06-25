import { nanoid } from 'nanoid';
import useBoundingBoxStore from '@/store/BoundingBox/useBoundingBoxStore';

export function handleAddNameBoundingBox() {
  const { addBoundingBox } = useBoundingBoxStore.getState();
  addBoundingBox({
    bounding_box_id: nanoid(),
    bounding_box_type: 'name',
    bounding_box_page: 1,
    point_x: 50,
    point_y: 100,
    width: 200,
    height: 50,
  });
}

export function handleAddIdBoundingBox() {
  const { addBoundingBox } = useBoundingBoxStore.getState();
  addBoundingBox({
    bounding_box_id: nanoid(),
    bounding_box_type: 'id',
    bounding_box_page: 1,
    point_x: 50,
    point_y: 160,
    width: 200,
    height: 50,
  });
}

export function handleAddQuestionAndBoundingBox() {
  const { addBoundingBox, addQuestion } = useBoundingBoxStore.getState();
  const bounding_box_id = nanoid();
  const question_id = nanoid();

  addBoundingBox({
    bounding_box_id,
    bounding_box_type: 'question',
    bounding_box_page: 1,
    point_x: 100,
    point_y: 200,
    width: 300,
    height: 100,
  });

  addQuestion({
    question_id,
    bounding_box_id,
    question_title: 'New Question',
    question_point: 0,
    subquestions: [],
  });
}