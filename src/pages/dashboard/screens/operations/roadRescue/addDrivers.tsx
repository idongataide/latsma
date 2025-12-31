import React, { useState, useRef } from 'react';
import { Button, Form, Input, DatePicker } from 'antd';
import { addDrivers, bulkUploadDrivers } from '@/api/operatorsApi';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import moment from 'moment';
import { MdOutlineCloudUpload } from 'react-icons/md';
import { useSWRConfig } from 'swr';

interface AddDriverProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onDriverAdded?: () => void;
}

const AddDriver: React.FC<AddDriverProps> = ({ showModal, setShowModal, onDriverAdded }) => {
  const [form] = Form.useForm();
  const { id: operatorId } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const { mutate: globalMutate } = useSWRConfig();

  const handleClose = () => {
    setShowModal(false);
    form.resetFields();
    setLoading(false);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

  const handleBulkUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    if (!operatorId) {
      toast.error('Operator ID is missing from the URL.');
      return;
    }

    setUploadLoading(true);
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
        if (onDriverAdded) onDriverAdded();
      } else {
        console.log(response);
        toast.error(response?.data?.message || 'Upload failed');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload drivers');
    } finally {
      setUploadLoading(false);
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

  const handleFinish = async (values: any) => {
    if (!operatorId) {
      toast.error('Operator ID is missing from the URL.');
      return;
    }

    setLoading(true);

    const payload = {
      first_name: values.firstName,
      last_name: values.lastName,
      phone_number: values.phone,
      expiry_date: values.expirationDate ? moment(values.expirationDate).format('YYYY-MM-DD') : undefined,
      operator_id: operatorId,
      driver_license: values.licenseNumber,
    };

    try {
      const response = await addDrivers(payload);
      console.log('Add Driver API Response:', response);

      if (response?.status !== 'ok') {
        toast.error(response?.response?.data?.msg || 'Failed to add driver.');
      } else {
        toast.success('Driver added successfully!');
        handleClose();
        if (onDriverAdded) onDriverAdded();
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while adding driver.');
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[999] flex justify-end bg-[#38383880] p-5 bg-opacity-50" onClick={handleClose}>
      <div className="md:w-[65%] lg:w-1/3 w-100 z-[9999] h-full bg-white rounded-xl slide-in overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center py-3 px-6">
          <h2 className="text-md font-semibold mb-0 text-[#1C2023]">Add Driver</h2>
          <button
            onClick={handleClose}
            className="text-[#7D8489] bg-[#EEF0F2] cursor-pointer py-2 px-3 rounded-3xl hover:text-black"
          >
            ✕
          </button>
        </div>
        <div className='overflow-y-auto flex flex-col border-t border-[#D6DADD] justify-between mb-5 h-[87%] slide-in scrollbar-hide hover:scrollbar-show'>
          <div className="px-10 pt-3 mt-8">
            <div className="text-[#475467] font-medium mb-4">Add Driver</div>
            <div className="border border-[#E5E9F0] rounded-xl p-4 mb-6">
              <div className="bg-[#FCFCFD] border border-[#F2F4F7] rounded-xl p-6 ">
                {/* <div className="flex items-center gap-4 mb-2">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FFF3ED]">
                    <MdOutlineCloudUpload className="text-[#FF6C2D] text-2xl" />
                  </span>
                  <div>
                    <div className="text-[#475467] font-medium text-base">Upload Drivers</div>
                    <div className="text-[#667085] text-sm">Upload a CSV file to add drivers</div>
                  </div>
                </div> */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center bg-[#fff] gap-3 cursor-pointer px-4 py-5 rounded-xl border-[0.6px] text-left border-dashed border-[#FF9D72]"
                >
                  <span className="bg-[#FFF0EA] rounded-full p-4">
                    <MdOutlineCloudUpload className="text-[#FF6C2D]" />
                  </span>
                  <span>
                    <div className="font-medium text-[16px] text-[#475467]">
                      {file ? file.name : 'Click to upload'}
                    </div>
                    <div className="text-[10px] text-[#667085]">CSV file, 3MB max.</div>
                  </span>
                  <span 
                    className={`text-md text-[#fff] ml-auto rounded-md px-4 py-2 font-medium ${
                      uploadLoading ? 'bg-gray-400' : 'bg-[#FF6C2D]'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBulkUpload();
                    }}
                  >
                    {uploadLoading ? 'Uploading...' : 'Upload'}
                  </span>
                </button>
              </div>
              <div className="text-[#475467] text-sm mt-2">
                Get a template to upload drivers.{' '}
                <span 
                  className="text-[#FF6C2D] underline font-medium cursor-pointer"
                  onClick={handleDownloadTemplate}
                >
                  Download now
                </span>
              </div>
            </div>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
            >
              <Form.Item
                label="First name"
                name="firstName"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input placeholder="Enter details" />
              </Form.Item>
              <Form.Item
                label="Last name"
                name="lastName"
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input placeholder="Enter details" />
              </Form.Item>
              <Form.Item
                label="Phone number"
                name="phone"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input addonBefore={<span className="flex items-center"><img src="https://flagcdn.com/ng.svg" alt="NG" style={{ width: 20, marginRight: 4 }} />NG </span>} placeholder="Enter details" />
              </Form.Item>
              <Form.Item
                label="Driver license number"
                name="licenseNumber"
                rules={[{ required: true, message: 'Please enter license number' }]}
              >
                <Input placeholder="Enter details" />
              </Form.Item>
              <Form.Item
                label="Expiration date"
                name="expirationDate"
                rules={[{ required: true, message: 'Please select expiration date' }]}
              >
                <DatePicker className='!h-[42px]' style={{ width: '100%' }} placeholder="Select" />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  disabled={loading}
                  className="h-[46px]! px-10! mt-5! rounded-lg bg-[#FF6C2D] text-white font-medium text-lg hover:bg-[#E55B1F] transition border-0"
                >
                  Proceed
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDriver;