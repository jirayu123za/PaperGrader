'use client';

import { Button, NumberInput, TextInput, ActionIcon } from '@mantine/core';
import { FaTrash, FaPlus } from 'react-icons/fa';
import useBoundingBoxStore from '@/store/BoundingBox/useBoundingBoxStore';
import { nanoid } from 'nanoid';
import { handleAddNameBoundingBox, handleAddIdBoundingBox, handleAddQuestionAndBoundingBox } from '@/components/INS/INSProcess/Right/Boundingbox/boundingBoxActions';

export default function QuestionOutline() {
    const { rubricData, addQuestion, updateQuestion, removeQuestion } = useBoundingBoxStore();
    const { addBoundingBox } = useBoundingBoxStore();
    return (
        <div className="p-6 space-y-6 bg-gray-50 rounded-md"
        style={{height: '100vh', overflowY: 'auto',}}>
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">Outline for Test</h1>
                <p className="text-gray-600">{calculateTotalPoints(rubricData)} points total</p>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleAddNameBoundingBox}>Student Name </Button>
                    <Button variant="outline" onClick={handleAddIdBoundingBox}> Student ID </Button>
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-md overflow-hidden bg-white">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-gray-100 p-2 font-semibold text-gray-700">
                    <div className="col-span-1">#</div>
                    <div className="col-span-7">Title</div>
                    <div className="col-span-2">Points</div>
                    <div className="col-span-2 text-center">Actions</div>
                </div>

                {rubricData.questions.map((q, index) => (
                    <QuestionItem key={q.question_id} question={q} index={index} />
                ))}

                {/* Add new question */}
                <div className="p-2">
                    <Button variant="subtle" color="blue" onClick={handleAddQuestionAndBoundingBox}>
                        + New Question
                    </Button>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
                <Button variant="outline" color="gray">Cancel</Button>
                <Button color="teal">Save </Button>
            </div>
        </div>
    );
}

function calculateTotalPoints(rubricData: any) {
    return rubricData.questions.reduce((acc: number, q: any) => {
        const subPoints = q.subquestions?.reduce((a: number, s: any) => a + s.subquestion_point, 0) || 0;
        return acc + q.question_point + subPoints;
    }, 0);
}

function QuestionItem({ question, index }: { question: any; index: number }) {
    const { updateQuestion, removeQuestion } = useBoundingBoxStore();

    const displayIndex = `${index + 1}`;

    const handleAddSubquestion = () => {
        const newSubquestions = [...(question.subquestions || [])];
        newSubquestions.push({
            bounding_box_id: '',
            subquestion_id: nanoid(),
            subquestion_point: 1,
            subquestion_title: 'New Subquestion',
        });
        updateQuestion(question.question_id, { subquestions: newSubquestions });
    };

    const handleSubChange = (subIdx: number, field: string, value: any) => {
        const newSubs = [...(question.subquestions || [])];
        newSubs[subIdx] = { ...newSubs[subIdx], [field]: value };
        updateQuestion(question.question_id, { subquestions: newSubs });
    };

    const handleSubDelete = (subIdx: number) => {
        const newSubs = question.subquestions?.filter((_: any, idx: number) => idx !== subIdx) || [];
        updateQuestion(question.question_id, { subquestions: newSubs });
    };
    return (
        <>
            {/* Main Question */}
            <div className="grid grid-cols-12 p-2 border-t items-center">
                <div className="col-span-1 text-right">{displayIndex}</div>
                <div className="col-span-7">
                    <TextInput
                        value={question.question_title}
                        onChange={(e) => updateQuestion(question.question_id, { question_title: e.currentTarget.value })}
                        placeholder="Question Title"
                        variant="unstyled"
                        classNames={{ input: "px-2" }}
                    />
                </div>
                <div className="col-span-2">
                    <NumberInput
                        value={question.question_point}
                        onChange={(val) => {
                            const parsed = typeof val === 'number' ? val : Number(val);
                            if (!isNaN(parsed)) {
                                updateQuestion(question.question_id, { question_point: parsed });
                            }
                        }}
                        placeholder="Points"
                        variant="unstyled"
                        classNames={{ input: "px-2" }}
                        min={0}
                    />
                </div>
                <div className="col-span-2 flex justify-center gap-2">
                    <ActionIcon color="blue" variant="light" onClick={handleAddSubquestion}>
                        <FaPlus size={16} />
                    </ActionIcon>
                    <ActionIcon color="red" variant="light" onClick={() => removeQuestion(question.question_id)}>
                        <FaTrash size={16} />
                    </ActionIcon>
                </div>
            </div>

            {/* Subquestions */}
            {question.subquestions?.map((sub: any, idx: number) => (
                <div key={idx} className="grid grid-cols-12 p-2 border-t items-center ml-8">
                    <div className="col-span-1 text-right">{`${displayIndex}.${idx + 1}`}</div>
                    <div className="col-span-7">
                        <TextInput
                            value={sub.subquestion_title}
                            onChange={(e) => handleSubChange(idx, 'subquestion_title', e.currentTarget.value)}
                            placeholder="Subquestion Title"
                            variant="unstyled"
                            classNames={{ input: "px-2" }}
                        />
                    </div>
                    <div className="col-span-2">
                        <NumberInput
                            value={sub.subquestion_point}
                            onChange={(val) => handleSubChange(idx, 'subquestion_point', Number(val))}
                            placeholder="Points"
                            variant="unstyled"
                            classNames={{ input: "px-2" }}
                            min={0}
                        />
                    </div>
                    <div className="col-span-2 flex justify-center">
                        <ActionIcon color="red" variant="light" onClick={() => handleSubDelete(idx)}>
                            <FaTrash size={16} />
                        </ActionIcon>
                    </div>
                </div>
            ))}
        </>
    );
}
