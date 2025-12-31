import Images from '@/components/images';
import React from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex justify-end bg-[#38383880] p-5 bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="md:w-[48%] lg:w-1/3 w-100 z-[9999] h-full bg-white rounded-xl slide-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center py-3 px-6 border-b border-[#D6DADD]">
          <h2 className="text-md font-semibold text-[#1C2023]">Summary</h2>
          <button
            onClick={onClose}
            className="text-[#7D8489] bg-[#EEF0F2] cursor-pointer py-2 px-3 rounded-3xl hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex flex-col mt-10 h-[calc(100vh-160px)] slide-in scrollbar-hide hover:scrollbar-show px-7 py-4">

          {/* Success Icon */}
          <div className="flex justify-center mb-3 relative">
            <img src={Images.success} alt="Success" className="w-30 h-30" />
          </div>

          {/* Success Text */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#1C2023] mb-2">Success!</h2>
            <p className="text-sm text-[#667085]">
              Your booking has been submitted <br/> and will be approved in a bit
            </p>
          </div>

          {/* Okay Button */}
          <button
            onClick={onClose}
            className="w-[180px]! mx-auto h-[40px] rounded-lg bg-[#FF6C2D] text-white font-normal text-[14px] hover:bg-[#E55B1F] transition border-0"
          >
            Okay
          </button>

        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
