import React from 'react';
import { Modal, Form, Input, Button } from 'antd';

interface ConfirmOperatorProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (otp: string) => void;
  title: string;
  description: string;
}

const ConfirmOperator: React.FC<ConfirmOperatorProps> = ({
  isOpen,
  onClose,
  onComplete,
  title,
  description
}) => {
  const [form] = Form.useForm();

  const handleFinish = (values: { otp: string }) => {
    onComplete(values.otp);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={400}
      centered
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
      >
        <Form.Item
          name="otp"
          rules={[
            { required: true, message: 'Please enter OTP' },
            { len: 6, message: 'OTP must be 6 digits' }
          ]}
        >
          <Input
            placeholder="Enter OTP"
            size="large"
            maxLength={6}
            className="text-center tracking-widest"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full h-[46px] rounded-lg bg-[#FF6C2D] text-white font-medium text-lg hover:bg-[#E55B1F] transition border-0"
          >
            Verify
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConfirmOperator; 