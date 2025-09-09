import { nanoid } from 'nanoid';
import useBoundingBoxStore from '@/store/BoundingBox/useBoundingBoxStore';
import { usePageMetaStore } from '@/store/BoundingBox/usePageMetaStore';


const tempId = () => `temp-${nanoid()}`;


const BOX_SIZE = {
  name:     { width: 200, height: 50  },
  id:       { width: 200, height: 50 },
  question: { width: 300, height: 100 },
} as const;


function makeBox(
  type: 'name' | 'id' | 'question',
  page: number,
  overrides?: Partial<{ point_x: number; point_y: number; width: number; height: number }>
) {
  const size = BOX_SIZE[type];
  return {
    bounding_box_id: tempId(),
    bounding_box_type: type,
    bounding_box_page: page,
    point_x: 50,
    point_y: 100,
    width: size.width,
    height: size.height,
    ...overrides,
  };
}


export function handleAddNameBoundingBox() {
  const { addBoundingBox } = useBoundingBoxStore.getState();
  const { currentPage } = usePageMetaStore.getState();
  addBoundingBox(makeBox('name', currentPage));
}


export function handleAddIdBoundingBox() {
  const { addBoundingBox } = useBoundingBoxStore.getState();
  const { currentPage } = usePageMetaStore.getState();
  addBoundingBox(makeBox('id', currentPage));
}


export function handleAddQuestionAndBoundingBox() {
  const { addQuestion, addBoundingBox } = useBoundingBoxStore.getState();
  const { currentPage } = usePageMetaStore.getState();

  const bbox = makeBox('question', currentPage);
  addBoundingBox(bbox);

  const qId = tempId();
  addQuestion({
    question_id: qId,
    question_title: '',
    question_point: 0,
    bounding_box_id: bbox.bounding_box_id,
    subquestions: [],
  });
}


export function handleAddBoundingBox(questionId?: string) {
  const { addBoundingBox, updateQuestion } = useBoundingBoxStore.getState();
  const { currentPage } = usePageMetaStore.getState();

  const bbox = makeBox('question', currentPage);
  addBoundingBox(bbox);

  if (questionId) {
    updateQuestion(questionId, { bounding_box_id: bbox.bounding_box_id });
  }
}


export function handleAddSubquestion(question: any) {
  const { updateQuestion, addBoundingBox } = useBoundingBoxStore.getState();
  const { currentPage } = usePageMetaStore.getState();

  const currentSubs = Array.isArray(question.subquestions) ? [...question.subquestions] : [];

  const newSub = {
    subquestion_id: tempId(),
    subquestion_title: '',
    subquestion_point: 0,
    bounding_box_id: undefined as string | undefined,
  };

  if (currentSubs.length === 0 && question.bounding_box_id) {
    newSub.bounding_box_id = question.bounding_box_id;
    currentSubs.push(newSub);
    updateQuestion(question.question_id, {
      subquestions: currentSubs,
      bounding_box_id: undefined, 
    });
  } else {

    const bbox = makeBox('question', currentPage);
    addBoundingBox(bbox);
    newSub.bounding_box_id = bbox.bounding_box_id;
    currentSubs.push(newSub);
    updateQuestion(question.question_id, { subquestions: currentSubs });
  }
}

export function handleSubChange(
  question: any,
  subIdx: number,
  field: 'subquestion_title' | 'subquestion_point',
  value: any
) {
  const { updateQuestion } = useBoundingBoxStore.getState();
  const subs = Array.isArray(question.subquestions) ? [...question.subquestions] : [];
  const target = subs[subIdx];
  if (!target) return;

  subs[subIdx] = {
    ...target,
    [field]: field === 'subquestion_point' ? Number(value ?? 0) : value,
  };

  updateQuestion(question.question_id, { subquestions: subs });
}


export function handleSubDelete(question: any, subIdx: number) {
  const {
    updateQuestion,
    removeBoundingBox,
    markForDeleteBBox,
  } = useBoundingBoxStore.getState();

  const subs = Array.isArray(question.subquestions) ? [...question.subquestions] : [];
  const target = subs[subIdx];
  if (!target) return;

  if (subs.length === 1) {

    updateQuestion(question.question_id, {
      bounding_box_id: target.bounding_box_id ?? undefined,
      subquestions: [],
    });
    return;
  }


  if (target.bounding_box_id) {
    const id = String(target.bounding_box_id);
    if (!id.startsWith('temp-')) {
      markForDeleteBBox(id);
    }
    removeBoundingBox(id);
  }

  const newSubs = subs.filter((_: any, i: number) => i !== subIdx);
  updateQuestion(question.question_id, { subquestions: newSubs });
}


function handleToggleFixedBox(type: 'name' | 'id') {
  const {
    boundingBoxes,
    addBoundingBox,
    removeBoundingBox,
    markForDeleteBBox,
  } = useBoundingBoxStore.getState();
  const { currentPage } = usePageMetaStore.getState();

  const existing = (boundingBoxes ?? []).filter((b: any) => b.bounding_box_type === type);
  if (existing.length > 0) {
    existing.forEach((b: any) => {
      const id = String(b?.bounding_box_id ?? '');
      if (!id) return;
      if (!id.startsWith('temp-')) {
        markForDeleteBBox(id);
      }
      removeBoundingBox(id);
    });
    return;
  }


  addBoundingBox(makeBox(type, currentPage));
}

export function handleToggleNameBoundingBox() {
  return handleToggleFixedBox('name');
}

export function handleToggleIdBoundingBox() {
  return handleToggleFixedBox('id');
}
