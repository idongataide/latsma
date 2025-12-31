import React, { useState } from 'react';
import { Table, type ColumnDefinition } from '@/components/ui/Table';
import { FaArrowRight } from 'react-icons/fa';


interface Customer {
  id: string;
  auth_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  status: number;
  createdAt: string;
  email_status: number;
  phone_status: number;
  avatar: string;
}

interface AllCustomersProps {
  data: Customer[];
}

const AllCustomers: React.FC<AllCustomersProps> = ({ data }) => {
 
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const columns: Array<ColumnDefinition<Customer>> = [
    {
      title: "Name",
      dataIndex: "first_name",
      key: "name",
      render: (_, data) => (
        <div className="flex items-center gap-2">           
          <span className='font-medium text-[#475467]'>{`${data.first_name} ${data.last_name}`}</span>
        </div>
      ),
    },
    {
      title: "Email address",
      dataIndex: "email",
      key: "email",
      render: (value) => (
        <span className="lowercase">
          {value}
        </span>
      )
    },
    {
      title: "Phone number",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs ${value === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value === 1 ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: "Date registered",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value) => new Date(value).toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
    },
  ];

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <div className="mb-6">
      <div className="py-2 px-4 bg-white rounded-md border-[#E5E9F0] flex justify-between items-center">
        <h1 className="text-lg font-medium mb-0 text-[#344054]">User list</h1>
        <button className="flex items-center gap-2 px-4 py-2 text-[#667085] bg-[#F9FAFB] rounded-lg border border-[#E5E9F0] hover:bg-gray-50">
          <span>View All</span> <FaArrowRight/>          
        </button>
      </div>
      

    <Table
        columns={columns}
        data={data?.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        pagination={data?.length >= 30 ? {
          current: currentPage,
          pageSize: pageSize,
          total: data?.length,
          onChange: handlePageChange,
        } : undefined}
        showActions
      />
      
    </div>
  );
};

export default AllCustomers;