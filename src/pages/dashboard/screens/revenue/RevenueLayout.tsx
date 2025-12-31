import React, { useState } from 'react';
import RevenueGrowthChart from "../dashboardScreen/RevenueGrowthChart";
import RevenueMetrics from "./RevenueMetric";
import OperatorPayoutTable from './OperatorPayoutTable';
import StakeholderPayoutTable from './StakeholderPayoutTable';
import RemittedRevenueTable from './RemittedRevenueTable';
import RevenuePerOperatorsTable from './RevenuePerOperatorsTable';



const RevenueLayout: React.FC = () => {
  const [activeView, setActiveView] = useState('overview');


  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  
  return (
    <div className="container mx-auto p-6">
      <div className="text-sm py-3 px-2 rounded-lg mb-3 bg-[#fff">
        <button
          className={`px-6 py-2 text-xs cursor-pointer rounded-bl-md rounded-tl-md  border border-[#F2F4F7] ${activeView === 'overview' ? 'bg-[#E86229] text-[#fff]' : 'text-[#667085]'}`}
          onClick={() => handleViewChange('overview')}
        >
          Overview
        </button>
        <button
          className={`px-6 py-2 text-xs cursor-pointer border border-[#F2F4F7] ${activeView === 'remitted' ? 'bg-[#E86229] text-[#fff]' : 'text-[#667085]'}`}
          onClick={() => handleViewChange('remitted')}
        >
          Remitted revenue
        </button>
        
            
          <button
          className={`px-6 py-2 text-xs cursor-pointer  border border-[#F2F4F7] ${activeView === 'stakeholder' ? 'bg-[#E86229] text-[#fff]' : 'text-[#667085]'}`}
          onClick={() => handleViewChange('stakeholder')}
          >
              Stakeholder payouts
          </button>
       
        <button
          className={`px-6 py-2 text-xs cursor-pointer border rounded-br-md rounded-tr-md border-[#F2F4F7] ${activeView === 'operator' ? 'bg-[#E86229] text-[#fff]' : 'text-[#667085]'}`}
          onClick={() => handleViewChange('operator')}
        >
          Operator payout
        </button>
      </div>

      {
        activeView === 'overview' && (
          <>
            <RevenueMetrics />
            <RevenueGrowthChart />
            <RevenuePerOperatorsTable />
          </>
        )
      }
      {
        activeView === 'remitted' && (
          <RemittedRevenueTable />
        )
      }
      {
        activeView === 'stakeholder' && (
          <StakeholderPayoutTable />
        )
      }
      {
        activeView === 'operator' && (
          <OperatorPayoutTable />
        )
      }

    </div>
  );
};

export default RevenueLayout;
