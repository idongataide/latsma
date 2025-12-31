import React, { useState, useMemo } from 'react';
import { Table, type ColumnDefinition } from '@/components/ui/Table';

import { MdOutlineEdit as IconEdit } from 'react-icons/md';
import { MdOutlineDeleteOutline as IconDelete } from 'react-icons/md';
import { useFees } from '@/hooks/useAdmin';
import { deleteFee } from '@/api/settingsApi';
import toast, { Toaster } from 'react-hot-toast';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import EditGeneralCostForm from './EditGeneralCostForm';
import { useSWRConfig } from 'swr';

interface FeeItem {
  name: string;
  tag: string;
  slug: string;
  amount: number;
  amount_type: string;
  amount_sufix: string;
  data: any[];
  createdAt: string;
  updatedAt: string;
  fee_id: string;
  id: string;
}

const GeneralCostTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState<FeeItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [feeToEdit, setFeeToEdit] = useState<FeeItem | null>(null);
  const { data: feesList, mutate } = useFees();
  const { mutate: globalMutate } = useSWRConfig();

  const handleDeleteClick = (fee: FeeItem) => {
    setFeeToDelete(fee);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!feeToDelete) return;

    try {
      setIsDeleting(true);
      const response = await deleteFee(feeToDelete.fee_id);

      if (response) {
        toast.success('Fee deleted successfully');
        mutate();
        globalMutate('/settings/fees?component=count');
      } else {
        toast.error('Failed to delete fee');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('An error occurred while deleting the fee');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setFeeToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setFeeToDelete(null);
  };

  const handleEditClick = (fee: FeeItem) => {
    setFeeToEdit(fee);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setFeeToEdit(null);
  };

  const columns: Array<ColumnDefinition<FeeItem>> = [
    {
      title: "Item name",
      dataIndex: "name",
      key: "name",
      render: (value: string) => <span className='text-[#475467] font-medium capitalize'>{value}</span>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (value: number) => `₦${value?.toLocaleString() || 'N/A'}`,
    },
    {
      title: "Last modified",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value: string) => new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
    },
    {
      title: "Actions",
      dataIndex: "fee_id",
      key: "actions",
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <button 
            className="flex items-center gap-1 text-[#667085] text-sm font-medium cursor-pointer"
            onClick={() => handleEditClick(record)}
          >
            <IconEdit className='w-4 h-4'/> Edit
          </button>
          <button 
             className="flex items-center gap-1 text-[#667085] text-sm font-medium cursor-pointer"
             onClick={() => handleDeleteClick(record)}
             disabled={isDeleting}
          >
             <IconDelete className='w-4 h-4'/> Delete
          </button>
        </div>
      ),
    },
  ];

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const paginatedData = useMemo(() => {
    if (!feesList?.data) return [];
    const startIndex = (currentPage - 1) * pageSize;
    return feesList.data.map((fee: FeeItem) => ({
      ...fee,
      id: fee.fee_id
    })).slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, feesList]);

  return (
    <div className="mb-6">
      <Toaster/>
      <div className="py-2 px-4 bg-white rounded-md border-[#E5E9F0] flex justify-between items-center">
        <h1 className="text-lg font-medium mb-0 text-[#344054]">General cost points</h1>
        {/* <button className="flex items-center gap-2 px-4 py-2 text-[#667085] bg-[#F9FAFB] rounded-lg border border-[#E5E9F0] hover:bg-gray-50">
          <span>Filters</span>          
        </button> */}
      </div>
      
      <Table
        columns={columns}
        data={paginatedData}
        pagination={feesList?.data?.length > pageSize ? {
          current: currentPage,
          pageSize: pageSize,
          total: feesList.data.length,
          onChange: handlePageChange,
        } : undefined}
        // showActions={false} // Actions are handled in render
        // onRowClick={(id) => handleEditOperator(id)} // Remove or update
      />

      {showDeleteModal && feeToDelete && (
        <DeleteConfirmationModal
          itemName={feeToDelete.name}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          loading={isDeleting}
        />
      )}

      {showEditModal && feeToEdit && (
        <EditGeneralCostForm
          onClose={handleCloseEditModal}
          feeData={feeToEdit}
        />
      )}
    </div>
  );
};

export default GeneralCostTable; 