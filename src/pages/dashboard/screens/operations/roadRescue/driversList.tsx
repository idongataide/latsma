import React, { useState } from 'react';
import { Table, type ColumnDefinition } from '@/components/ui/Table';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { MdOutlineEdit } from "react-icons/md";
import AddDriver from './addDrivers';
import EditDriver from './editDriver';
import { useGetDriversByOperatorId } from '@/hooks/useAdmin';
import { deleteDriver } from '@/api/operatorsApi';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';


interface Driver {
  id: string;
  driver_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  expiry_date: string;
  driver_license_id: {
    value: string;
    status: number;
  };
  status: number;
  operator_id: string;
  data_mode: string;
  createdAt: string;
  updatedAt: string;
  action?: string;
}

const DriversList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showEditDriverModal, setShowEditDriverModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const [driverToEdit, setDriverToEdit] = useState<Driver | null>(null);
  const { id } = useParams<{ id: string }>();

  const { data: allDrivers, mutate } = useGetDriversByOperatorId(id || '');

  const handleEdit = (driver: Driver) => {
    setDriverToEdit(driver);
    setShowEditDriverModal(true);
  };

  const handleDelete = (driver: Driver) => {
    setDriverToDelete(driver);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (driverToDelete) {
      try {
        const response = await deleteDriver(driverToDelete.driver_id);

        if (response?.status !== 'ok') {
          toast.error(response?.response?.data?.msg || 'Failed to delete driver.');
        } else {
          toast.success('Driver deleted successfully!');
          mutate();
        }
      } catch (error: any) {
        toast.error(error.message || 'An error occurred while deleting driver.');
      } finally {
        setShowDeleteModal(false);
        setDriverToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDriverToDelete(null);
  };

  const columns: Array<ColumnDefinition<Driver>> = [
    {
      title: "Name",
      dataIndex: "first_name",
      key: "name",
      render: (_, record: Driver) => (
        <div className="flex items-center gap-2">
          <span className='font-medium text-[#475467]'>{`${record.first_name} ${record.last_name}`}</span>
        </div>
      ),
    },
    {
      title: "Phone number",
      dataIndex: "phone_number",
      key: "phone_number",
      render: (value: string) => (
        <span className="text-[#475467] font-medium">{value}</span>
      ),
    },
    {
      title: "License No.",
      dataIndex: "driver_license_id",
      key: "driver_license_id",
      render: (driverLicense: { value: string; status: number }) => (
        <span className="text-[#475467] font-medium">{driverLicense?.value}</span>
      ),
    },
    {
      title: "License Expiration date",
      dataIndex: "expiry_date",
      key: "expiry_date",
      render: (value: string) => (
        <span className="text-[#475467] font-medium">{value}</span>
      ),
    },
    {
      title: "Actions",
      dataIndex: "action",
      key: "actions",
      render: (_, record: Driver) => (
        <div className="flex gap-4">
          <button
            onClick={() => handleEdit(record)}
            className="text-[#667085] cursor-pointer flex items-center gap-2 hover:text-[#667085]"
          >
            <MdOutlineEdit /> Edit
          </button>
          <button
            onClick={() => handleDelete(record)}
            className="text-[#667085] cursor-pointer flex items-center gap-2 hover:text-[#667085]"
          >
            <FaTrash /> Delete
          </button>
        </div>
      ),
    },
  ];

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const tableData = allDrivers?.map((driver: Driver) => ({
    ...driver,
    id: driver.driver_id,
  })) || [];

  return (
    <div className="my-10">
      <div className="py-2 px-4 bg-white rounded-md border-[#E5E9F0] flex justify-between items-center">
        <h1 className="text-base font-medium mb-0 text-[#344054]">Driver ({allDrivers?.length || 0})</h1>
        <button
          className="flex items-center gap-2 px-4 py-1 cursor-pointer text-[#667085] bg-[#F9FAFB] rounded-lg border border-[#E5E9F0] hover:bg-gray-50"
          onClick={() => setShowAddDriverModal(true)}
        >
          <FaPlus className='text-sm' />
          <span>Add driver</span>
        </button>
      </div>

      <Table 
        columns={columns as ColumnDefinition<Driver>[]}
        data={tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        pagination={allDrivers && allDrivers.length > pageSize ? {
          current: currentPage,
          pageSize: pageSize,
          total: allDrivers.length,
          onChange: handlePageChange,
        } : undefined}
        showActions
        onRowClick={(id: string) => console.log('Clicked row:', id)}
      />

      <AddDriver
        showModal={showAddDriverModal}
        setShowModal={setShowAddDriverModal}
        onDriverAdded={mutate}
      />

      {driverToEdit && (
        <EditDriver
          showModal={showEditDriverModal}
          setShowModal={setShowEditDriverModal}
          onDriverUpdated={mutate}
          driverData={driverToEdit}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center  bg-[#38383880] p-5 bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Delete Driver</h3>
            <p className="mb-6">
              You are about to delete driver {driverToDelete?.first_name} {driverToDelete?.last_name}. Are you sure you want to proceed?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded-lg cursor-pointer border border-[#D0D5DD] text-[#344054] font-medium hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg cursor-pointer bg-[#FF6C2D] text-white font-medium hover:bg-[#E55B1F]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriversList;