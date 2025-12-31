import React, { useState, useEffect } from 'react';
import { Form, Input, Button } from 'antd'; // Remove Select
import ConfirmOperator from '@/pages/dashboard/screens/setup/2FA';
import toast from 'react-hot-toast';
import { useSWRConfig } from 'swr';
import { updateService } from '@/api/settingsApi';

interface ServiceItem {
  _id: string;
  name: string;
  amount: number;
  service_type: 'private' | 'commercial';
  createdAt: string;
  updatedAt: string;
  id: string;
  service_id: string;
}

interface EditServiceCostFormProps {
  onClose: () => void;
  serviceData: ServiceItem;
}

interface FormValues {
  name: string;
  amount: string;
  type: 'private' | 'commercial';
}

const EditServiceCostForm: React.FC<EditServiceCostFormProps> = ({
  onClose,
  serviceData,
}) => {
  const [form] = Form.useForm<Omit<FormValues, 'type'> & { type: 'private' | 'commercial' }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [type, setType] = useState<'private' | 'commercial'>(serviceData.service_type);

  const { mutate: globalMutate } = useSWRConfig();

  useEffect(() => {
    if (serviceData) {
      form.setFieldsValue({
        name: serviceData.name,
        amount: String(serviceData.amount),
        type: serviceData.service_type,
      });
      setType(serviceData.service_type);
    }
  }, [serviceData, form]);

  const handleFinish = async (values: Omit<FormValues, 'type'>) => {
    setFormValues({...values, type});
    setShow2FA(true);
  };

  const handle2FASuccess = async (otp: string) => {
    if (!formValues || !serviceData) return;

    try {
      setIsSubmitting(true);
      const response = await updateService(serviceData.service_id, {
        name: formValues.name,
        amount: formValues.amount,
        type: formValues.type,
        otp: otp,
      });

      if (response?.status === 'ok') {
        toast.success('Service cost updated successfully');
        globalMutate('/settings/services'); // Invalidate the cache for services list
        onClose();
      } else {
        const errorMsg = response?.response?.data?.msg;
        toast.error(errorMsg || 'Failed to update service cost');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An error occurred while updating service cost');
    } finally {
      setIsSubmitting(false);
      setShow2FA(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[999] flex justify-end bg-[#38383880] p-5 bg-opacity-50" onClick={onClose}>
        <div className="md:w-[48%] lg:w-1/3 w-100 z-[9999] h-full bg-white rounded-xl slide-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="h-full bg-white rounded-xl overflow-hidden">
            <div className="flex justify-between items-center py-3 px-6 border-b border-[#D6DADD]">
              <h2 className="text-md font-semibold text-[#1C2023]">Edit service</h2>
              <button
                onClick={onClose}
                className="text-[#7D8489] bg-[#EEF0F2] cursor-pointer py-2 px-3 rounded-3xl hover:text-black"
              >
                ✕
              </button>
            </div>
            <div className='overflow-y-auto flex flex-col h-[calc(100vh-160px)] slide-in scrollbar-hide hover:scrollbar-show px-7 py-4'>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                className="flex flex-col justify-between flex-grow"
              >
                <div>
                  <div className="form-section mb-4">
                    <h3 className="text-md font-medium text-[#475467] mb-3">Edit details</h3>
                    <div className='border border-[#F2F4F7] p-3 rounded-lg'>
                      <Form.Item
                        name="name"
                        label="Service Name"
                        rules={[{ required: true, message: 'Please enter service name!' }]}
                      >
                        <Input placeholder="Enter details" className="!h-[42px]" />
                      </Form.Item>

                      <Form.Item
                        name="amount"
                        label="Amount"
                        rules={[
                          { required: true, message: 'Please enter amount!' },
                          { type: 'number', transform: (value) => Number(value), message: 'Please enter a valid number!' }
                        ]}
                      >
                        <Input type="number" placeholder="Enter details" className="!h-[42px]" />
                      </Form.Item>

                      <Form.Item // Reverted to original format
                        name="type"
                        label="Service type"
                      >
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={`flex-1 py-2 rounded-lg border text-base cursor-pointer capitalize font-medium transition ${type === 'private' ? 'bg-[#FFF3ED] border-[#FF6C2D] text-[#FF6C2D]' : 'bg-white border-[#D0D5DD] text-[#667085]'}`}
                            onClick={() => setType('private')}
                          >
                            Private
                          </button>
                          <button
                            type="button"
                            className={`flex-1 py-2 rounded-lg border cursor-pointer text-base capitalize font-medium transition ${type === 'commercial' ? 'bg-[#FFF3ED] border-[#FF6C2D] text-[#FF6C2D]' : 'bg-white border-[#D0D5DD] text-[#667085]'}`}
                            onClick={() => setType('commercial')}
                          >
                            commercial
                          </button>
                        </div>
                      </Form.Item>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 py-4 flex justify-end gap-3">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}
                    className="rounded-md h-[46px]! px-10! border border-transparent bg-[#FF6C2D] py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus::ring-orange-500 focus:ring-offset-2"
                  >
                    Save
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>

      {show2FA && formValues && serviceData && (
        <ConfirmOperator
          onClose={() => setShow2FA(false)}
          onSuccess={handle2FASuccess}
        />
      )}
    </>
  );
};

export default EditServiceCostForm; 