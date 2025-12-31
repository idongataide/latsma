import React, { useState, useMemo } from 'react';
import { Table, type ColumnDefinition } from '@/components/ui/Table';
import { MdOutlineEdit as IconEdit } from 'react-icons/md';
import { MdOutlineDeleteOutline as IconDelete } from 'react-icons/md';
import { deleteStakeholder } from '@/api/settingsApi';
import toast, { Toaster } from 'react-hot-toast';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { useStakeholders, useStakeholdersCount } from '@/hooks/useAdmin';

interface BankData {
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
}

interface StakeHolderItem {
  stakeholder_id: string;
  id: string;
  name: string;
  bank_data: BankData;
  amount?: number;
  amount_sufix?: string;
  amount_type?: string;
  createdAt?: string;
  updatedAt?: string;
}



interface StakeHolderTableProps {
  onEdit: (data: any) => void;
}

export type { StakeHolderTableProps };

const StakeHolderTable: React.FC<StakeHolderTableProps> = ({ onEdit }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stakeholderToDelete, setStakeholderToDelete] = useState<StakeHolderItem | null>(null);
  const { data: stakeholdersResponse, mutate: mutateStakeholders } = useStakeholders();
  const { mutate: mutateCount } = useStakeholdersCount();

  console.log(stakeholdersResponse,'stakeholderssResponses')

  const handleDeleteClick = (stakeholder: StakeHolderItem) => {
    setStakeholderToDelete({
      ...stakeholder,
      id: stakeholder.stakeholder_id
    });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!stakeholderToDelete) return;

    try {
      setIsDeleting(true);
      const response = await deleteStakeholder(stakeholderToDelete.id);

      if (response) {
        toast.success('Stakeholder deleted successfully');
        mutateStakeholders();
        mutateCount();
      } else {
        toast.error('Failed to delete stakeholder');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('An error occurred while deleting the stakeholder');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setStakeholderToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setStakeholderToDelete(null);
  };

  const handleEditClick = (stakeholder: StakeHolderItem) => {
    console.log('Stakeholder to edit:', stakeholder); // Debug log
    const formattedData = {
      id: stakeholder.stakeholder_id || stakeholder.id, // Try both possible ID fields
      name: stakeholder.name,
      bank_name: stakeholder.bank_data.bank_name,
      bank_code: stakeholder.bank_data.bank_code,
      account_number: stakeholder.bank_data.account_number,
      account_name: stakeholder.bank_data.account_name,
      value: stakeholder.amount?.toString() || '',
      value_type: stakeholder.amount_type === 'percentage' ? 'Percentage' : 'Amount'
    };
    console.log('Formatted data:', formattedData); // Debug log
    onEdit(formattedData);
  };

  const columns: Array<ColumnDefinition<StakeHolderItem>> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (value: string) => <span className='text-[#475467] font-medium'>{value}</span>,
    },
    {
      title: "Bank Name",
      dataIndex: ["bank_data", "bank_name"],
      key: "bank_name",
    },
    {
      title: "Account Number",
      dataIndex: ["bank_data", "account_number"],
      key: "account_number",
    },
    {
      title: "Account Name",
      dataIndex: ["bank_data", "account_name"],
      key: "account_name",
    },
    {
      title: "Value (Percentage/amount)",
      dataIndex: "amount",
      key: "value",
      render: (amount: number, record: StakeHolderItem) => {
        if (record.amount_type === 'percentage') {
          return `${amount}%`;
        } else if (record.amount_type === 'amount') {
          return `₦${amount?.toLocaleString()}`;
        }
        return amount;
      },
    },
    {
      title: "Actions",
      dataIndex: "stakeholder_id",
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
    if (!stakeholdersResponse || !Array.isArray(stakeholdersResponse)) return [];
    const startIndex = (currentPage - 1) * pageSize;
    return stakeholdersResponse.map((stakeholder: StakeHolderItem) => ({
      ...stakeholder,
      id: stakeholder.stakeholder_id
    })).slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, stakeholdersResponse]);

  // Ensure total is based on the actual data array length
  const totalStakeholders = stakeholdersResponse?.length || 0;

  return (
    <div className="mb-6">
      <Toaster/>
      <div className="py-2 px-4 bg-white rounded-md border-[#E5E9F0] flex justify-between items-center">
        <h1 className="text-lg font-medium mb-0 text-[#344054]">Stakeholders</h1>
        <button className="flex items-center gap-2 px-4 py-2 text-[#667085] bg-[#F9FAFB] rounded-lg border border-[#E5E9F0] hover:bg-gray-50">
          <span>Sort by</span>
        </button>
      </div>

      <Table<StakeHolderItem>
        columns={columns}
        data={paginatedData}
        pagination={totalStakeholders > pageSize ? {
          current: currentPage,
          pageSize: pageSize,
          total: totalStakeholders,
          onChange: handlePageChange,
        } : undefined}
      />

      {showDeleteModal && stakeholderToDelete && (
        <DeleteConfirmationModal
          itemName={stakeholderToDelete.name}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          loading={isDeleting}
        />
      )}
    </div>
  );
};

export default StakeHolderTable; 