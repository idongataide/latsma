import React, { useState } from 'react';
import { FaFile } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaAngleLeft, FaUsers, FaPlus } from 'react-icons/fa';
import BPDSidebar from './BPDSidebar';
import { Toaster } from 'react-hot-toast';
import { useGetProcess } from '@/hooks/useAdmin';
import LoadingScreen from '@/pages/dashboard/common/LoadingScreen';
import { deleteBisProcess } from '@/api/settingsApi';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface BPDDocument {
  name: string;
  file: string;
  createdAt: string;
  updatedAt: string;
  biz_id: string;
}

const BPDListing: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'add' | 'edit'>('add');
  const [editDoc, setEditDoc] = useState<BPDDocument | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<BPDDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: BizList, isLoading, mutate } = useGetProcess();

  const handleAddNew = () => {
    setEditDoc(null);
    setSidebarMode('add');
    setSidebarOpen(true);
  };

  const handleEdit = (doc: BPDDocument) => {
    setEditDoc(doc);
    setSidebarMode('edit');
    setSidebarOpen(true);
    setMenuOpenId(null);
  };

  const handleDeleteClick = (doc: BPDDocument) => {
    setDocToDelete(doc);
    setDeleteConfirmOpen(true);
    setMenuOpenId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);

    try {
      const response = await deleteBisProcess(docToDelete.biz_id);
      if (response?.status === 'ok') {
        toast.success('Document deleted successfully');
        mutate();
      } else {
        toast.error(response?.message || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setDocToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setDocToDelete(null);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setEditDoc(null);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-6">
      <Toaster/>
      <div className="py-1- px-6-">
        <div 
          className="flex items-center mb-5 mt-10 cursor-pointer"
          onClick={() => window.history.back()}
        >
          <FaAngleLeft className='text-lg text-[#667085]' />
          <p className='ml-2 font-bold text-[#667085] text-lg'>Back</p>
        </div>
        <div className="bg-image rounded-lg sm border border-[#E5E9F0] p-6 mb-6 relative overflow-hidden ">
          <div className="relative z-10 flex justify-between items-center py-5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-[#FFF0EA] rounded-full p-2">
                <FaUsers className="text-[#FF6C2D]" />
              </div>
              <div className="ml-2">
                <h2 className="text-[26px] font-bold text-[#475467] mb-1">{BizList?.length || 0}</h2>
                <p className="text-[#667085] text-md font-medium">Business process docs</p>
              </div>
            </div>
            <button
              className="flex cursor-pointer items-center gap-2 px-4 py-2 text-[16px] bg-[#FF6C2D] text-white rounded-lg hover:bg-[#FF6C2D] transition-colors"            
              onClick={handleAddNew}
            >
              <FaPlus className="text-white" />
              <span> Add new</span>
            </button>
          </div>
        </div>
      </div>

      {deleteConfirmOpen && docToDelete && (
        <DeleteConfirmationModal
          itemName={docToDelete.name}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          loading={isDeleting}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BizList?.map((doc: BPDDocument) => (
          <div
            key={doc.biz_id}
            className="flex items-center border border-[#E5E9F0] rounded-lg p-4 bg-white relative"
          >
            <FaFile className="text-[#FF6C2D] text-2xl mr-3" />
            <div className="flex-1">
              <div className="font-medium capitalize text-[16px] text-[#475467]">{doc.name}</div>
              <div className="text-xs font-md text-[#667085]">
                {doc.file ? (
                  <div className='flex items-center'>
                     <a 
                        href={doc.file} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#FF6C2D] hover:underline"
                    >
                        View File
                    </a>
                    <div className="text-xs  text-[#667085] ml-3">
                        Created: {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                  </div>  
                 
                ) : (
                  'No file uploaded'
                )}
              </div>              
            </div>
            <button
              className="ml-2 cursor-pointer"
              onClick={() => setMenuOpenId(menuOpenId === doc.biz_id ? null : doc.biz_id)}
            >
              <BsThreeDotsVertical />
            </button>
            {menuOpenId === doc.biz_id && (
              <div className="absolute right-4 top-12 bg-white border border-[#E5E9F0] rounded shadow-xs z-10 w-90">
                <div
                  className="px-4 py-2 text-[#475467] text-[14px] cursor-pointer hover:bg-gray-100"
                  onClick={() => handleEdit(doc)}
                >
                  Edit document
                </div>
                <div
                  className="px-4 py-2 text-[#475467] text-[14px] cursor-pointer hover:bg-gray-100"
                  onClick={() => handleDeleteClick(doc)}
                >
                  Delete document
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <BPDSidebar
        open={sidebarOpen}
        onClose={handleCloseSidebar}
        mode={sidebarMode}
        initialData={
          editDoc
            ? { _id: editDoc.biz_id, name: editDoc.name, file: editDoc.file }
            : null
        }
        mutate={mutate}
      />
    </div>
  );
};

export default BPDListing; 