import React, { useState } from 'react';
import { Table, type ColumnDefinition } from '@/components/ui/Table';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { MdOutlineEdit } from "react-icons/md";
import { getStatusStyle } from '@/components/ui/statusStyles';
import AddAsset from './addAssets';
import EditAsset from './editAsset';
import { useAssetsByOperatorId } from '@/hooks/useAdmin';
import { deleteAsset } from '@/api/operatorsApi';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';


interface Vehicle {
  id: string;
  asset_id: string;
  operator_id: string;
  brand_name: string;
  vehicle_model: string;
  plate_number: string;
  availability: 'Available' | 'Unavailable';
  status: 'Enroute' | 'At rest';
  action?: string;
}

const VehicleAssets: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [showEditAssetModal, setShowEditAssetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Vehicle | null>(null);
  const [assetToEdit, setAssetToEdit] = useState<Vehicle | null>(null);
  const { id } = useParams<{ id: string }>();

  const { data : allAssets, mutate } = useAssetsByOperatorId(id || '')


  const handleEdit = (vehicle: Vehicle) => {
    setAssetToEdit(vehicle);
    setShowEditAssetModal(true);
  };

  const handleDelete = (vehicle: Vehicle) => {
    setAssetToDelete(vehicle);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (assetToDelete) {
      try {
        const response = await deleteAsset(assetToDelete.asset_id);
        if (response?.status !== 'ok') {
          toast.error(response?.response?.data?.msg || 'Failed to delete asset.');
        } else {
          toast.success('Asset deleted successfully!');
          mutate();
        }
      } catch (error: any) {
        toast.error(error.message || 'An error occurred while deleting asset.');
      } finally {
        setShowDeleteModal(false);
        setAssetToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAssetToDelete(null);
  };

  const columns: Array<ColumnDefinition<Vehicle>> = [
    {
      title: "Vehicle brand name",
      dataIndex: "brand_name",
      key: "brand_name",
      render: (value) => (
        <span className="text-[#475467] font-medium">{value}</span>
      ),
    },
    {
      title: "Vehicle model",
      dataIndex: "vehicle_model",
      key: "vehicle_model",
      render: (value) => (
        <span className="text-[#475467] font-medium">{value}</span>
      ),
    },
    {
      title: "Number plate",
      dataIndex: "plate_number",
      key: "plate_number",
      render: (value) => (
        <span className="text-[#475467] font-medium">{value}</span>
      ),
    },
    {
      title: "Availability",
      dataIndex: "availability",
      key: "availability",
      render: (status: string) => (
        <span className={getStatusStyle(status)}>
          {status}
        </span>
      ),
    },
    {
      title: "Vehicle status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span className={getStatusStyle(status)}>
          {status}
        </span>
      ),
    },
    {
      title: "Actions",
      dataIndex: "action",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-4">
          <button 
            onClick={() => handleEdit(record)}
            className="text-[#667085] cursor-pointer flex items-center gap-2 hover:[##667085]"
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

  return (
    <div className="my-10">
      <div className="py-2 px-4 bg-white rounded-md border-[#E5E9F0] flex justify-between items-center">
        <h1 className="text-base font-medium mb-0 text-[#344054]">Saved assets ({allAssets?.length})</h1>
        <button 
          className="flex items-center gap-2 px-4 py-1 cursor-pointer text-[#667085] bg-[#F9FAFB] rounded-lg border border-[#E5E9F0] hover:bg-gray-50"
          onClick={() => setShowAddAssetModal(true)}
        >
            <FaPlus className='text-sm' />
            <span>Add new asset</span>          
        </button>
      </div>
      
      <Table
        columns={columns}
        data={allAssets?.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: allAssets?.length,
          onChange: handlePageChange,
        }}
        showActions
        onRowClick={(id) => console.log('Clicked row:', id)}
      />

      <AddAsset
        showModal={showAddAssetModal}
        setShowModal={setShowAddAssetModal}
        onAssetAdded={mutate}
      />

      {assetToEdit && (
        <EditAsset
          showModal={showEditAssetModal}
          setShowModal={setShowEditAssetModal}
          onAssetUpdated={mutate}
          assetData={assetToEdit}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center  bg-[#38383880] p-5 bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Delete Asset</h3>
            <p className="mb-6">
              You are about to delete {assetToDelete?.brand_name} {assetToDelete?.vehicle_model} with plate number {assetToDelete?.plate_number}. Are you sure you want to proceed?
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

export default VehicleAssets;