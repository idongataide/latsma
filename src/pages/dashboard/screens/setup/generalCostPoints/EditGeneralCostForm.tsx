import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select } from 'antd';
import { useGetFees } from '@/hooks/useAdmin';
import { updateFee } from '@/api/settingsApi';
import ConfirmOperator from '@/pages/dashboard/screens/setup/2FA';
import toast from 'react-hot-toast';
import { useSWRConfig } from 'swr';

interface FeeItem {
  name: string;
  tag: string;
  slug: string;
  amount: number;
  amount_type: string;
  amount_sufix: string;
  data: any[];
  createdAt: string;
  updatedAt: string;
  fee_id: string;
  id: string;
}

interface EditGeneralCostFormProps {
  onClose: () => void;
  feeData: FeeItem;
}

interface FormValues {
  amount: string;
  tag: string;
}

interface FeeVariable {
  name: string;
  tag: string;
}

const EditGeneralCostForm: React.FC<EditGeneralCostFormProps> = ({
  onClose,
  feeData,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const { data: feesVariables } = useGetFees('fee_variables');

  const { mutate: globalMutate } = useSWRConfig();

  useEffect(() => {
    if (feeData) {
      form.setFieldsValue({
        amount: feeData.amount,
        tag: feeData.tag,
      });
    }
  }, [feeData, form]);

  const handleFinish = async (values: FormValues) => {
    setFormValues(values);
    setShow2FA(true);
  };

  const handle2FASuccess = async (otp: string) => {
    if (!formValues || !feeData) return;

    try {
      setIsSubmitting(true);
      const response = await updateFee(feeData.fee_id, {
        amount: formValues.amount,
        tag: formValues.tag,
        otp: otp,
      });

      if (response.status === 'ok') {
        toast.success('Fee updated successfully');
        globalMutate('/settings/fees');
        globalMutate('/settings/fees?component=count');
        onClose();
      } else {
        const errorMsg = response?.response?.data?.msg;
        toast.error(errorMsg || 'Failed to update fee');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An error occurred while updating the fee');
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
                        name="tag"
                        label="Fee Type"
                        rules={[{ required: true, message: 'Please select a fee type!' }]}
                      >
                        <Select placeholder="Select" className='!h-[42px] capitalize'>
                          {feesVariables?.map((fee: FeeVariable) => (
                            <Select.Option key={fee.tag} className="capitalize" value={fee.tag}>
                              {fee.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        name="amount"
                        label="Amount"
                        rules={[{ required: true, message: 'Please enter amount!' }]}
                      >
                        <Input type="number" placeholder="Enter amount" className="!h-[42px]" />
                      </Form.Item>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 py-4 gap-3">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}
                    className="rounded-md h-[46px]! px-10! border border-transparent bg-[#FF6C2D] py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  >
                    Save
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>

      {show2FA && formValues && feeData && (
        <ConfirmOperator
          onClose={() => setShow2FA(false)}
          onSuccess={handle2FASuccess}
        />
      )}
    </>
  );
};

export default EditGeneralCostForm; 