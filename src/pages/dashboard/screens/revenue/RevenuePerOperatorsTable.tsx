import React, { useState, useEffect } from 'react';
import { Table, type ColumnDefinition } from '@/components/ui/Table';
import { useRevenues } from '@/hooks/useAdmin';
import DateRangeFilter, { type Period } from '@/components/ui/DateRangeFilter';

interface OperatorRevenue {
  total_count: number;
  total_earning: number;
  operator_id: string;
  operator_name: string;
  operator_lga: string;
  operator_state: string;
  createdAt: string;
}

interface TableOperatorRevenue extends OperatorRevenue {
  id: string;
}

const RevenuePerOperatorsTable: React.FC = () => {
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
        endDate = new Date(); // Current date
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

  // Format the query string correctly
  const queryString = dateRange.start_date 
    ? `&start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`
    : '';

  const { data: revenues } = useRevenues(`operator-earning${queryString}`);

  const columns: Array<ColumnDefinition<TableOperatorRevenue>> = [
    {
      title: "Operators list",
      dataIndex: "operator_name",
      key: "operator_name",
      render: (value, record) => (
        <div className="flex flex-col">
          <span className='font-medium text-[#475467]'>{value}</span>
          <span className='text-sm text-[#667085]'>{record.operator_lga}, {record.operator_state}</span>
        </div>
      ),
    },
    {
      title: "Total requests",
      dataIndex: "total_count",
      key: "total_count",
      render: (value) => <span className='text-[#475467]'>{value}</span>,
    },
    {
      title: "Total earnings",
      dataIndex: "total_earning",
      key: "total_earning",
      render: (value) => <span className='text-[#475467]'>₦{value?.toLocaleString()}</span>,
    },
    {
      title: "Date joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => {
        if (!value) return 'N/A';
        const d = new Date(value);
        // Format: Mon, 02-06-2025
        const formatted = d.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).replace(/\//g, '-');
        return <span className='text-[#475467] font-medium'>{formatted}</span>;
      },
    },
  ];

  const tableData: TableOperatorRevenue[] = (revenues as OperatorRevenue[] || []).map((op: OperatorRevenue) => ({
    ...op,
    id: op.operator_id
  }));

  return (
    <div className="mb-6">
      <DateRangeFilter
        title="Revenue per operator"
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        periods={['weekly', 'monthly', 'yearly']}
      />
      
      <Table
        columns={columns}
        data={tableData}
      />
    </div>
  );
};

export default RevenuePerOperatorsTable; 