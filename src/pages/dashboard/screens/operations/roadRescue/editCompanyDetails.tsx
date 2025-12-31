import React from 'react';
import { Form, Input, Button, Select } from 'antd';
import { FaAngleLeft } from 'react-icons/fa';
import { useLagosCities } from '@/hooks/useAdmin';

const { Option } = Select;

interface EditCompanyDetailsProps {
  onBack: () => void;
  onNext: (data: any) => void;
  initialData?: {
    name?: string;
    email?: string;
    phone_number?: string;
    state?: string;
    lga?: string;
  };
}

const EditCompanyDetails: React.FC<EditCompanyDetailsProps> = ({ onBack, onNext, initialData }) => {
  const [form] = Form.useForm();
  const { data: statesList, isLoading: isLoadingStates } = useLagosCities();
  const [selectedState, setSelectedState] = React.useState<string | null>(initialData?.state || null);

  React.useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        companyName: initialData.name,
        email: initialData.email,
        phone: initialData.phone_number,
        state: initialData.state,
        lga: initialData.lga
      });
      setSelectedState(initialData.state || null);
    }
  }, [initialData, form]);

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    form.setFieldsValue({ lga: undefined });
  };

  const handleFinish = (values: any) => {
    onNext(values);
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center mb-7">
        <FaAngleLeft onClick={onBack} className='text-lg me-2 text-[#667085]' />
        <h2 className="text-lg! font-medium text-[#667085]">Edit Company Profile</h2>
      </div>
      <div className="bg-[#F5F6FA] rounded-md px-4 py-2 mb-6 text-[#667085] font-medium">Company details</div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
      >
        <Form.Item 
          label="Company name" 
          name="companyName" 
          rules={[{ required: true, message: 'Please enter company name' }]}
        >
          <Input 
            placeholder="Enter details" 
            size="large" 
          />
        </Form.Item>

        <Form.Item 
          label="Email" 
          name="email" 
          rules={[
            { required: true, message: 'Please enter email' },
            { type: 'email', message: 'Please enter a valid email address' }
          ]}
        >
          <Input 
            placeholder="Enter details" 
            size="large" 
            type="email"
          />
        </Form.Item>

        <Form.Item 
          label="Phone number" 
          name="phone" 
          rules={[
            { required: true, message: 'Please enter phone number' },
            { pattern: /^[0-9]{11}$/, message: 'Please enter a valid 11-digit phone number' }
          ]}
        >
          <Input 
            placeholder="Enter details" 
            size="large" 
            type="tel"
            maxLength={11}
          />
        </Form.Item>

        <Form.Item 
          label="State" 
          name="state" 
          rules={[{ required: true, message: 'Please select a state' }]}
        >
          <Select 
            placeholder="Select state" 
            size="large"
            loading={isLoadingStates}
            onChange={handleStateChange}
          >
            <Option value="Lagos">Lagos</Option>
          </Select>
        </Form.Item>

        <Form.Item 
          label="LGA" 
          name="lga" 
          rules={[{ required: true, message: 'Please select an LGA' }]}
        >
          <Select 
            placeholder="Select LGA" 
            size="large"
            disabled={!selectedState}
          >
            {selectedState && statesList?.map((lga: string) => (
              <Option key={lga} value={lga}>
                {lga}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="h-[46px]! px-10! mt-5! rounded-lg bg-[#FF6C2D] text-white font-medium text-lg hover:bg-[#E55B1F] transition border-0"
          >
            Next
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditCompanyDetails; 