import React, { useState, useEffect } from 'react';
import { Table, type ColumnDefinition } from '@/components/ui/Table';
import Images from '@/components/images';
import { useDashboardOperators } from '@/hooks/useAdmin';

interface Operator {
  operator_id: string | null;
  total_assign: number;
  total_complete: number;
  name: string;
  avg_rating: number;
}

interface TableOperator extends Operator {
  id: string;
}

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';

const TopOperators: React.FC = () => {
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

  const { data: operatorsData } = useDashboardOperators(
    `start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`
  );

  const columns: Array<ColumnDefinition<TableOperator>> = [
    {
      title: "Operators list",
      dataIndex: "name",
      key: "name",
      render: (value) => (
        <div className="flex items-center gap-2">  
          <img src={Images.icon.medal} alt="Star" className="w-7 h-7" />         
          <span className='font-medium text-[#475467]'>{value || 'Unnamed Operator'}</span>
        </div>
      ),
    },
    {
      title: "Requests assigned",
      dataIndex: "total_assign",
      key: "total_assign",
      render: (value) => <span className='text-[#475467]'>{value}</span>,
    },
    {
      title: "Requests completed",
      dataIndex: "total_complete",
      key: "total_complete",
      render: (value) => <span className='text-[#475467]'>{value}</span>,
    },
    {
      title: "Performance(%)",
      dataIndex: "total_assign",
      key: "performance",
      render: (_, record) => {
        const performance = record.total_assign > 0 
          ? Math.round((record.total_complete / record.total_assign) * 100) 
          : 0;
        return <span className='text-[#475467]'>{performance}%</span>;
      },
    },
    {
      title: "Tow rating",
      dataIndex: "avg_rating",
      key: "avg_rating",
      render: (value) => (
        <div className="flex items-center gap-1">
          <span className='text-[#475467]'>{value?.toFixed(1)}</span>
        </div>
      ),
    },
  ];

  const tableData: TableOperator[] = (operatorsData as Operator[] || []).map((op: Operator) => ({
    ...op,
    id: op.operator_id || 'unknown'
  }));

  return (
    <div className="mb-6">
      <div className="py-2 px-4 bg-white rounded-md border-[#E5E9F0] flex justify-between items-center">
        <h1 className="text-md font-medium mb-0 text-[#344054]">Top five (5) performing operators</h1>
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
            className={`px-3 py-1 text-xs cursor-pointer border border-[#F2F4F7] ${
              selectedPeriod === 'monthly' ? 'text-[#fff] bg-[#E86229]' : 'text-[#475467]'
            }`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setSelectedPeriod('yearly')}
            className={`px-3 py-1 text-xs cursor-pointer border border-[#F2F4F7] ${
              selectedPeriod === 'yearly' ? 'text-[#fff] bg-[#E86229]' : 'text-[#475467]'
            }`}
          >
            Yearly
          </button>
          <button 
            onClick={() => setSelectedPeriod('all')}
            className={`px-3 py-1 text-xs cursor-pointer rounded-br-md rounded-tr-md border border-[#F2F4F7] ${
              selectedPeriod === 'all' ? 'text-[#fff] bg-[#E86229]' : 'text-[#475467]'
            }`}
          >
            All time
          </button>
        </div>
      </div>
      
      <Table
        columns={columns}
        data={tableData}
      />
    </div>
  );
};

export default TopOperators;