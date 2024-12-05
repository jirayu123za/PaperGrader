import React from 'react';
import AssignmentSetting from '../components/Customize/AssignmentSetting'; // อัปเดต path ให้ตรงกับตำแหน่งของไฟล์ AssignmentSetting

const TestPage: React.FC = () => {
  return (
    <div>
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>Test Assignment Setting</h1>
      <AssignmentSetting />
    </div>
  );
};

export default TestPage;