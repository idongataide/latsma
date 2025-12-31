import React, { useState, useEffect } from 'react';
import { Button, Form, Input, DatePicker } from 'antd';
import { updateDriver } from '@/api/operatorsApi';
import toast from 'react-hot-toast';
import ConfirmOperator from '@/pages/dashboard/screens/operations/2FA';
import dayjs from 'dayjs';

interface EditDriverProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onDriverUpdated?: () => void;
  driverData: {
    driver_id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    expiry_date: string;
    driver_license_id: {
      value: string;
      status: number;
    };
  };
}

const EditDriver: React.FC<EditDriverProps> = ({ showModal, setShowModal, onDriverUpdated, driverData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [formValues, setFormValues] = useState<any>(null);

  useEffect(() => {
    if (showModal && driverData) {
      form.setFieldsValue({
        firstName: driverData.first_name,
        lastName: driverData.last_name,
        phoneNumber: driverData.phone_number,
        licenseNumber: driverData.driver_license_id.value,
        expiryDate: dayjs(driverData.expiry_date)
      });
    }
  }, [showModal, driverData, form]);

  const handleClose = () => {
    setShowModal(false);
    form.resetFields();
    setLoading(false);
    setShow2FA(false);
    setFormValues(null);
  };

  const handleFinish = async (values: any) => {
    setFormValues(values);
    setShow2FA(true);
  };

  const handle2FASuccess = async (otp: string) => {
    if (!formValues) return;

    setLoading(true);
    
    const payload = {
      first_name: formValues.firstName,
      last_name: formValues.lastName,
      phone_number: formValues.phoneNumber,
      driver_license_id: formValues.licenseNumber,
      expiry_date: formValues.expiryDate.format('YYYY-MM-DD'),
      otp: otp
    };

    try {
      const response = await updateDriver(driverData.driver_id, payload);
      if (response?.status !== 'ok') {
        toast.error(response?.response?.data?.msg || 'Failed to update driver.');
      } else {
        toast.success('Driver updated successfully!');
        handleClose();
        if (onDriverUpdated) onDriverUpdated();
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while updating driver.');
    } finally {
      setLoading(false);
      setShow2FA(false);
      setFormValues(null);
    }
  };

  if (!showModal) return null;

  return (
    <>
      <div className="fixed inset-0 z-[999] flex justify-end bg-[#38383880] p-5 bg-opacity-50" onClick={handleClose}>
        <div className="md:w-[48%] lg:w-1/3 w-100 z-[9999] h-full bg-white rounded-xl slide-in overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center py-3 px-6">
            <h2 className="text-md font-semibold mb-0 text-[#1C2023] capitalize">Edit driver</h2>
            <button
              onClick={handleClose}
              className="text-[#7D8489] bg-[#EEF0F2] cursor-pointer py-2 px-3 rounded-3xl hover:text-black"
            >
              ✕
            </button>
          </div>
          <div className='overflow-y-auto flex flex-col border-t border-[#D6DADD] justify-between mb-5 h-[87%] slide-in scrollbar-hide hover:scrollbar-show'>
            <div className="px-10 pt-3 mt-8">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                className="space-y-4"
              >
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[{ required: true, message: 'Please enter first name!' }]}
                >
                  <Input className="h-[42px]" placeholder="Enter first name" />
                </Form.Item>

                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[{ required: true, message: 'Please enter last name!' }]}
                >
                  <Input className="h-[42px]" placeholder="Enter last name" />
                </Form.Item>

                <Form.Item
                  label="Phone Number"
                  name="phoneNumber"
                  rules={[{ required: true, message: 'Please enter phone number!' }]}
                >
                  <Input className="h-[42px]" placeholder="Enter phone number" />
                </Form.Item>

                <Form.Item
                  label="License Number"
                  name="licenseNumber"
                  rules={[{ required: true, message: 'Please enter license number!' }]}
                >
                  <Input className="h-[42px]" placeholder="Enter license number" />
                </Form.Item>

                <Form.Item
                  label="License Expiry Date"
                  name="expiryDate"
                  rules={[{ required: true, message: 'Please select expiry date!' }]}
                >
                  <DatePicker 
                    className="h-[42px]! w-full" 
                    format="YYYY-MM-DD"
                    placeholder="Select expiry date"
                  />
                </Form.Item>

                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    onClick={handleClose}
                    className="px-4 py-2 rounded-lg h-[42px]! cursor-pointer border border-[#D0D5DD] text-[#344054] font-medium hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="px-4 py-2 rounded-lg h-[42px]! cursor-pointer bg-[#FF6C2D] text-white font-medium hover:bg-[#E55B1F]"
                  >
                    Update
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>

      {show2FA && (
        <ConfirmOperator
          onClose={() => setShow2FA(false)}
          onSuccess={handle2FASuccess}
        />
      )}
    </>
  );
};

export default EditDriver; 