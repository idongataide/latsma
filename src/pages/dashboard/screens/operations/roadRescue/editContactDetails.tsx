import React from 'react';
import { Form, Input, Button, Modal } from 'antd';
import { FaAngleLeft } from 'react-icons/fa';
import ConfirmOperator from '@/pages/dashboard/screens/operations/2FA';
import { updateOperator } from '@/api/operatorsApi';
import toast from 'react-hot-toast';
import { useOperatorData } from '@/hooks/useAdmin';

interface EditContactDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (data: any) => void;
  initialData?: {
    first_name?: string;
    last_name?: string;
    contact_phone?: string;
    contact_email?: string;
    assetco_id?: string;
  };
}

const EditContactDetails: React.FC<EditContactDetailsProps> = ({ isOpen, onClose, onNext, initialData }) => {
  const [form] = Form.useForm();
  const [show2FA, setShow2FA] = React.useState(false);
  const [formData, setFormData] = React.useState<any>({});
  const { mutate } = useOperatorData(initialData?.assetco_id || '');

  React.useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        firstName: initialData.first_name,
        lastName: initialData.last_name,
        contactPhone: initialData.contact_phone,
        contactEmail: initialData.contact_email
      });
    }
  }, [initialData, form]);

  const handleFinish = (values: any) => {
    setFormData(values);
    setShow2FA(true);
  };

  const handle2FAComplete = async (otp: string) => {
    try {
      if (!initialData?.assetco_id) {
        toast.error('Operator ID is missing');
        return;
      }

      const payload = {
        contact_rep_firstname: formData.firstName,
        contact_rep_lastname: formData.lastName,
        contact_rep_phone: formData.contactPhone,
        contact_rep_email: formData.contactEmail,
        otp
      };

      const response = await updateOperator(initialData.assetco_id, payload);
      
      if (response?.status === 'ok') {
        toast.success('Contact details updated successfully');
        await mutate(); // Refresh the data
        onNext(formData);
        onClose();
      } else {
        toast.error(response?.response?.data?.msg || 'Failed to update contact details');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while updating contact details');
    } finally {
      setShow2FA(false);
    }
  };

  return (
    <>
      <Modal
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width={600}
        centered
      >
        <div className="w-full mx-auto">
          <div className="flex items-center mb-7">
            <FaAngleLeft onClick={onClose} className='text-lg me-2 text-[#667085]' />
            <h2 className="text-lg! font-medium text-[#667085]">Edit Contact Details</h2>
          </div>
          <div className="bg-[#F5F6FA] rounded-md px-4 py-2 mb-6 text-[#667085] font-medium">Contact details</div>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            requiredMark={false}
          >
            <Form.Item 
              label="First Name" 
              name="firstName" 
              rules={[{ required: true, message: 'Please enter contact first name' }]}
            >
              <Input 
                placeholder="Enter details" 
                size="large" 
              />
            </Form.Item>
            <Form.Item 
              label="Last Name" 
              name="lastName" 
              rules={[{ required: true, message: 'Please enter contact last name' }]}
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
                Save Changes
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {show2FA && (
        <ConfirmOperator
          onClose={() => setShow2FA(false)}
          onSuccess={handle2FAComplete}
        />
      )}
    </>
  );
};

export default EditContactDetails; 