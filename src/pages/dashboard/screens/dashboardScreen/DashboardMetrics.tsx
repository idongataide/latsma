import { useAllBookingsCount, useAllTransCount, useOperatorCount } from "@/hooks/useAdmin";
import React, { useState, useEffect } from "react";

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';

const DashboardMetrics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('yearly');
  const [dateRange, setDateRange] = useState<{ start_date: string; end_date: string }>({
    start_date: '',
    end_date: ''
  });

  // Function to calculate date range based on selected period
  const calculateDateRange = (period: Period) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (period) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'yearly':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
    }

    setDateRange({
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    });
  };

  // Update date range when period changes
  useEffect(() => {
    calculateDateRange(selectedPeriod);
  }, [selectedPeriod]);

  const { data: operatorCount } = useOperatorCount(`count&start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`);
  const { data: bookingsCount } = useAllBookingsCount(`count-status&start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`);
  const { data: transCount } = useAllTransCount(`count&start_date=${dateRange.start_date}&end_date=${dateRange.end_date}&status=1`);
  

  return (
    <>
    <div className="text-sm py-3 px-2 rounded-lg mb-3 bg-[#fff]">
        <button 
          onClick={() => setSelectedPeriod('daily')}
          className={`px-6 py-2 text-xs cursor-pointer rounded-bl-md rounded-tl-md border border-[#F2F4F7] ${
            selectedPeriod === 'daily' ? 'text-[#fff] bg-[#E86229]' : 'text-[#667085]'
          }`}
        >
          Daily
        </button>
        <button 
          onClick={() => setSelectedPeriod('weekly')}
          className={`px-6 py-2 text-xs cursor-pointer border border-[#F2F4F7] ${
            selectedPeriod === 'weekly' ? 'text-[#fff] bg-[#E86229]' : 'text-[#667085]'
          }`}
        >
          Weekly
        </button>
        <button 
          onClick={() => setSelectedPeriod('monthly')}
          className={`px-6 py-2 text-xs cursor-pointer border border-[#F2F4F7] ${
            selectedPeriod === 'monthly' ? 'text-[#fff] bg-[#E86229]' : 'text-[#667085]'
          }`}
        >
          Monthly
        </button>
        <button 
          onClick={() => setSelectedPeriod('yearly')}
          className={`px-6 py-2 text-xs cursor-pointer border border-[#F2F4F7] ${
            selectedPeriod === 'yearly' ? 'text-[#fff] bg-[#E86229]' : 'text-[#667085]'
          }`}
        >
          Yearly
        </button>
        <button 
          onClick={() => setSelectedPeriod('all')}
          className={`px-6 py-2 text-xs cursor-pointer rounded-br-md rounded-tr-md border border-[#F2F4F7] ${
            selectedPeriod === 'all' ? 'text-[#fff] bg-[#E86229]' : 'text-[#667085]'
          }`}
        >
          All time
        </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
      {/* Total Revenue */}
      <div className="bg-white rounded-lg p-6 border border-[#F2F4F7]">
        <h2 className="text-2xl font-bold text-[#667085] mb-3">₦{bookingsCount?.total_amount || 0}</h2>
        <p className="text-sm text-[#475467]">Total Revenue</p>
      </div>

      {/* Total number of operators */}
      <div className="bg-white rounded-lg p-6 border border-[#F2F4F7]">
        <h2 className="text-2xl font-bold text-[#667085] mb-3">{operatorCount?.total || 0}</h2>
        <p className="text-sm text-[#475467]">Total number of operators</p>
      </div>

      {/* Pending requests */}
      <div className="bg-white rounded-lg p-6 border border-[#F2F4F7]">
        <h2 className="text-2xl font-bold text-[#667085] mb-3">{bookingsCount?.pending || 0}</h2>
        <p className="text-sm text-[#475467] mb-3">Pending requests</p>
      </div>

      {/* Successful transactions */}
      <div className="bg-white rounded-lg p-6 border border-[#F2F4F7]">
        <h2 className="text-2xl font-bold text-[#667085] mb-3">{transCount?.total || 0}</h2>
        <p className="text-sm text-[#475467]">Successful transactions</p>
      </div>
    </div>

    </>
  );
};

export default DashboardMetrics; 