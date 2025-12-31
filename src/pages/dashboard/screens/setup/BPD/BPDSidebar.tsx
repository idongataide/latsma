import { axiosAPIInstance } from '@/api/interceptor';
import { getBisProcess } from '@/api/settingsApi';
import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaFile, FaTrash } from 'react-icons/fa';
import { FiUploadCloud } from 'react-icons/fi';
import ConfirmOperator from '@/pages/dashboard/screens/setup/2FA';

interface BPDSidebarProps {
  open: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  initialData?: { _id: string; name: string; size?: string; file?: string } | null;
  onFinish?: (bizId: string) => void;
  mutate?: () => void;
}

const BPDSidebar: React.FC<BPDSidebarProps> = ({ open, onClose, mode, initialData, onFinish, mutate }) => {
  const [docName, setDocName] = useState(initialData?.name || '');
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(
    initialData && initialData.size ? { name: initialData.name, size: initialData.size } : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'add') {
        setDocName('');
        setFile(null);
        setFileInfo(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else if (mode === 'edit' && initialData) {
        setDocName(initialData.name || '');
        if (initialData.file) {
          setFileInfo({
            name: initialData.name,
            size: 'Existing file'
          });
        }
      }
    }
  }, [open, mode, initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const ext = f.name.split('.').pop()?.toUpperCase() || 'FILE';
      setFile(f);
      setFileInfo({ name: f.name, size: `${ext} • ${(f.size / 1024).toFixed(1)}Kb` });
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    if (!docName.trim()) {
      toast.error('Please enter a document name');
      return;
    }

    // Only require a file if adding, or if editing and no file exists
    if (mode === 'add' && !file) {
      toast.error('Please upload a file');
      return;
    }
    if (mode === 'edit' && !file && !fileInfo) {
      toast.error('Please upload a file');
      return;
    }

    setShowOtpModal(true);
  };
  const handleOtpSuccess = async (otp: string) => {
    setIsLoading(true);
    try {
      let bizId = initialData?._id; // Assuming initialData has _id for edit mode
      
      // For edit mode, first update the document name using PUT
      if (mode === 'edit' && bizId) {
        const updateResponse = await getBisProcess(
          { doc_name: docName, otp: otp },
          'edit',
          bizId
        );
        
        if (updateResponse && updateResponse?.status === 'ok') {
          bizId = updateResponse?.data?._id || bizId;
        } else {
          throw new Error(updateResponse?.response?.data?.msg || 'Failed to update document name');
        }
      }
      // For add mode, create the document first
      else if (mode === 'add') {
        const createResponse = await getBisProcess(
          { doc_name: docName, otp: otp },
          'add'
        );
        
        if (createResponse && createResponse?.status === 'ok') {
          bizId = createResponse?.data?._id;
        } else {
          throw new Error(createResponse?.response?.data?.msg || 'Failed to create document');
        }
      }
  
      // If there's a file to upload (for both add and edit modes)
      if (file && bizId) {
        const formData = new FormData();
        formData.append('file', file);
  
        // Always use POST for file upload
        const uploadResponse = await axiosAPIInstance.post(
          `/users/biz-image/${bizId}`, 
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Accept': 'application/form-data'
            },
          }
        );
  
        if (uploadResponse?.data?.status === 'ok') {
          toast.success(`File ${mode === 'edit' ? 'Updated' : 'Uploaded'} Successfully`);
          mutate?.();
          if (bizId) onFinish?.(bizId);
          onClose();
        } else {
          throw new Error(uploadResponse?.data?.msg || `Failed to ${mode === 'edit' ? 'update' : 'upload'} file`);
        }
      } else if (mode === 'edit') {
        // If in edit mode and no file was selected, just consider it successful
        toast.success('Document updated successfully');
        mutate?.();
        if (bizId) onFinish?.(bizId);
        onClose();
      }
    } catch (error: any) {
      console.error('Error saving document:', error);
      toast.error(error.message || `Failed to ${mode === 'edit' ? 'update' : 'upload'}`);
    } finally {
      setShowOtpModal(false);
      setIsLoading(false);
    }
  };
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[999] flex justify-end bg-[#38383880] p-5 bg-opacity-50" onClick={onClose}>
        <div
          className="md:w-[48%] lg:w-1/3 w-100 z-[9999] h-full bg-white rounded-xl slide-in overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-full bg-white rounded-xl overflow-hidden ">
            <div className="flex justify-between items-center py-3 px-6 border-b border-[#D6DADD]">
              <h2 className="text-md font-semibold text-[#1C2023]">
                {mode === 'edit' ? 'Edit Process document' : 'Add new document'}
              </h2>
              <button
                onClick={onClose}
                className="text-[#7D8489] bg-[#EEF0F2] cursor-pointer py-2 px-3 rounded-3xl hover:text-black"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex flex-col mt-6 h-[calc(100vh-160px)] px-7 py-4">
              <div className="form-section mb-4">
                <h3 className="text-md font-medium text-[#475467] mb-3">
                  {mode === 'edit' ? 'Document name' : 'Business process document'}
                </h3>
                <div className="border border-[#F2F4F7] p-3 rounded-lg mb-4">
                  <label className="block text-[#475467] font-medium mb-2">Document name</label>
                  <input
                    type="text"
                    className="w-full border border-[#E5E9F0] rounded-md px-4 py-2"
                    placeholder={mode === 'edit' ? 'Document name' : 'Enter details'}
                    value={docName}
                    onChange={e => setDocName(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block font-medium text-[#475467] mb-2">Upload BPD document</label>
                  <div className="border -border-[0.6] border-dashed border-[#FFBB9E] rounded-lg p-4 py-5 flex items-center gap-4 min-h-[60px]">
                    {fileInfo ? (
                      <>
                        <FaFile className="text-red-500 text-2xl" />
                        <div className="flex-1">
                          <div className="font-medium text-[#475467]">{fileInfo.name}</div>
                          <div className="text-xs text-[#667085]">{fileInfo.size}</div>
                        </div>
                        <button onClick={handleRemoveFile} className="text-[#C21E1E] ml-2">
                          <FaTrash />
                        </button>
                      </>
                    ) : (
                      <>
                        <label className="flex-1 cursor-pointer" htmlFor="bpd-upload">
                          <div className='flex'>
                              <div className='bg-[#FFF0EA] h-10 w-10 items-center flex justify-center rounded-full p-2 me-2'>
                                  <FiUploadCloud className='text-[#FF6C2D]'/>
                              </div>
                              <div className='flex flex-col'>
                                  <span className="text-[#475467] font-medium">Click to upload</span>
                                  <span className="text-xs text-[#667085]">Any file type | 2mb max.</span>                            
                              </div>
                          </div>                         
                          <input
                            id="bpd-upload"
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                        <button
                          className="px-3 py-2 bg-[#FF6C2D] text-white rounded-md"
                          onClick={() => fileInputRef.current?.click()}
                          type="button"
                        >
                          Upload
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <button
                  className="mt-4 px-10 bg-[#FF6C2D] cursor-pointer text-white py-3 rounded-md font-medium disabled:opacity-50"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showOtpModal && (
        <ConfirmOperator
          onClose={() => setShowOtpModal(false)}
          onSuccess={handleOtpSuccess}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default BPDSidebar; 