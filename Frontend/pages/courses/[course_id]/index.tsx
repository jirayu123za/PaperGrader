import React from 'react';
import LeftMain from '../../../components/LeftINS/LeftMain';
import INTDashBoard from '../../../components/INS/INDDashBoard/INSDashBoard';

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <LeftMain/>
      <div className="flex-grow p-6">
        <INTDashBoard/>
      </div>
    </div>
  );
};

export default Dashboard;
