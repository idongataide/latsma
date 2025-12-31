import React, { useState, useEffect } from 'react';
import { Table, type ColumnDefinition } from '@/components/ui/Table';
import { useDailyPayout } from '@/hooks/useAdmin';
import LoadingScreen from '@/pages/dashboard/common/LoadingScreen';
import DateRangeFilter, { type Period } from '@/components/ui/DateRangeFilter';

type DailyPayout = {
  _id: {
    date: string;
    stake_id: string;
  };
  service_fee: number;
  booking_ref: number;
  totalAmount: number;
  createdAt: string;
  operator_id: string;
  bank_info: {
    name: string;
    bank_data: {
      bank_name: string;
      bank_code: string;
      account_number: string;
      account_name: string;
    };
  };
};

interface TableDailyPayout extends DailyPayout {
  id: string;
}

const OperatorPayoutTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('yearly');
  const [dateRange, setDateRange] = useState<{ start_date: string; end_date: string }>({
    start_date: '',
    end_date: ''
  });

  // Calculate date range based on selected period
  useEffect(() => {
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
      }

      setDateRange({
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });
    };

    calculateDateRange(selectedPeriod);
  }, [selectedPeriod]);

  // Format the query string correctly
  const queryString = dateRange.start_date 
    ? `&start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`
    : '';
  const { data: payouts, isLoading } = useDailyPayout(queryString);

  const paginatedData = React.useMemo(() => {
    if (!payouts) return [];
    const startIndex = (currentPage - 1) * pageSize;
    return payouts.slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, payouts]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const columns: Array<ColumnDefinition<TableDailyPayout>> = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => (
        <span className='text-[#475467]'>
          {new Date(value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      ),
    },
    {
      title: "Booking Id",
      dataIndex: "booking_ref",
      key: "booking_ref",
      render: (value) => <span className='font-medium text-[#475467]'>{value}</span>,
    },
    {
      title: "Beneficiary",
      dataIndex: "bank_info",
      key: "name",
      render: (_, record) => <span className='text-[#475467]'>{record.bank_info.name || 'N/A'}</span>,
    },
  
    {
      title: "Amount due",
      dataIndex: "service_fee",
      key: "service_fee",
      render: (value) => <span className='text-[#475467]'>₦{value.toLocaleString()}</span>,
    },
    {
      title: "Bank name",
      dataIndex: "bank_info",
      key: "bank_name",
      render: (_, record) => <span className='text-[#475467]'>{record.bank_info.bank_data.bank_name || 'N/A'}</span>,
    },
    {
      title: "Account number",
      dataIndex: "bank_info",
      key: "account_number",
      render: (_, record) => <span className='text-[#475467]'>{record.bank_info.bank_data.account_number || 'N/A'}</span>,
    },
  ];

  const tableData: TableDailyPayout[] = (payouts || []).map((payout: DailyPayout) => ({
    ...payout,
    id: payout.operator_id
  }));

  return (
    <div className="mb-6">
      <DateRangeFilter
        title="Operator Payout"
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        periods={['weekly', 'monthly', 'yearly']}
        variant="outline"
      />
      <Table 
        columns={columns} 
        data={paginatedData}
        pagination={tableData.length > pageSize ? {
          current: currentPage,
          pageSize: pageSize,
          total: tableData.length,
          onChange: handlePageChange,
        } : undefined}
      />
    </div>
  );
};

export default OperatorPayoutTable; 