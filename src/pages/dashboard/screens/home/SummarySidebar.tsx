import { Button } from 'antd';
import React from 'react';

interface SummarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    location: string;
    landmark: string;
    vehicleModel: string;
    vehicleColour: string;
    vehicleType: string;
    numberPlate: string;
    vehicleRegistration: string;
    reasonForTowing: string;
    isVehicleLoaded: string;
    vehicleImage?: File | null;
    currentLocation?: {
      address: string;
    };
    destinationLocation?: {
      address: string;
    };
  };
  loading: boolean;
  onBookNow: () => void;
}

const SummarySidebar: React.FC<SummarySidebarProps> = ({
  isOpen,
  onClose,
  loading,
  bookingData,
  onBookNow,
}) => {
  if (!isOpen) {
    return null;
  }

  console.log('Booking Data:', bookingData);

  return (
    <div className="fixed inset-0 z-[999] flex justify-end bg-[#38383880] p-5 bg-opacity-50" onClick={onClose}>
      <div className="md:w-[48%] lg:w-1/3 w-100 z-[9999] h-full bg-white rounded-xl slide-in overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center py-3 px-6 border-b border-[#D6DADD]">
          <h2 className="text-md font-semibold text-[#1C2023]">Summary</h2>
          <button
            onClick={onClose}
            className="text-[#7D8489] bg-[#EEF0F2] cursor-pointer py-2 px-3 rounded-3xl hover:text-black"
          >
            ✕
          </button>
        </div>
        <div className='overflow-y-auto flex flex-col h-[calc(100vh-160px)] slide-in scrollbar-hide hover:scrollbar-show px-7 py-4'>
          
          <div className="bg-[#F9FAFB] rounded-lg p-4 mb-4 border border-[#E5E9F0]">
            <div className="space-y-2">
              {bookingData?.currentLocation && (
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-[#667085] mr-3"></div>
                  <p className="text-sm font-medium text-[#344054]">{bookingData?.currentLocation.address}</p>
                </div>
              )}
              {bookingData?.destinationLocation && (
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full border-2 border-[#667085] mr-3"></div>
                  <p className="text-sm font-medium text-[#667085]">{bookingData?.destinationLocation.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="mb-4 p-4 border border-[#E5E9F0] rounded-lg">
            <div className="grid grid-cols-[2fr_1fr] gap-4 text-sm">
              <div>
                <p className="font-normal mb-3 text-[#667085]">Landmark:</p>
                <p className="font-normal mb-3 text-[#667085]">Vehicle model:</p>
                <p className="font-normal mb-3 text-[#667085]">Vehicle colour:</p>
                <p className="font-normal mb-3 text-[#667085]">Vehicle type:</p>
                <p className="font-normal mb-3 text-[#667085]">Number plate:</p>
                <p className="font-normal mb-3 text-[#667085]">Vehicle registration:</p>
                <p className="font-normal mb-3 text-[#667085]">Reason for towing:</p>
                <p className="font-normal text-[#667085]">Vehicle loading status:</p>
              </div>
              <div className="text-right">
                <p className="font-medium mb-3 text-[#475467]">{bookingData.landmark || 'N/A'}</p>
                <p className="font-medium mb-3 text-[#475467] capitalize">{bookingData.vehicleModel || 'N/A'}</p>
                <p className="font-medium mb-3 text-[#475467] capitalize">{bookingData.vehicleColour || 'N/A'}</p>
                <p className="font-medium mb-3 text-[#475467] uppercase">{bookingData.vehicleType || 'N/A'}</p>
                <p className="font-medium mb-3 text-[#475467] uppercase">{bookingData.numberPlate || 'N/A'}</p>
                <p className="font-medium mb-3 text-[#475467] capitalize">{bookingData.vehicleRegistration || 'N/A'}</p>
                <p className="font-medium mb-3 text-[#475467] capitalize">{bookingData.reasonForTowing || 'N/A'}</p>
                <p className="font-medium text-[#475467] capitalize">
                  {bookingData.isVehicleLoaded === 'loaded' ? 'Loaded' : 'Not loaded'}
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Image */}
          {bookingData.vehicleImage && (
            <div className="mb-6 p-4 border border-[#E5E9F0] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-[#FFF0EA] rounded-lg p-3">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.6667 15.8333V4.16667C16.6667 3.24619 15.9205 2.5 15 2.5H5C4.07953 2.5 3.33333 3.24619 3.33333 4.16667V15.8333C3.33333 16.7538 4.07953 17.5 5 17.5H15C15.9205 17.5 16.6667 16.7538 16.6667 15.8333Z" stroke="#FF6C2D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3.33333 12.5L7.08333 8.75C7.77368 8.05964 8.89302 8.05964 9.58333 8.75L13.3333 12.5" stroke="#FF6C2D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11.6667 10.8333L13.3333 9.16667C14.0237 8.47631 15.143 8.47631 15.8333 9.16667L16.6667 10" stroke="#FF6C2D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-[#475467]">{bookingData.vehicleImage.name || 'IMG 2712'}</p>
              </div>
            </div>
          )}

          {/* Book Now Button */}
          <div className="mt-auto pt-4">
            <Button
              loading={loading}
              onClick={onBookNow}
              className="w-full h-[46px]! rounded-lg bg-[#FF6C2D]! text-white! font-medium! text-lg hover:bg-[#E55B1F] transition border-0"
            >
              Book now
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SummarySidebar;

