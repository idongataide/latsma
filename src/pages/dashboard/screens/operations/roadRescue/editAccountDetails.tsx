import React from 'react';
import { Form, Input, Button, Select } from 'antd';
import { useBanksList } from '@/hooks/useAdmin';
import { verifyAccount } from '@/api/banks';
import toast from 'react-hot-toast';
import { DefaultOptionType } from 'antd/es/select';
import { FaAngleLeft } from 'react-icons/fa';

const { Option } = Select;

interface Bank {
  name: string;
  code: string;
}

interface EditAccountDetailsProps {
  onBack: () => void;
  onNext: (data: any) => void;
  initialData?: {
    bank_name?: string;
    account_number?: string;
    account_name?: string;
  };
}

const EditAccountDetails: React.FC<EditAccountDetailsProps> = ({ onBack, onNext, initialData }) => {
  const [form] = Form.useForm();
  const { data: bankList, isLoading: isLoadingBanks } = useBanksList();
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [accountName, setAccountName] = React.useState<string | null>(initialData?.account_name || null);

  React.useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        bankName: initialData.bank_name,
        accountNumber: initialData.account_number
      });
    }
  }, [initialData, form]);

  const handleVerifyAccount = async () => {
    const { accountNumber, bankName } = form.getFieldsValue();

    if (!bankName) {
      toast.error('Please select a bank before verifying account number.');
      return;
    }

    const selectedBank = bankList?.find((bank: Bank) => bank.name === bankName);

    if (!selectedBank?.code) {
      toast.error('Could not find bank code for the selected bank.');
      return;
    }

    setIsVerifying(true);
    setAccountName(null);
    try {
      const payload = {
        account_number: accountNumber,
        bank_code: selectedBank.code
      };
      const response = await verifyAccount(payload);
      
      if (response?.status === 'ok') {
        setAccountName(response.data.data.account_name);
        toast.success('Account name fetched successfully.');
      } else {
        toast.error(response?.response.data.msg || 'Failed to verify account.');
        setAccountName(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during verification.');
      setAccountName(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const accountNumber = e.target.value;
    const digitsOnly = accountNumber.replace(/\D/g, '');
    form.setFieldsValue({ accountNumber: digitsOnly }); 
    setAccountName(null); 

    const bankName = form.getFieldValue('bankName');
    if (digitsOnly.length >= 10 && bankName) {
      handleVerifyAccount();
    }
  };

  const handleBankNameChange = (value: string) => {
    form.setFieldsValue({ bankName: value }); 
    setAccountName(null); 
  };

  const handleFinish = (values: any) => {
    if (values.accountNumber?.length >= 10 && values.bankName && !accountName) {
      toast.error('Please wait for account verification to complete.');
      return;
    }

    const selectedBank = bankList?.find((bank: Bank) => bank.name === values.bankName);
    
    onNext({
      ...values,
      bankCode: selectedBank?.code,
      accountName: accountName 
    });
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center mb-7">
        <FaAngleLeft onClick={onBack} className='text-lg me-2 text-[#667085]' />
        <h2 className="text-lg! font-medium text-[#667085]">Edit Company Profile</h2>
      </div>
      <div className="bg-[#F5F6FA] rounded-md px-4 py-2 mb-6 text-[#667085] font-medium">Account details</div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
      >
        <Form.Item 
          label="Bank name" 
          name="bankName" 
          rules={[{ required: true, message: 'Please select a bank' }]}
        >
          <Select 
            showSearch
            placeholder="Select bank" 
            size="large"
            loading={isLoadingBanks}
            onChange={handleBankNameChange} 
            filterOption={(input: string, option?: DefaultOptionType) => {
              const childrenText = option?.children as string | undefined;
              return childrenText ? childrenText.toLowerCase().includes(input.toLowerCase()) : false;
            }}
          >
            {bankList?.map((bank: Bank, index: number) => (
              <Option key={index} value={bank.name}>
                {bank.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item 
          label="Account number" 
          name="accountNumber" 
          rules={[{ required: true, message: 'Please enter account number' }]}
        >
          <Input 
            placeholder="Enter details" 
            size="large" 
            onChange={handleAccountNumberChange} 
            maxLength={10} 
            type="number" 
          />
        </Form.Item>
        
        {isVerifying ? (
          <div className="bg-[#FFF0EA] rounded-md px-4 py-3 mb-4 text-[#FF6C2D] font-medium text-base">
            Fetching account name...
          </div>
        ) : (accountName &&
          <div className="bg-[#FFF0EA] rounded-md px-4 py-3 mb-4 text-[#FF6C2D] font-medium text-base">
            {accountName}
          </div>
        )}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isVerifying} 
            disabled={isVerifying || !accountName} 
            className="h-[46px]! px-10! mt-5! rounded-lg bg-[#FF6C2D] text-white font-medium text-lg hover:bg-[#E55B1F] transition border-0"
          >
            Next
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditAccountDetails; 