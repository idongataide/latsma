import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select } from 'antd';
import { useBanksList } from '@/hooks/useAdmin';
import { verifyAccount } from '@/api/banks'; 
import toast from 'react-hot-toast';
import ConfirmOperator from '@/pages/dashboard/screens/setup/2FA';
import { updateStakeholder } from '@/api/settingsApi';

const { Option } = Select;

interface EditStakeholderFormProps {
  isOpen: boolean;
  onClose: () => void;
  editData: any;
  onStakeholderUpdated?: () => void;
}

interface Bank {
  name: string;
  code: string;
}

interface FormValues {
  name: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  amount: string;
  amount_type: 'percentage' | 'amount';
}

const EditStakeholderForm: React.FC<EditStakeholderFormProps> = ({
  isOpen,
  onClose,
  editData,
  onStakeholderUpdated,
}) => {
  const [form] = Form.useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [valueType, setValueType] = useState<'percentage' | 'amount'>('percentage');
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const [accountName, setAccountName] = useState<string | null>(editData?.account_name || null);

  const { data: bankList, isLoading: isLoadingBanks } = useBanksList();

  useEffect(() => {
    if (editData) {
      form.setFieldsValue({
        name: editData.name,
        bank_name: editData.bank_name,
        bank_code: editData.bank_code,
        account_number: editData.account_number,
        account_name: editData.account_name,
        amount: editData.amount,
        amount_type: editData.amount_type || 'percentage'
      });
      setValueType(editData.amount_type || 'percentage');
      setAccountName(editData.account_name);
    }
  }, [editData, form]);

  const handleVerifyAccount = async (accountNumber: string, bankName: string) => {
    if (!bankName || !accountNumber || accountNumber.length < 10) {
      setAccountName(null);
      form.setFieldsValue({ account_name: undefined });
      return;
    }

    const selectedBank = bankList?.find((bank: Bank) => bank.name === bankName);

    if (!selectedBank?.code) {
      toast.error('Could not find bank code for the selected bank.');
      setAccountName(null);
      form.setFieldsValue({ account_name: undefined });
      return;
    }

    setIsVerifyingAccount(true);
    setAccountName(null);
    form.setFieldsValue({ account_name: undefined });
    try {
      const payload = {
        account_number: accountNumber,
        bank_code: selectedBank.code
      };
      const response = await verifyAccount(payload);
      
      if (response?.status === 'ok') {
        const verifiedAccountName = response.data.data.account_name;
        setAccountName(verifiedAccountName);
        form.setFieldsValue({ account_name: verifiedAccountName });
        toast.success('Account name fetched successfully.');
      } else {
        toast.error(response?.response?.data?.msg || 'Failed to verify account.');
        setAccountName(null);
        form.setFieldsValue({ account_name: undefined });
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during verification.');
      setAccountName(null);
      form.setFieldsValue({ account_name: undefined });
    } finally {
      setIsVerifyingAccount(false);
    }
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const accountNumber = e.target.value;
    const digitsOnly = accountNumber.replace(/\D/g, '');
    form.setFieldsValue({ account_number: digitsOnly });
    setAccountName(null);

    const bankName = form.getFieldValue('bank_name');
    if (digitsOnly.length >= 10 && bankName) {
      handleVerifyAccount(digitsOnly, bankName);
    }
  };

  const handleBankNameChange = (value: string) => {
    const selectedBank = bankList?.find((bank: Bank) => bank.name === value);
    if(selectedBank) {
      form.setFieldsValue({ bank_name: value, bank_code: selectedBank.code });
    } else {
      form.setFieldsValue({ bank_name: value, bank_code: undefined });
    }
    setAccountName(null);

    const accountNumber = form.getFieldValue('account_number');
    if (accountNumber?.length >= 10 && selectedBank?.code) {
      handleVerifyAccount(accountNumber, value);
    }
  };

  const handleFinish = async (values: FormValues) => {
    if (!accountName) {
      toast.error('Please verify account number first');
      return;
    }

    form.setFieldsValue({ account_name: accountName });

    const finalValues = {
      ...values,
      amount_type: valueType,
      account_name: accountName
    };
    setFormValues(finalValues);
    setShow2FA(true);
  };

  const handle2FASuccess = async (otp: string) => {
    if (!formValues || !editData) return;

    try {
      setIsSubmitting(true);
      const stakeholderId = editData.id || editData.stakeholder_id;
      if (!stakeholderId) {
        toast.error('Stakeholder ID is missing');
        return;
      }

      const response = await updateStakeholder(stakeholderId, {
        ...formValues,
        otp: otp,
      });

      if (response?.status === 'ok') {
        toast.success('Stakeholder updated successfully');
        onStakeholderUpdated?.();
        onClose();
      } else {
        const errorMsg = response?.response?.data?.msg;
        toast.error(errorMsg || 'Failed to update stakeholder');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An error occurred while updating stakeholder');
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
              <h2 className="text-md font-semibold text-[#1C2023]">Edit stakeholder</h2>
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
                        name="name"
                        label="Stakeholder name"
                        rules={[{ required: true, message: 'Please enter name!' }]}
                      >
                        <Input placeholder="Enter name" className="!h-[42px]" />
                      </Form.Item>

                      <Form.Item
                        name="bank_name"
                        label="Bank Name"
                        rules={[{ required: true, message: 'Please select bank!' }]}
                      >
                        <Select
                          placeholder="Select bank"
                          className="!h-[42px]"
                          onChange={handleBankNameChange}
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) => {
                            const optionText = String(option?.children || '').toLowerCase();
                            return optionText.indexOf(input.toLowerCase()) >= 0;
                          }}
                          loading={isLoadingBanks}
                        >
                          {bankList?.map((bank: Bank) => (
                            <Option key={bank.code} value={bank.name}>{bank.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="bank_code"
                        hidden
                        rules={[{ required: true, message: 'Bank code is required!' }]}
                      >
                        <Input type="hidden" />
                      </Form.Item>

                      <Form.Item
                        name="account_number"
                        label="Account Number"
                        rules={[{ required: true, message: 'Please enter account number!' }]}
                      >
                        <Input
                          placeholder="Enter account number"
                          className="!h-[42px]"
                          onChange={handleAccountNumberChange}
                          maxLength={10}
                          type="number"
                        />
                      </Form.Item>

                      {isVerifyingAccount ? (
                        <div className="mb-3 p-2 bg-[#FFF0EA] text-[#FF6C2D] text-sm rounded-lg">
                          Fetching account name...
                        </div>
                      ) : (accountName &&
                        <div className="mb-3 p-2 bg-[#FFF0EA] text-[#FF6C2D] text-sm rounded-lg">
                          {accountName}
                        </div>
                      )}

                      <Form.Item
                        name="account_name"
                        label="Account Name"
                        hidden
                        rules={[{ required: true, message: 'Account name is required!' }]}
                      >
                        <Input type="hidden" />
                      </Form.Item>

                      <Form.Item
                        name="amount_type"
                        label="Preferred value type"
                      >
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={`flex-1 py-2 rounded-lg border text-base font-medium transition ${valueType === 'percentage' ? 'bg-[#FFF3ED] border-[#FF6C2D] text-[#FF6C2D]' : 'bg-white border-[#D0D5DD] text-[#667085]'}`}
                            onClick={() => setValueType('percentage')}
                          >
                            Percentage
                          </button>
                          <button
                            type="button"
                            className={`flex-1 py-2 rounded-lg border text-base font-medium transition ${valueType === 'amount' ? 'bg-[#FFF3ED] border-[#FF6C2D] text-[#FF6C2D]' : 'bg-white border-[#D0D5DD] text-[#667085]'}`}
                            onClick={() => setValueType('amount')}
                          >
                            Amount
                          </button>
                        </div>
                      </Form.Item>

                      <Form.Item
                        name="amount"
                        label={valueType === 'percentage' ? 'Percentage' : 'Amount'}
                        rules={[{ required: true, message: `Please enter ${valueType.toLowerCase()}!` }]}
                      >
                        <Input 
                          type={valueType === 'percentage' ? 'number' : 'text'} 
                          placeholder="Enter details" 
                          className="!h-[42px]"
                          suffix={valueType === 'percentage' ? '%' : '₦'}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 py-4 flex justify-end gap-3">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={isSubmitting}
                    disabled={isSubmitting || isVerifyingAccount}
                    className="rounded-md h-[46px]! px-10! border border-transparent bg-[#FF6C2D] py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  >
                    Update
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

export default EditStakeholderForm; 