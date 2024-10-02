import React, { useState } from 'react';
import { useCourseStore } from '../store/useCourseStore'; 
import CreateAssignmentModal from '../components/CreateAssignment'; 


const INSDashBoard = () => {
  const selectedCourseId = useCourseStore((state) => state.selectedCourseId); 
  const selectedCourse = useCourseStore((state) =>
    state.courses.find((course) => course.course_id === selectedCourseId)
  ); 

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* แสดงผลชื่อ course และ semester */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {selectedCourse ? `${selectedCourse.course_name} ${selectedCourse.semester}` : 'No Course Selected'}
          </h1>
        </div>
      </div>

      {/* Section สำหรับ DESCRIPTION และ THINGS TO DO */}
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

      {/* Section สำหรับ Active Assignments */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Active Assignments</h2>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-300"
            onClick={openModal}
          >
            Create Assignment
          </button>
        </div>
        <div className="text-gray-500">
          You currently have no assignments. Create an assignment to get started.
        </div>
      </div>

      {/* เรียกใช้ CreateAssignmentModal และกำหนด prop isOpen และ onClose */}
      <CreateAssignmentModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default INSDashBoard;
