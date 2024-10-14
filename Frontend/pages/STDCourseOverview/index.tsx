import React from 'react';
import STD_LeftMain from '../../components/STD/STD_Leftmain'; // นำเข้า STD_LeftMain
import STD_Dashboard from '../../components/STD/STD_Dashboard'; // นำเข้า STD_Dashboard

const STDDashboard: React.FC = () => {

  return (
    <div className="flex min-h-screen bg-gray-50">
      <STD_LeftMain /> 
      <div className="flex-grow p-6">
        <h1 className="text-2xl font-bold mb-4"></h1>
        <STD_Dashboard /> 
      </div>
    </div>
  );
};

export default STDDashboard;
