'use client';

import { Button, NumberInput, TextInput, ActionIcon, Table, ScrollArea, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FaTrash, FaPlus } from 'react-icons/fa';
import useBoundingBoxStore from '@/store/BoundingBox/useBoundingBoxStore';
import { nanoid } from 'nanoid';
import {
  handleAddNameBoundingBox,
  handleAddIdBoundingBox,
  handleAddQuestionAndBoundingBox,
  handleAddBoundingBox,
  handleAddSubquestion,
  handleSubChange,
  handleSubDelete,
} from '@/components/INS/INSProcess/Right/Boundingbox/boundingBoxActions';
import {
  useUpsertBoundingBoxesAndQuestions,
  mapRubricToQuestionsData,
  useFetchTemplate,
} from '@/hooks/BoundingBox/useFetchBoundingBox';
import { useBatchDeletePairs, mapRubricToQuestionsDataDelta, mapBoundingBoxesToApiFormatNewOnly } from '@/hooks/BoundingBox/useFetchBoundingBox';
import { mapBoundingBoxesToApiFormat } from '@/hooks/BoundingBox/useFetchBoundingBox';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import React from 'react';

export default function QuestionOutline() {
  const params = useParams();
  const assignment_id = params.assignment_id as string;
  const { rubricData, boundingBoxes, updateQuestion, removeQuestion, pendingDeletes, markForDelete, clearPendingDeletes} = useBoundingBoxStore();
  const { mutateAsync: upsertAll, isPending: isUpserting } = useUpsertBoundingBoxesAndQuestions(assignment_id);
const { mutateAsync: batchDelete } = useBatchDeletePairs(assignment_id);

  const { data: template, isFetching: isFetchingTemplate, refetch: refetchTemplate } = useFetchTemplate(assignment_id);
  const [isSaving, setIsSaving] = React.useState(false);

  
const calculateTotalPoints = () =>
    rubricData.questions.reduce((acc, q) => acc + q.question_point, 0);




 
  const queueDeleteQuestion = (q: any) => {
    if (q?.bounding_box_id) {
      markForDelete({ bounding_box_id: q.bounding_box_id, question_id: q.question_id ?? null });
    }
    removeQuestion(q.question_id);
  };


 
  const templateQs = (template as any)?.questions_data ?? [];
  const templateBbs = (template as any)?.bounding_boxes ?? [];

  const tQMap = React.useMemo(() => {
    const m = new Map<string, any>();
    templateQs.forEach((q: any) => m.set(q.question_id, q));
    return m;
  }, [templateQs]);

  const tSubMap = React.useMemo(() => {
    const m = new Map<string, any>();
    templateQs.forEach((q: any) => {
      (q.sub_questions ?? []).forEach((s: any) => m.set(s.sub_question_id, { ...s, __parent: q.question_id }));
    });
    return m;
  }, [templateQs]);

  const tBbMap = React.useMemo(() => {
    const m = new Map<string, any>();
    templateBbs.forEach((b: any) => m.set(b.bounding_box_id, b));
    return m;
  }, [templateBbs]);

  const hasEdits = React.useMemo(() => {

    for (const q of rubricData.questions) {
      const isRealQ = q.question_id && !String(q.question_id).startsWith('temp-');
      if (isRealQ) {
        const tq = tQMap.get(q.question_id);
        if (tq) {
          if ((tq.question_title ?? '') !== (q.question_title ?? '')) return true;
          if (Number(tq.question_point ?? 0) !== Number(q.question_point ?? 0)) return true;
          const tQbbox = tq.bounding_box_id ?? '';
          const cQbbox = q.bounding_box_id ?? '';
          if (tQbbox !== cQbbox) return true; 
        }
      }
      for (const s of (q.subquestions ?? [])) {
        const isRealS = s.subquestion_id && !String(s.subquestion_id).startsWith('temp-');
        if (isRealS) {
          const ts = tSubMap.get(s.subquestion_id);
          if (ts) {
            if ((ts.sub_question_title ?? '') !== (s.subquestion_title ?? '')) return true;
            if (Number(ts.sub_question_point ?? 0) !== Number(s.subquestion_point ?? 0)) return true;
            const tSbbox = ts.bounding_box_id ?? '';
            const cSbbox = s.bounding_box_id ?? '';
            if (tSbbox != cSbbox) return true; 
          }
        }
      }
    }
  
    for (const b of (boundingBoxes ?? [])) {
      const isRealB = b.bounding_box_id && !String(b.bounding_box_id).startsWith('temp-');
      if (!isRealB) continue;
      const tb = tBbMap.get(b.bounding_box_id);
      if (!tb) continue;
      const diff = (
        Number(tb.bounding_box_page ?? 0) !== Number(b.bounding_box_page ?? 0) ||
        Number((tb.bounding_box_point_x ?? tb.point_x) ?? 0) !== Number(b.point_x ?? 0) ||
        Number((tb.bounding_box_point_y ?? tb.point_y) ?? 0) !== Number(b.point_y ?? 0) ||
        Number((tb.bounding_box_width ?? tb.width) ?? 0) !== Number(b.width ?? 0) ||
        Number((tb.bounding_box_height ?? tb.height) ?? 0) !== Number(b.height ?? 0)
      );
      if (diff) return true;
    }
    return false;
  }, [rubricData, boundingBoxes, tQMap, tSubMap, tBbMap]);

  const SEND_ONLY_NEW_COMPUTED = !hasEdits;


  const countNewItems = (rubric: any) => {
    let newQuestions = 0;
    let newSubs = 0;
    (rubric.questions ?? []).forEach((q: any) => {
      const isNewQ = !q.question_id || String(q.question_id).startsWith('temp-');
      if (isNewQ) newQuestions += 1;
      (q.subquestions ?? []).forEach((s: any) => {
        const isNewS = !s.subquestion_id || String(s.subquestion_id).startsWith('temp-');
        if (isNewS) newSubs += 1;
      });
    });
    return { newQuestions, newSubs };
  };

  const countTitlePointUpdates = (rubric: any, tmpl: any) => {
    const tQ = new Map<string, any>();
    const tS = new Map<string, any>();
    (tmpl?.questions_data ?? []).forEach((q: any) => {
      tQ.set(q.question_id, q);
      (q.sub_questions ?? []).forEach((s: any) => tS.set(s.sub_question_id, s));
    });
    let updated = 0;
    (rubric.questions ?? []).forEach((q: any) => {
      const isRealQ = q.question_id && !String(q.question_id).startsWith('temp-');
      if (isRealQ) {
        const tq = tQ.get(q.question_id);
        if (tq) {
          if ((tq.question_title ?? '') !== (q.question_title ?? '')) updated += 1;
          if (Number(tq.question_point ?? 0) !== Number(q.question_point ?? 0)) updated += 1;
        }
      }
      (q.subquestions ?? []).forEach((s: any) => {
        const isRealS = s.subquestion_id && !String(s.subquestion_id).startsWith('temp-');
        if (isRealS) {
          const ts = tS.get(s.subquestion_id);
          if (ts) {
            if ((ts.sub_question_title ?? '') !== (s.subquestion_title ?? '')) updated += 1;
            if (Number(ts.sub_question_point ?? 0) !== Number(s.subquestion_point ?? 0)) updated += 1;
          }
        }
      });
    });
    return updated;
  };

const handleSave = async () => {
  if (isSaving || isUpserting || isFetchingTemplate) return;
  setIsSaving(true);
  let saveOk = false;
  let didCreate = false;
  let deleteCount = pendingDeletes?.length ?? 0;
  try {
    const { newQuestions, newSubs } = countNewItems(rubricData);
    const updatesCount = countTitlePointUpdates(rubricData, template);

    const usedIds = new Set<string>();
    rubricData.questions.forEach((qq: any) => {
      if (qq.bounding_box_id) usedIds.add(qq.bounding_box_id);
      (qq.subquestions ?? []).forEach((s: any) => {
        if (s.bounding_box_id) usedIds.add(s.bounding_box_id);
      });
    });

    const deltaPayload = {
      bounding_boxes: mapBoundingBoxesToApiFormatNewOnly(boundingBoxes, usedIds),
      questions_data: mapRubricToQuestionsDataDelta(rubricData),
    };
    const isDeltaEmpty = (!deltaPayload.bounding_boxes?.length) && (!deltaPayload.questions_data?.length);

    const filteredBoxes = boundingBoxes.filter((b: any) => {
      if (b.bounding_box_type === 'question') {
        return usedIds.has(b.bounding_box_id);
      }
      return true;
    });
    const fullPayload = {
      bounding_boxes: mapBoundingBoxesToApiFormat(filteredBoxes, true),
      questions_data: mapRubricToQuestionsData(rubricData, true),
    };

    const payload = isDeltaEmpty ? fullPayload : deltaPayload;
    didCreate = !isDeltaEmpty;

    console.log('UPsert payload (auto mode):', JSON.stringify(payload, null, 2));
    await upsertAll(payload);
    saveOk = true;

    if (didCreate) {
      notifications.show({
        title: 'Created successfully',
        message: `Created ${newQuestions + newSubs} item(s)`,
        color: 'green',
      });
    } else {
      notifications.show({
        title: 'Updated successfully',
        message: updatesCount > 0 ? `Updated ${updatesCount} field(s)` : 'Already up to date',
        color: 'green',
      });
    }

    await refetchTemplate();

    if (pendingDeletes && pendingDeletes.length > 0) {
      try {
        await batchDelete(pendingDeletes);
        notifications.show({
          title: 'Deleted successfully',
          message: `Deleted ${deleteCount} item(s)`,
          color: 'green',
        });
        clearPendingDeletes();
      } catch (err: any) {
        notifications.show({
          title: 'Delete failed',
          message: String(err?.message ?? err),
          color: 'red',
        });
      }
    }
  } catch (error: any) {
    notifications.show({
      title: 'Save failed',
      message: String(error?.message ?? error),
      color: 'red',
    });
  } finally {
    setIsSaving(false);
  }
};


  return (
    <div className="p-6 space-y-6 rounded-md max-h-[86vh] overflow-y-auto">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Outline for Test</h1>
        <p className="text-gray-600">{calculateTotalPoints()} points total</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddNameBoundingBox}>
            Student Name
          </Button>
          <Button variant="outline" onClick={handleAddIdBoundingBox}>
            Student ID
          </Button>
        </div>
      </div>

      <ScrollArea>
        <Table highlightOnHover style={{ border: 'none' }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th></Table.Th>
              <Table.Th>Title</Table.Th>
              <Table.Th>Points</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rubricData.questions.map((question, index) => (
              <React.Fragment key={question.question_id}>
                <Table.Tr>
                  <Table.Td>{index + 1}</Table.Td>
                  <Table.Td>
                    <TextInput
                      value={question.question_title}
                      onChange={(e) =>
                        updateQuestion(question.question_id, {
                          question_title: e.currentTarget.value,
                        })
                      }
                    />
                  </Table.Td>
                  <Table.Td>
                    <NumberInput
                      value={question.question_point}
                      onChange={(val) =>
                        updateQuestion(question.question_id, {
                          question_point: typeof val === 'number' ? val : 0,
                        })
                      }
                      min={0}
                      disabled={!!question.subquestions?.length}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <ActionIcon
                        color="blue"
                        variant="light"
                        onClick={() => handleAddSubquestion(question)}
                      >
                        <FaPlus size={16} />
                      </ActionIcon>
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => queueDeleteQuestion(question)}
                      >
                        <FaTrash size={16} />
                      </ActionIcon>
                    </Box>
                  </Table.Td>
                </Table.Tr>

                {question.subquestions?.map((sub, idx) => (
                  <Table.Tr key={sub.subquestion_id} style={{ background: '#f9f9f9' }}>
                    <Table.Td>{`${index + 1}.${idx + 1}`}</Table.Td>
                    <Table.Td>
                      <TextInput
                        value={sub.subquestion_title}
                        onChange={(e) =>
                          handleSubChange(
                            question,
                            idx,
                            'subquestion_title',
                            e.currentTarget.value
                          )
                        }
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={sub.subquestion_point}
                        onChange={(val) =>
                          handleSubChange(question, idx, 'subquestion_point', Number(val))
                        }
                        min={0}
                        max={question.question_point}
                      />
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => handleSubDelete(question, idx)}
                      >
                        <FaTrash size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </React.Fragment>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <div className="flex justify-between mt-4">
        <Button variant="subtle" color="blue" onClick={handleAddQuestionAndBoundingBox}>
          + New Question
        </Button>
        <Button color="teal" onClick={handleSave} disabled={isSaving || isUpserting || isFetchingTemplate}>{(isSaving || isUpserting || isFetchingTemplate) ? "Saving..." : "Save"}</Button>
      </div>
    </div>
  );
}
