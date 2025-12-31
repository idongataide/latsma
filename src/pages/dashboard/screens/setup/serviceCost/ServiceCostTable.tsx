import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Table, type ColumnDefinition } from '@/components/ui/Table';
import { MdOutlineEdit as IconEdit } from 'react-icons/md';
import { MdOutlineDeleteOutline as IconDelete } from 'react-icons/md';
import { useServices, useServicesCount } from '@/hooks/useAdmin';
import { deleteService } from '@/api/settingsApi';
import toast, { Toaster } from 'react-hot-toast';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import EditServiceCostForm from './EditServiceCostForm';
import { getStatusStyle } from '@/components/ui/statusStyles';

interface ServiceItem {
  _id: string;
  name: string;
  amount: number;
  service_type: 'private' | 'commercial';
  createdAt: string;
  updatedAt: string;
  id: string;
  service_id: string;
  operator: {
    _id: string;
    name: string;
    phone_number: string;
  };
}

const ServiceCostTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false); // For Edit functionality
  const [serviceToEdit, setServiceToEdit] = useState<ServiceItem | null>(null); // For Edit functionality
  const { data: servicesList, mutate: mutateServices } = useServices();
  const { mutate: mutateCount } = useServicesCount();
  const [serviceTypeFilter, setServiceTypeFilter] = useState<'all' | 'private' | 'commercial'>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterOpen]);

  console.log(servicesList, 'servicesList');

  const handleDeleteClick = (service: ServiceItem) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      setIsDeleting(true);
      const response = await deleteService(serviceToDelete.service_id);

      if (response) {
        toast.success('Service cost deleted successfully');
        mutateServices();
        mutateCount();
      } else {
        toast.error('Failed to delete service cost');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('An error occurred while deleting the service cost');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setServiceToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setServiceToDelete(null);
  };

  const handleEditClick = (service: ServiceItem) => { // For Edit functionality
    setServiceToEdit(service);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => { // For Edit functionality
    setShowEditModal(false);
    setServiceToEdit(null);
  };

  const columns: Array<ColumnDefinition<ServiceItem>> = [
    {
      title: "Service Name",
      dataIndex: "name",
      key: "name",
      render: (value: string) => <span className='text-[#475467] font-medium capitalize'>{value}</span>,
    },
    {
      title: "Operator",
      dataIndex: "operator",
      key: "operator",
      render: (value: { name: string }) => <span className='text-[#475467] font-medium capitalize'>{value?.name || 'N/A'}</span>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (value: number) => `₦${value?.toLocaleString() || 'N/A'}`,
    },
    {
      title: "Type",
      dataIndex: "service_type",
      key: "service_type",
      render: (value: string) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs capitalize font-medium ${getStatusStyle(value)}`}>
          {value}
        </span>
      ),
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
      dataIndex: "_id",
      key: "actions",
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <button  // For Edit functionality
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
    if (!servicesList?.data) return [];
    let filtered = servicesList.data;
    if (serviceTypeFilter !== 'all') {
      filtered = filtered.filter((service: ServiceItem) => service.service_type === serviceTypeFilter);
    }
    const startIndex = (currentPage - 1) * pageSize;
    return filtered.map((service: ServiceItem) => ({
      ...service,
      id: service._id 
    })).slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, servicesList, serviceTypeFilter]);

  return (
    <div className="mb-6">
      <Toaster/>
      <div className="py-2 px-4 bg-white rounded-md border-[#E5E9F0] flex justify-between items-center">
        <h1 className="text-lg font-medium mb-0 text-[#344054]">Service costs</h1>
        <div className="relative">
          <button
            onClick={() => setFilterOpen((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 text-[#667085] bg-[#F9FAFB] rounded-lg border border-[#E5E9F0] hover:bg-gray-50 focus:outline-none"
          >
            <span>{serviceTypeFilter === 'all' ? 'All Types' : serviceTypeFilter.charAt(0).toUpperCase() + serviceTypeFilter.slice(1)}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {filterOpen && (
            <div
              ref={filterRef}
              className="absolute border border-gray-200 min-h-[80px] w-[180px] bg-white rounded-md right-0 top-full mt-2 z-50 p-2 text-[14px] shadow-lg"
            >
              <p className="text-[14px] text-left text-gray-400 mb-2">Filter by type</p>
              {[
                { id: 'all', title: 'All Types' },
                { id: 'private', title: 'Private' },
                { id: 'commercial', title: 'Commercial' },
              ].map((el) => (
                <div
                  onClick={() => {
                    setServiceTypeFilter(el.id as 'all' | 'private' | 'commercial');
                    setFilterOpen(false);
                  }}
                  key={el.id}
                  className={`flex gap-2 items-center mb-1 cursor-pointer hover:bg-gray-500/20 hover:border border-transparent border hover:border-gray-400 transition-all duration-300 p-2 rounded-md font-[500] text-gray-500 ${serviceTypeFilter === el.id && "bg-gray-500/20 border border-gray-400 text-gray-700"}`}
                >
                  <div>{el.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Table
        columns={columns}
        data={paginatedData}
        pagination={servicesList?.data?.length > pageSize ? {
          current: currentPage,
          pageSize: pageSize,
          total: servicesList.data.length,
          onChange: handlePageChange,
        } : undefined}
      />

      {showDeleteModal && serviceToDelete && (
        <DeleteConfirmationModal
          itemName={serviceToDelete.name}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          loading={isDeleting}
        />
      )}

      {showEditModal && serviceToEdit && (
        <EditServiceCostForm
          onClose={handleCloseEditModal}
          serviceData={serviceToEdit}
        />
      )}
    </div>
  );
};

export default ServiceCostTable; 