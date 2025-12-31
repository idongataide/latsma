import React from "react";
import { HiMiniArrowTrendingUp, HiMiniArrowTrendingDown } from "react-icons/hi2";
import { useRevenues } from '@/hooks/useAdmin';
import LoadingScreen from '@/pages/dashboard/common/LoadingScreen';

interface RevenueSummary {
  thisWeek: number;
  thisMonth: number;
  thisQuarter: number;
  allTime: number;
}

const RevenueMetrics: React.FC = () => {
  const { data: revenues, isLoading } = useRevenues('inflow-earnings');

  if (isLoading) {
    return <LoadingScreen />;
  }

  const revenueData = revenues as RevenueSummary || {
    thisWeek: 0,
    thisMonth: 0,
    thisQuarter: 0,
    allTime: 0
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {/* Grouped box with borders between 3 metrics */}
        <div className="lg:col-span-4 bg-white rounded-lg py-5 border border-[#E5E9F0] flex divide-x divide-[#E5E9F0]">
          {/* This week */}
          <div className="flex-1 p-4">
            <h2 className="text-lg md:text-2xl font-bold text-[#475467] mb-2">₦{revenueData?.thisWeek?.toLocaleString()}</h2>
            <div className="flex items-center gap-1 text-sm">
              <p className="font-medium text-[#667085]">This week</p>
              <span className="mx-1 w-1 h-1 rounded-full bg-[#98A2B3]"></span>
              <div className="flex items-center gap-1 font-bold text-[#69B574]">
                <HiMiniArrowTrendingUp className="w-3 h-3" />
                <span>4.70%</span>
              </div>
            </div>
          </div>

          {/* This month */}
          <div className="flex-1 p-4">
            <h2 className="text-lg md:text-2xl font-bold text-[#475467] mb-2">₦{revenueData?.thisMonth?.toLocaleString()}</h2>
            <div className="flex items-center gap-1 text-sm">
              <p className="font-medium text-[#667085]">This month</p>
              <span className="mx-1 w-1 h-1 rounded-full bg-[#98A2B3]"></span>
              <div className="flex items-center gap-1 font-bold text-[#69B574]">
                <HiMiniArrowTrendingUp className="w-3 h-3" />
                <span>8.50%</span>
              </div>
            </div>
          </div>

          {/* This quarter */}
          <div className="flex-1 p-4">
            <h2 className="text-lg md:text-2xl font-bold text-[#475467] mb-2">₦{revenueData?.thisQuarter?.toLocaleString()}</h2>
            <div className="flex items-center gap-1 text-sm">
              <p className="font-medium text-[#667085]">This quarter</p>
              <span className="mx-1 w-1 h-1 rounded-full bg-[#98A2B3]"></span>
              <div className="flex items-center gap-1 font-bold text-[#C21E1E]">
                <HiMiniArrowTrendingDown className="w-3 h-3" />
                <span>0.90%</span>
              </div>
            </div>
          </div>

          {/* All time revenue */}
          <div className="flex-1 p-4">
            <h2 className="text-lg md:text-2xl font-bold text-[#475467] mb-2">₦{revenueData?.allTime?.toLocaleString()}</h2>
            <div className="flex items-center gap-1 text-sm">
              <p className="font-medium text-[#667085]">All time revenue</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RevenueMetrics; 