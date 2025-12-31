import React from 'react';
import { FaCopy } from 'react-icons/fa';
import Images from '@/components/images';
import QRCode from 'react-qr-code';

interface InvoiceSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: any;
}

const InvoiceSidebar: React.FC<InvoiceSidebarProps> = ({ isOpen, onClose, booking }) => {
  if (!isOpen) return null;

  const invoiceData = booking
    ? {
        bookingId: booking.booking_ref || booking.bookingId || 'N/A',
        officer:
          booking.user_data?.first_name && booking.user_data?.last_name
            ? `${booking.user_data.first_name} ${booking.user_data.last_name}`
            : 'N/A',
        vehicleDetails: booking.vehicle_model || 'N/A',
        numberPlate: booking.plate_number || 'N/A',
        driverName: booking.driver?.first_name
          ? `${booking.driver.first_name} ${booking.driver.last_name || ''}`
          : booking.driver || 'N/A',
        driverEmail: booking.user_data?.email || booking.driver?.email || 'N/A',
        amount: booking.est_fare ? `₦${booking.est_fare.toLocaleString()}` : 'N/A',
      }
    : {
        bookingId: 'NOV335008770',
        officer: 'Derin Abitayo',
        vehicleDetails: 'Lexus RX 350, metallic, SUV',
        numberPlate: 'LSD 300 QA',
        driverName: 'Yemi Chuka',
        driverEmail: 'Yemi Chuka',
        amount: '₦52,500',
      };

  
  const plate = encodeURIComponent(invoiceData.numberPlate || '');
  const paymentUrl = `${window.location.origin}/payment/search?plate=${plate}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentUrl);
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
          <h2 className="text-md font-semibold text-[#1C2023]">Invoice</h2>
          <button
            onClick={onClose}
            className="text-[#7D8489] bg-[#EEF0F2] cursor-pointer py-2 px-3 rounded-3xl hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex flex-col h-[calc(100vh-160px)] slide-in scrollbar-hide hover:scrollbar-show px-7 py-4">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={Images.logodark} alt="ResQ Logo" className="h-6 mt-3" />
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
                  <div className="bg-white rounded mx-auto mb-1 p-2 inline-block">
                    <QRCode value={paymentUrl} size={140} />
                  </div>
                </a>
                <p className="text-xs text-[#667085]">Scan to pay</p>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="text-center mb-6">
            <p className="text-3xl font-semibold text-[#344054]">{invoiceData.amount}</p>
          </div>

          {/* Payment Link */}
          <div className="mb-6">
            <div className="flex items-center border border-[#FF6C2D] rounded-lg p-3 bg-[#FFF3ED]">
              <p className="flex-1 text-sm text-[#344054] break-all">{paymentUrl}</p>
              <button
                onClick={handleCopyLink}
                className="ml-2 text-[#FF6C2D] hover:text-[#E55B1F] transition-colors"
              >
                <FaCopy />
              </button>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-sm text-[#667085]">Booking ID:</span>
              <span className="text-sm font-medium text-[#344054]">
                {invoiceData.bookingId}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-[#667085]">Officer:</span>
              <span className="text-sm font-medium text-[#344054]">
                {invoiceData.officer}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-[#667085]">Vehicle details:</span>
              <span className="text-sm font-medium text-[#344054] text-right">
                {invoiceData.vehicleDetails}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-[#667085]">Number Plate:</span>
              <span className="text-sm font-medium text-[#344054]">
                {invoiceData.numberPlate}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-[#667085]">Driver's Name:</span>
              <span className="text-sm font-medium text-[#344054]">
                {invoiceData.driverName}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-[#667085]">Driver's Email:</span>
              <span className="text-sm font-medium text-[#344054]">
                {invoiceData.driverEmail}
              </span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#FF6C2D] text-white rounded-lg font-medium hover:bg-[#E55B1F] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSidebar;
