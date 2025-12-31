import React from 'react';
import { IoClose } from 'react-icons/io5';
import OtpInput from 'react-otp-input';
import toast from 'react-hot-toast';
import { Button } from 'antd';

interface ConfirmOperatorProps {
  onClose: () => void;
  onSuccess: (otp: string, otp_request_id?: string) => void;
  isLoading?: boolean;
}

const ConfirmOperator: React.FC<ConfirmOperatorProps> = ({ onClose, onSuccess, isLoading = false }) => {
  const [otp, setOtp] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }
    onSuccess(otp);
  };

  return (
    <div className="fixed inset-0 bg-[#38383880] z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[430px] relative overflow-hidden">
        <div className="flex justify-between items-center border-b bg-[#F2F4F7] overflow-hidden
         border-[#F2F4F7] px-6 py-4">
          <button 
            className="text-[#3F3F46] ms-auto hover:text-[#1C2023] cursor-pointer"
            onClick={onClose}
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        <div className='overflow-y-auto mb-5  max-h-[calc(100vh-200px)]'>     
          <form onSubmit={handleSubmit} className="px-8 py-8">
            <h3 className="text-[#475467] text-lg font-bold mb-2">Authorization code</h3>
            <p className="text-[#667085] font-medium mb-6">Please enter your passcode to proceed with this action</p>

            <p className="text-[#475467] font-medium mb-4">Input the six digits your passcode here</p>
            
            <div className="mb-6 flex justify-center">
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                renderInput={(props, index) => {
                  if (index === 2) {
                    return (
                      <span key={index} style={{ display: 'flex', alignItems: 'center' }}>
                        <input {...props} style={{ ...props.style, }} />
                        <span className='mx-3 font-bold text-[#D0D5DD] text-3xl'> - </span>
                      </span>
                    );
                  }
                  return <input {...props} key={index} />;
                }}
                shouldAutoFocus
                inputStyle={{
                  width: '48px',
                  height: '48px',
                  margin: '0 4px',
                  fontSize: '20px',
                  borderRadius: '8px',
                  border: '1px solid #D0D5DD',
                  color: '#1C2023',
                }}
                containerStyle={{
                  justifyContent: 'center',
                }}
              />
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              disabled={otp.length !== 6 || isLoading}
              className={
                `w-full h-[46px]! mt-5 rounded-lg font-medium text-lg transition border-0 ${otp.length === 6 && !isLoading ? 'bg-[#FF6C2D] text-white hover:bg-[#E55B1F] cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`
              }
            >
              Proceed
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOperator;