import React, { useState } from 'react';
import { Form, Input, Button, Select } from 'antd';
import ConfirmOperator from '@/pages/dashboard/screens/setup/2FA';
import toast from 'react-hot-toast';
import { useSWRConfig } from 'swr';
import { addService } from '@/api/settingsApi';
import { useAllOperators } from '@/hooks/useAdmin';


interface AddServiceCostFormProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceAdded?: () => void;
}

interface FormValues {
  name: string;
  amount: string;
  type: 'Private' | 'Commercial';
  operator_id?: string;
}

const AddServiceCostForm: React.FC<AddServiceCostFormProps> = ({
  isOpen,
  onClose,
  onServiceAdded,
}) => {
  const [form] = Form.useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [type, setType] = useState<'Private' | 'Commercial'>('Private');
  const { data: operators, isLoading: isLoadingOperators } = useAllOperators();

  const { mutate: globalMutate } = useSWRConfig();

  const handleFinish = async (values: Omit<FormValues, 'type'>) => {
    setFormValues({...values, type});
    setShow2FA(true);
  };

  const handle2FASuccess = async (otp: string) => {
    if (!formValues) return;

    try {
      setIsSubmitting(true);
      const response = await addService({
        name: formValues.name,
        amount: formValues.amount,
        type: formValues.type,
        operator_id: formValues.operator_id,
        otp: otp,
      });

      if (response?.status === 'ok') {
        toast.success('Service cost added successfully');
        globalMutate('/settings/services');
        globalMutate('/settings/services?component=count');
        onServiceAdded?.();
        onClose();
      } else {
        const errorMsg = response?.response?.data?.msg;
        toast.error(errorMsg || 'Failed to add service cost');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An error occurred while adding service cost');
    } finally {
      setIsSubmitting(false);
      setShow2FA(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 z-[999] flex justify-end bg-[#38383880] p-5 bg-opacity-50" onClick={onClose}>
        <div className="md:w-[48%] lg:w-1/3 w-100 z-[9999] h-full bg-white rounded-xl slide-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="h-full bg-white rounded-xl overflow-hidden">
            <div className="flex justify-between items-center py-3 px-6 border-b border-[#D6DADD]">
              <h2 className="text-md font-semibold text-[#1C2023]">Add service</h2>
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
                    <h3 className="text-md font-medium text-[#475467] mb-3">Enter required details</h3>
                    <div className='border border-[#F2F4F7] p-3 rounded-lg'>

                      <Form.Item
                        name="operator_id"
                        label="Operator"
                      >
                        <Select
                          placeholder="Select operator"
                          className="!h-[42px] "
                          loading={isLoadingOperators}
                          allowClear
                        >
                          {operators?.map((operator: any) => (
                            <Select.Option key={operator.assetco_id} className="capitalize" value={operator.assetco_id}>
                              {operator.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      
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

                      

                      <Form.Item
                        name="type"
                        label="Service type"
                      >
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={`flex-1 py-2 rounded-lg border text-base font-medium transition ${type === 'Private' ? 'bg-[#FFF3ED] border-[#FF6C2D] text-[#FF6C2D]' : 'bg-white border-[#D0D5DD] text-[#667085]'}`}
                            onClick={() => setType('Private')}
                          >
                            Private
                          </button>
                          <button
                            type="button"
                            className={`flex-1 py-2 rounded-lg border text-base font-medium transition ${type === 'Commercial' ? 'bg-[#FFF3ED] border-[#FF6C2D] text-[#FF6C2D]' : 'bg-white border-[#D0D5DD] text-[#667085]'}`}
                            onClick={() => setType('Commercial')}
                          >
                            Commercial
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

      {show2FA && formValues && (
        <ConfirmOperator
          onClose={() => setShow2FA(false)}
          onSuccess={handle2FASuccess}
        />
      )}
    </>
  );
};

export default AddServiceCostForm; 