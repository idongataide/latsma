import React, { useState } from 'react';
import { Table, type ColumnDefinition } from '@/components/ui/Table';
import { MdOutlineDeleteOutline as IconDelete } from 'react-icons/md';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import toast, { Toaster } from 'react-hot-toast';
import { axiosAPIInstance } from '@/api/interceptor';
import { useOnboardingStore } from '@/global/store';
import type { KeyedMutator } from 'swr';

interface TeamMember {
  id: string;
  auth_id: string;
  name: string;
  first_name: string;
  last_name:string;
  email: string;
  phone_number: string;
  role: string;
  createdAt: string;
  action?: string;
}

interface AllTeamsProps {
  data: TeamMember[];
  mutate: KeyedMutator<any>;
}

const AllTeams: React.FC<AllTeamsProps> = ({data, mutate}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  const { role } = useOnboardingStore();


  const handleDeleteClick = (member: TeamMember) => {
    if (!member.auth_id) {
      toast.error('Invalid member ID');
      return;
    }
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete?.auth_id) {
      toast.error('Invalid member ID');
      return;
    }

    try {
      setIsDeleting(true);
      const response = await axiosAPIInstance.delete(`/accounts/admin-user/${memberToDelete.auth_id}`);

      if (response?.data?.status === 'ok') {
        toast.success('Team member deleted successfully');
        mutate();
        // You might want to refresh the data here
      } else {
        toast.error('Failed to delete team member');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('An error occurred while deleting the team member');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setMemberToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setMemberToDelete(null);
  };

  const columns: Array<ColumnDefinition<TeamMember>> = [
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
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Date onboarded",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    ...(role === 'superadmin'
      ? [{
        title: "Actions",
        key: "actions",
        dataIndex: "id" as keyof TeamMember,
        render: (_: unknown, record: TeamMember) => (
          <button 
            onClick={() => handleDeleteClick(record)}
            className="text-[#667085] text-sm font-medium flex items-center gap-2 cursor-pointer"
            disabled={isDeleting}
          >
            <IconDelete className='w-4 h-4'/> Delete
          </button>
        ),
      }      ]
      : []),
  ];

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <div className="mb-6">
      <Toaster/>
      <div className="py-2 px-4 bg-white rounded-md border-[#E5E9F0] flex justify-between items-center">
        <h1 className="text-lg font-medium mb-0 text-[#344054]">Team Members</h1>
        {/* <button className="flex items-center gap-2 px-4 py-2 text-[#667085] bg-[#F9FAFB] rounded-lg border border-[#E5E9F0] hover:bg-gray-50">
          <img src={Images.icon.filter} alt="Filter" className="w-4 h-4" />
          <span>Filters</span>          
        </button> */}
      </div>
      
      <Table
        columns={columns}
        data={data?.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        pagination={data?.length > pageSize ? {
          current: currentPage,
          pageSize: pageSize,
          total: data?.length,
          onChange: handlePageChange,
        } : undefined}
      />

      {showDeleteModal && memberToDelete && (
        <DeleteConfirmationModal
          itemName={`${memberToDelete.first_name} ${memberToDelete.last_name}`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          loading={isDeleting}
        />
      )}
    </div>
  );
};

export default AllTeams;