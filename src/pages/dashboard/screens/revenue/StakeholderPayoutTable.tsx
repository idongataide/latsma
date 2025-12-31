import React, { useState, useMemo, useEffect } from 'react';
import { Table, type ColumnDefinition } from '@/components/ui/Table';
import { useStakeholderPayouts } from '@/hooks/useAdmin';
import LoadingScreen from '@/pages/dashboard/common/LoadingScreen';
import DateRangeFilter, { type Period } from '@/components/ui/DateRangeFilter';

export interface StakeholderItemData {
  id: string;
  name: string;
  amount: number;
  createdAt: string;
  status: number;
  bank_info: {
    bank_data: {
      bank_name: string;
      bank_code: string;
      account_number: string;
      account_name: string;
    }
  };
}

const StakeholderPayoutTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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

  const { data: itemsData, isLoading } = useStakeholderPayouts(queryString);

  const paginatedData = useMemo(() => {
    if (!itemsData) return [];
    const startIndex = (currentPage - 1) * pageSize;
    return itemsData.slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, itemsData]);

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const columns: Array<ColumnDefinition<StakeholderItemData>> = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => {
        if (!date) return 'N/A';
        const d = new Date(date);
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
    {
      title: "Beneficiary",
      dataIndex: "name",
      key: "beneficiary",
      render: (value: string) => <span className='text-[#475467] font-medium'>{value}</span>,
    },
    {
      title: "Amount due",
      dataIndex: "amount",
      key: "amountDue",
      render: (value: number, record: StakeholderItemData) => 
        record?.status === 0 || record?.status === 4 ? null : `₦${value?.toLocaleString() || 'N/A'}`,
    },
    {
      title: "Bank name",
      dataIndex: "bank_info",
      key: "bankName",
      render: (bank_info: StakeholderItemData['bank_info']) => bank_info?.bank_data?.bank_name || 'N/A',
    },
    {
      title: "Account number",
      dataIndex: "bank_info",
      key: "accountNumber",
      render: (bank_info: StakeholderItemData['bank_info']) => bank_info?.bank_data?.account_number || 'N/A',
    },
  ];

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="mb-6">
        {/* <div className="py-2 px-4 bg-white rounded-md border-[#E5E9F0] flex justify-between items-center mb-4">
            <h1 className="text-md font-medium mb-0 text-[#344054]">Stakeholder's Payout</h1>
        </div> */}
        <DateRangeFilter
          title="Stakeholder's Payout"
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          periods={['weekly', 'monthly', 'yearly']}
          variant="outline"
        />
        <Table 
            columns={columns} 
            data={paginatedData} 
            pagination={itemsData?.length > pageSize ? {
            current: currentPage,
            pageSize: pageSize,
            total: itemsData?.length,
            onChange: handlePageChange,
            } : undefined}
        />
    </div>
  );
};

export default StakeholderPayoutTable; 
