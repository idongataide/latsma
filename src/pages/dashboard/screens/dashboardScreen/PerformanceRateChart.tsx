import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useAllBookingsCount } from "@/hooks/useAdmin";

ChartJS.register(ArcElement, Tooltip, Legend);

type Period = 'daily' | 'weekly' | 'monthly';

const PerformanceRateChart: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('monthly');
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

  const { data: bookingsCount } = useAllBookingsCount(`count-status&start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`);

  // Calculate percentages based on total bookings
  const total = bookingsCount?.total || 0;
  const completed = bookingsCount?.completed || 0;
  const pending = bookingsCount?.pending || 0;
  const cancelled = bookingsCount?.cancelled || 0;

  const completedPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const pendingPercentage = total > 0 ? Math.round((pending / total) * 100) : 0;
  const cancelledPercentage = total > 0 ? Math.round((cancelled / total) * 100) : 0;

  const bookingData = [
    { label: 'Completed', percentage: completedPercentage, color: '#34B27B' }, // Green
    { label: 'Pending', percentage: pendingPercentage, color: '#EFC15D' }, // Yellow
    { label: 'Cancelled', percentage: cancelledPercentage, color: '#CE4B4B' }, // Red
  ];

  const data = {
    labels: bookingData.map(item => item.label),
    datasets: [
      {
        data: bookingData.map(item => item.percentage),
        backgroundColor: bookingData.map(item => item.color),
        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}%`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-[#E5E9F0]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-semibold text-[#344054]">Performance rate</h3>
        <div className="text-sm text-gray-500">
          <button 
            onClick={() => setSelectedPeriod('daily')}
            className={`px-3 py-1 text-xs cursor-pointer rounded-bl-md rounded-tl-md border border-[#F2F4F7] ${
              selectedPeriod === 'daily' ? 'text-[#fff] bg-[#E86229]' : 'text-[#475467]'
            }`}
          >
            Daily
          </button>
          <button 
            onClick={() => setSelectedPeriod('weekly')}
            className={`px-3 py-1 text-xs cursor-pointer border border-[#F2F4F7] ${
              selectedPeriod === 'weekly' ? 'text-[#fff] bg-[#E86229]' : 'text-[#475467]'
            }`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setSelectedPeriod('monthly')}
            className={`px-3 py-1 text-xs cursor-pointer rounded-br-md rounded-tr-md border border-[#F2F4F7] ${
              selectedPeriod === 'monthly' ? 'text-[#fff] bg-[#E86229]' : 'text-[#475467]'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center min-h-[300px] ">
        <div className="w-[168px] h-[168px] flex items-center justify-center relative">
           <Pie data={data} options={options} />
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-xl font-bold text-[#475467]">{completedPercentage}%</div>
              <div className="text-sm text-[#667085]">Completed booking</div>
           </div>
        </div>
        
        <div className="mt-4 md:mt-0 md:ml-8 text-sm">
          {bookingData.map((item) => (
            <p key={item.label} className="mb-1 text-[#344054] text-md">
              <span className={`inline-block w-3 h-3 mr-2 rounded-full`} style={{ backgroundColor: item.color }}></span>
              {item.percentage}% {item.label}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceRateChart; 