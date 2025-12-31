import React, { useState } from 'react';
import { Table, type ColumnDefinition } from '@/components/ui/Table';
import Images from '@/components/images';
import { FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../../common/LoadingScreen';


interface Operator {
  id: string;
  assetco_id: string;
  name: string;
  email: string;
  phone_number: string;
  lga: string;
  state: string;
  createdAt: string;
  action?: string;
}

interface AllOperationsProps {
  data: Operator[];
  isLoading?: boolean;
}

const OperatorsDirectory: React.FC<AllOperationsProps> = ({ data, isLoading  }) => {

  if (isLoading) {
    return (
      <LoadingScreen/>
    );
  }

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const handleViewOperator = (id: string) => {
    navigate(`/operators/roadrescue/${id}`);
  };

  const columns: Array<ColumnDefinition<Operator>> = [
  
    {
        title: "Operator List",
        dataIndex: "name",
        key: "name",
        render: (value) => (
          <div className="flex items-center gap-2">           
            <span className='font-medium text-[#475467]'>{value}</span>
          </div>
        ),
      },
    {
      title: "Email address",
      dataIndex: "email",
      key: "email",
      render: (value) => (
        <div className="flex items-center gap-2">           
          <span className='font-medium lowercase text-[#475467]'>{value}</span>
        </div>
      ),
    },
    {
      title: "Phone number",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "LGA-State",
      dataIndex: "lga",
      key: "lga",
      render: (_, record) => (
        <div className="flex items-center gap-2">           
          <span className='font-medium text-[#475467]'>{`${record.lga}, ${record.state}`}</span>
        </div>
      ),
    },
    {
      title: "Date onboarded",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => {
        if (!value) return 'N/A';
        const d = new Date(value);
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
      title: "Actions",
      dataIndex: "action",
      key: "actions",
      render: (_, record) => (
        <button 
          onClick={() => handleViewOperator(record.id)}
          className="text-[#667085] text-sm font-medium flex items-center gap-2 cursor-pointer"
        >
          View <FaArrowRight className='ml-2' />
        </button>
      ),
    },
  ];



  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

 
  return (
    <div className="mb-6">
      <div className="py-2 px-4 bg-white rounded-md border-[#E5E9F0] flex justify-between items-center">
        <h1 className="text-lg font-medium mb-0 text-[#344054]">Operators Directory</h1>
        <button className="flex items-center gap-2 px-4 py-2 text-[#667085] bg-[#F9FAFB] rounded-lg border border-[#E5E9F0] hover:bg-gray-50">
          <img src={Images?.icon?.filter} alt="Filter" className="w-4 h-4" />
          <span>Filter</span>          
        </button>
      </div>
      
      <Table
        columns={columns}
        data={data?.map(op => ({ ...op, id: op.assetco_id }))?.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data?.length,
          onChange: handlePageChange,
        }}
        showActions
        onRowClick={(id) => handleViewOperator(id)}
      />
    </div>
  );
};

export default OperatorsDirectory;