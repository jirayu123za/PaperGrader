import React, { useState } from 'react';
import { useCourseStore } from '../../../store/useCourseStore';
import CreateAssignmentModal from '../../Create/CreateAssignment';
import ActiveAssignments from '../INDDashBoard/ActiveAssignment'; // นำเข้า ActiveAssignments
import { useFetchActiveAssignments } from '../../../hooks/useFetchActiveAssignment';

const INSDashBoard = () => {
  const selectedCourseId = useCourseStore((state) => state.selectedCourseId);
  const selectedCourse = useCourseStore((state) =>
    state.courses.find((course) => course.course_id === selectedCourseId)
  );

  const { isLoading, error, refetch } = useFetchActiveAssignments(selectedCourseId || '');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    refetch();
  };

  return (
    <div className="bg-white-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {selectedCourse ? `${selectedCourse.course_name} ${selectedCourse.semester}/${selectedCourse.academic_year}` : 'No Course Selected'}
        </h1>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div className="w-1/2">
          <h2 className="text-lg font-semibold mb-2">DESCRIPTION</h2>
          <p className="text-gray-700">{selectedCourse ? selectedCourse.course_description : 'No description available.'}</p>
        </div>
        <div className="w-1/2">
          <h2 className="text-lg font-semibold mb-2">THINGS TO DO</h2>
          <ul className="list-disc ml-6 text-gray-700">
            <li>Add students or staff to your course from the Roster page.</li>
            <li>Create your first assignment from the Assignments page.</li>
          </ul>
        </div>
      </div>

      {/* ใช้ ActiveAssignments component */}
      <ActiveAssignments
        selectedCourseId={selectedCourseId || ''}
        openModal={openModal}
        isLoading={isLoading}
        error={error}
      />

      <CreateAssignmentModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default INSDashBoard;
