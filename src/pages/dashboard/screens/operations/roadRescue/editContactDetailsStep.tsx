import React from 'react';
import { Form, Input, Button } from 'antd';
import { FaAngleLeft } from 'react-icons/fa';

interface EditContactDetailsStepProps {
  onBack: () => void;
  onNext: (data: any) => void;
  initialData?: {
    contact_person?: string;
    contact_phone?: string;
    contact_email?: string;
  };
}

const EditContactDetailsStep: React.FC<EditContactDetailsStepProps> = ({ onBack, onNext, initialData }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        contactPerson: initialData.contact_person,
        contactPhone: initialData.contact_phone,
        contactEmail: initialData.contact_email
      });
    }
  }, [initialData, form]);

  const handleFinish = (values: any) => {
    onNext(values);
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center mb-7">
        <FaAngleLeft onClick={onBack} className='text-lg me-2 text-[#667085]' />
        <h2 className="text-lg! font-medium text-[#667085]">Edit Company Profile</h2>
      </div>
      <div className="bg-[#F5F6FA] rounded-md px-4 py-2 mb-6 text-[#667085] font-medium">Contact details</div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
      >
        <Form.Item 
          label="Contact person" 
          name="contactPerson" 
          rules={[{ required: true, message: 'Please enter contact person name' }]}
        >
          <Input 
            placeholder="Enter details" 
            size="large" 
          />
        </Form.Item>

        <Form.Item 
          label="Contact phone" 
          name="contactPhone" 
          rules={[
            { required: true, message: 'Please enter contact phone number' },
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
          label="Contact email" 
          name="contactEmail" 
          rules={[
            { required: true, message: 'Please enter contact email' },
            { type: 'email', message: 'Please enter a valid email address' }
          ]}
        >
          <Input 
            placeholder="Enter details" 
            size="large" 
            type="email"
          />
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

export default EditContactDetailsStep; 