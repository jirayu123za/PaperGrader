import React from 'react';
import { useRouter } from 'next/router';
import { useCourseStore } from '../../../store/useCourseStore'; 
import INTAssignment from '../../../components/INSAssignment'; 
import LeftMain from '../../../components/LeftMain'; 

const Assignment = () => {
  const router = useRouter();
  const { courseId } = router.query; 
  const selectedCourseId = useCourseStore((state) => state.selectedCourseId);

  const actualCourseId = Array.isArray(courseId) ? courseId[0] : courseId || selectedCourseId;

  if (!actualCourseId) {
    return <div>Please select a course first!</div>; 
  }

  return (
    <div className="flex min-h-screen bg-gray-50"> 
      <LeftMain /> 
      <div className="flex-grow p-6">
        <h1 className="text-2xl font-bold mb-4">Assignment Page</h1>
        <INTAssignment courseId={actualCourseId} /> 
      </div>
    </div>
  );
};

export default Assignment;
