import React, { useState, useMemo, useEffect } from 'react';
import { Table, type ColumnDefinition } from '@/components/ui/Table';
import { useRemittedRevenue } from '@/hooks/useAdmin';
import LoadingScreen from '@/pages/dashboard/common/LoadingScreen';

interface RemittedRevenueData {
  id: string;
  date: string;
  totalRevenue: number;
  serviceFee: number;
  [key: string]: any;
}

interface RemittedRevenueTableProps {
  onRowClick?: (rowData: any) => void;
}

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';

const RemittedRevenueTable: React.FC<RemittedRevenueTableProps> = () => {
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
    ? `?start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`
    : '';

  const { data: revenues, isLoading } = useRemittedRevenue(queryString);

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const processedData = useMemo(() => {
    if (!revenues) return { data: [], columns: [] };

    const uniqueStakeholders = new Set<string>();
    const transformedData = revenues.map((revenue: any) => {
      const rowData: any = {
        id: revenue?.id || revenue?.date,
        date: revenue?.date,
        totalRevenue: revenue?.totalAmount,
        serviceFee: revenue?.serviceFee,
        originalItems: revenue?.items || []
      };
      revenue?.items?.forEach((item: any) => {
        const normalizedName = item.name.toLowerCase();
        uniqueStakeholders.add(normalizedName);
        rowData[normalizedName] = item.amount;
      });
      return rowData;
    });

    const dynamicColumns: Array<ColumnDefinition<RemittedRevenueData>> = Array.from(uniqueStakeholders).map(stakeholderName => ({
      title: stakeholderName.charAt(0).toUpperCase() + stakeholderName.slice(1),
      dataIndex: stakeholderName,
      key: stakeholderName,
      render: (value: number) => `₦${value?.toLocaleString() || 'N/A'}`,
    }));

    const staticColumns: Array<ColumnDefinition<RemittedRevenueData>> = [
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        render: (value: string) => <span className='text-[#475467] font-medium'>{value}</span>,
      },
      {
        title: "Total Revenue",
        dataIndex: "totalRevenue",
        key: "totalRevenue",
        render: (value: number) => `₦${value?.toLocaleString() || 'N/A'}`,
      },
      {
        title: "Operator Earnings",
        dataIndex: "serviceFee",
        key: "serviceFee",
        render: (value: number) => `₦${value?.toLocaleString() || 'N/A'}`,
      },
    ];

    const allColumns = [...staticColumns, ...dynamicColumns];

    return {
      data: transformedData,
      columns: allColumns,
    };

  }, [revenues]);

  const { data: tableData, columns } = processedData;

  const paginatedData = useMemo(() => {
    if (!tableData) return [];
    const startIndex = (currentPage - 1) * pageSize;
    return tableData.slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, tableData]);



  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="mb-6">
      <div className="py-2 px-4 bg-white rounded-md border-[#E5E9F0] flex justify-between items-center">
        <h1 className="text-md font-medium mb-0 text-[#344054]">Remitted Revenue</h1>
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
        data={paginatedData}
        pagination={tableData?.length > pageSize ? {
          current: currentPage,
          pageSize: pageSize,
          total: tableData?.length,
          onChange: handlePageChange,
        } : undefined}
      />
    </div>
  );
};

export default RemittedRevenueTable;