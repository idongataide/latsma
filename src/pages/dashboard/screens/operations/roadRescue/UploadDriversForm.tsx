import React, { useState, useRef } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { bulkUploadDrivers } from '@/api/operatorsApi';
import { useSWRConfig } from 'swr';
import { useParams } from 'react-router-dom';

const UploadDriversForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: globalMutate } = useSWRConfig();
  const { operatorId } = useParams<{ operatorId: string }>();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    
    if (!selectedFile) return;

    // Check file type
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    // Check file size (3MB = 3 * 1024 * 1024 bytes)
    if (selectedFile.size > 3 * 1024 * 1024) {
      toast.error('File size should not exceed 3MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    if (!operatorId) {
      toast.error('Operator ID is required');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await bulkUploadDrivers(operatorId, formData);
      if (response?.data?.status === 'ok') {
        toast.success('Drivers uploaded successfully');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Mutate the drivers list to refresh data
        globalMutate(`users/drivers?operator_id=${operatorId}`);
      } else {
        console.log(response);
        toast.error(response?.data?.message || 'Upload failed');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ['first_name', 'last_name', 'phone_number', 'expiry_date', 'driver_license'];
    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drivers_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-12 h-[425px]">
      <h2 className="text-lg! font-medium text-[#667085] mb-7">CSV Document upload</h2>
      <p className="text-md text-[#475467] font-medium mb-4">
        Get a template to upload drivers.{' '}
        <span 
          className="text-[#FF6C2D] ml-2 cursor-pointer font-medium! underline"
          onClick={handleDownloadTemplate}
        >
          Download now
        </span>
      </p>
      
      <div className="mt-4">
        <div className="text-md text-[#475467] font-medium mb-2">Upload document</div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center bg-[#fff] gap-3 cursor-pointer px-4 py-5 mb-4 rounded-xl border-[0.6px] text-left border-dashed border-[#FF9D72]"
        >
          <span className="bg-[#FFF0EA] rounded-full p-4">
            <FaCloudUploadAlt className="text-[#FF6C2D]" />
          </span>
          <span>
            <div className="font-medium text-[16px] text-[#475467]">
              {file ? file.name : 'Click to upload'}
            </div>
            <div className="text-[10px] text-[#667085]">CSV file, 3MB max.</div>
          </span>
          <span 
            className={`text-md text-[#fff] ml-auto rounded-md px-4 py-2 font-medium ${
              loading ? 'bg-gray-400' : 'bg-[#FF6C2D]'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleUpload();
            }}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default UploadDriversForm; 