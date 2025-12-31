import React from 'react';
import { Modal } from 'antd';
import EditCompanyDetails from './editCompanyDetails';
import EditAccountDetails from './editAccountDetails';
import ConfirmOperator from '@/pages/dashboard/screens/operations/2FA';
import { updateOperator } from '@/api/operatorsApi';
import toast from 'react-hot-toast';
import { useOperatorData } from '@/hooks/useAdmin';

interface EditCompanyProfileProps {
  isOpen: boolean;
  onClose: () => void;
  operatorData: any;
  onSuccess: () => void;
}

const EditCompanyProfile: React.FC<EditCompanyProfileProps> = ({
  isOpen,
  onClose,
  operatorData,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState<any>({});
  const [show2FA, setShow2FA] = React.useState(false);
  const { mutate } = useOperatorData(operatorData?.assetco_id || '');

  React.useEffect(() => {
    if (isOpen && operatorData) {
      setFormData(operatorData);
    }
  }, [isOpen, operatorData]);

  const handleStepComplete = (data: any) => {
    setFormData((prev: Record<string, any>) => ({ ...prev, ...data }));
    
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShow2FA(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      onClose();
    }
  };

  const handle2FAComplete = async (otp: string) => {
    try {
      if (!operatorData?.assetco_id) {
        toast.error('Operator ID is missing');
        return;
      }

      const payload = {
        company_name: formData.companyName,
        company_email: formData.email,
        phone_number: formData.phone,
        state: formData.state,
        lga: formData.lga,
        bank_name: formData.bankName,
        account_number: formData.accountNumber,
        account_name: formData.accountName,
        bank_code: formData.bankCode,
        otp
      };

      const response = await updateOperator(operatorData.assetco_id, payload);
      
      if (response?.status === 'ok') {
        toast.success('Operator profile updated successfully');
        await mutate();
        onSuccess();
        onClose();
      } else {
        toast.error(response?.response?.data?.msg || 'Failed to update operator profile');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while updating operator profile');
    } finally {
      setShow2FA(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EditCompanyDetails
            onBack={handleBack}
            onNext={handleStepComplete}
            initialData={operatorData}
          />
        );
      case 2:
        return (
          <EditAccountDetails
            onBack={handleBack}
            onNext={handleStepComplete}
            initialData={{
              bank_name: operatorData?.bank_data?.bank_name,
              account_number: operatorData?.bank_data?.account_number,
              account_name: operatorData?.bank_data?.account_name,
            }}
          />
        );     
      default:
        return null;
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
        destroyOnClose
      >
        {renderStep()}
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

export default EditCompanyProfile; 