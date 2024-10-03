import React from 'react';
import LeftMain from '../../../components/LeftMain';
import CourseRoster from '../../../components/CourseRoster';
import { useRouter } from 'next/router';
import { useCourseStore } from '../../../store/useCourseStore';


const ManageRoster: React.FC = () => {
  const router = useRouter();
  const { courseId } = router.query; 
  const selectedCourseId = useCourseStore((state) => state.selectedCourseId);

  const actualCourseId = Array.isArray(courseId) ? courseId[0] : courseId || selectedCourseId;

  if (!actualCourseId) {
    return <div>Please select a course first!</div>; 
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50"> 
    <LeftMain courseId={actualCourseId} /> 
    <div className="flex-grow p-6">
      <h1 className="text-2xl font-bold mb-4">Roster</h1>
      <CourseRoster /> 
    </div>
  </div>
  );
};

export default ManageRoster;
