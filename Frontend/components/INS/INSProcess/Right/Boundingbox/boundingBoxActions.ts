import { nanoid } from 'nanoid';
import useBoundingBoxStore from '@/store/BoundingBox/useBoundingBoxStore';
import { usePageMetaStore } from '@/store/BoundingBox/usePageMetaStore';


export function handleAddNameBoundingBox() {
  const { addBoundingBox } = useBoundingBoxStore.getState();
  const { currentPage } = usePageMetaStore.getState();
  addBoundingBox({
    bounding_box_id:`temp-${nanoid()}`,
    bounding_box_type: 'name',
    bounding_box_page: currentPage,
    point_x: 50,
    point_y: 100,
    width: 200,
    height: 50,
  });
}

export function handleAddIdBoundingBox() {
  const { addBoundingBox } = useBoundingBoxStore.getState();
  const { currentPage } = usePageMetaStore.getState();
  addBoundingBox({
    bounding_box_id:`temp-${nanoid()}`,
    bounding_box_type: 'id',
    bounding_box_page: currentPage,
    point_x: 50,
    point_y: 160,
    width: 200,
    height: 50,
  });
}

export function handleAddQuestionAndBoundingBox() {
  const { addBoundingBox, addQuestion } = useBoundingBoxStore.getState();
  const { currentPage } = usePageMetaStore.getState();

  const bounding_box_id = `temp-${nanoid()}`;
  const question_id     = `temp-${nanoid()}`;

  addBoundingBox({
    bounding_box_id,
    bounding_box_type: 'question',
    bounding_box_page: currentPage,
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

export function handleAddBoundingBox(bounding_box_id: string, type: 'question' | 'name' | 'id') {
  const { addBoundingBox } = useBoundingBoxStore.getState();
 const { currentPage } = usePageMetaStore.getState();
  addBoundingBox({
    bounding_box_id,
    bounding_box_type: type,
    bounding_box_page: currentPage,
    point_x: 100,
    point_y: 200,
    width: 300,
    height: 100,
  });
}
export function handleAddSubquestion(question: any) {
  const { updateQuestion, addBoundingBox } = useBoundingBoxStore.getState();
  const { currentPage } = usePageMetaStore.getState();
  const isFirst = !question.subquestions || question.subquestions.length === 0;

  if (isFirst) {

    if (question.bounding_box_id) {
      const firstSubId = `temp-${nanoid()}`;
      updateQuestion(question.question_id, {
        bounding_box_id: undefined, 
        subquestions: [
          {
            subquestion_id: firstSubId,
            subquestion_title: 'New Subquestion',
            subquestion_point: 0,
            bounding_box_id: question.bounding_box_id,
          },
        ],
      });
    } else {

      const bboxId = `temp-${nanoid()}`;
      addBoundingBox({
        bounding_box_id: bboxId,
        bounding_box_type: 'question',
        bounding_box_page: currentPage,
        point_x: 100,
        point_y: 200,
        width: 300,
        height: 100,
      });
      const firstSubId = `temp-${nanoid()}`;
      updateQuestion(question.question_id, {
        subquestions: [
          {
            subquestion_id: firstSubId,
            subquestion_title: 'New Subquestion',
            subquestion_point: 0,
            bounding_box_id: bboxId,
          },
        ],
      });
    }
  } else {

    const bboxId = `temp-${nanoid()}`;
    addBoundingBox({
      bounding_box_id: bboxId,
      bounding_box_type: 'question',
      bounding_box_page: currentPage,
      point_x: 100,
      point_y: 200,
      width: 300,
      height: 100,
    });
    const newSubId = `temp-${nanoid()}`;
    updateQuestion(question.question_id, {
      subquestions: [
        ...(question.subquestions ?? []),
        {
          subquestion_id: newSubId,
          subquestion_title: 'New Subquestion',
          subquestion_point: 0,
          bounding_box_id: bboxId,
        },
      ],
    });
  }
}


export function handleSubChange(question: any,subIdx: number,field: string,value: any) {
  const { updateQuestion } = useBoundingBoxStore.getState();
  const newSubs = [...(question.subquestions || [])];                                  

  newSubs[subIdx] = { ...newSubs[subIdx], [field]: value };                             


  const newTotal = newSubs.reduce(
    (sum, s) => sum + Number(s.subquestion_point),
    0
  );


  updateQuestion(question.question_id, {
    subquestions: newSubs,
    question_point: newTotal,
  });
}


export function handleSubDelete(question: any, subIdx: number) {
  const { updateQuestion, removeBoundingBox } = useBoundingBoxStore.getState();
  const subToRemove = question.subquestions[subIdx];

  if (question.subquestions.length === 1) {
    updateQuestion(question.question_id, {
      bounding_box_id: subToRemove.bounding_box_id,
      subquestions: [],
    });
  } else {
    if (subToRemove?.bounding_box_id) {
      removeBoundingBox(subToRemove.bounding_box_id);
    }
    const newSubs = question.subquestions.filter((_: any, idx: number) => idx !== subIdx);
    updateQuestion(question.question_id, { subquestions: newSubs });
  }
}



export function handleToggleFixedBox(type: 'name' | 'id') {
  const { boundingBoxes, addBoundingBox, removeBoundingBox } = useBoundingBoxStore.getState();
  const { currentPage } = usePageMetaStore.getState();

  const existing = (boundingBoxes ?? []).filter((b: any) => b.bounding_box_type === type);

  if (existing.length > 0) {
    existing.forEach((b: any) => {
      if (b?.bounding_box_id) removeBoundingBox(b.bounding_box_id);
    });
    return;
  }


  const bboxId = `temp-${nanoid()}`;
  const defaults = type === 'name'
    ? { point_x: 50,  point_y: 100, width: 200, height: 50 }
    : { point_x: 300, point_y: 100, width: 200, height: 50 };

  addBoundingBox({
    bounding_box_id: bboxId,
    bounding_box_type: type,
    bounding_box_page: currentPage,
    ...defaults,
  });
}

export function handleToggleNameBoundingBox() {
  return handleToggleFixedBox('name');
}

export function handleToggleIdBoundingBox() {
  return handleToggleFixedBox('id');
}
