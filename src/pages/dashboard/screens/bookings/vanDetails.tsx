import React from 'react';
// import { IoClose } from 'react-icons/io5';

interface VanDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: any;
}

const VanDetails: React.FC<VanDetailsProps> = ({ isOpen, onClose, booking }) => {
  if (!isOpen) return null;

  // Fallback data if booking is not provided
  const vanData = booking || {
    company: 'Move360',
    numberPlate: 'LSD 490 TB',
    driver: '0814 505 6008',
    estimatedArrival: '22Mins',
    booking_ref: 'N/A'
  };

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
          <h2 className="text-md font-semibold text-[#1C2023]">
            Towing Vehicle Details
          </h2>
          <button
            onClick={onClose}
            className="text-[#7D8489] bg-[#EEF0F2] cursor-pointer py-2 px-3 rounded-3xl hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex flex-col h-[calc(100vh-160px)] slide-in scrollbar-hide hover:scrollbar-show px-7 py-4">

          {/* Van Details */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-sm text-[#667085]">Booking ref:</span>
              <span className="text-sm font-medium text-[#344054]">
                {vanData.booking_ref || vanData.bookingId || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-[#667085]">Company:</span>
              <span className="text-sm font-medium text-[#344054]">
                {vanData.operator?.name || vanData.company || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-[#667085]">Number Plate:</span>
              <span className="text-sm font-medium text-[#344054]">
                {vanData.plate_number || vanData.numberPlate || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-[#667085]">Vehicle model:</span>
              <span className="text-sm font-medium text-[#344054]">
                {vanData.vehicle_model || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-[#667085]">Driver:</span>
              <span className="text-sm font-medium text-[#344054]">
                {vanData.driver?.first_name ? `${vanData.driver.first_name} ${vanData.driver.last_name || ''}` : vanData.driver || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-[#667085]">Driver phone:</span>
              <span className="text-sm font-medium text-[#344054]">
                {vanData.driver?.phone_number || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-[#667085]">Operator phone:</span>
              <span className="text-sm font-medium text-[#344054]">
                {vanData.operator?.phone_number || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-[#667085]">Service:</span>
              <span className="text-sm font-medium text-[#344054]">
                {vanData.service_data?.name || 'N/A'}
              </span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#FF6C2D] text-white rounded-lg font-medium hover:bg-[#E55B1F] transition-colors"
          >
            Okay
          </button>

        </div>
      </div>
    </div>
  );
};

export default VanDetails;
