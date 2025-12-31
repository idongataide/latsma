import React from 'react';
import { IoClose } from 'react-icons/io5';
import { FaRegCheckCircle, FaClock, FaTimes } from "react-icons/fa";
import { GiCancel } from "react-icons/gi";
import jsPDF from 'jspdf';
import { Transaction } from '@/types/transaction';

interface TransactionDetailsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const TransactionDetailsSidebar: React.FC<TransactionDetailsSidebarProps> = ({
  isOpen,
  onClose,
  transaction
}) => {
  if (!isOpen || !transaction) return null;

  const handleDownloadReceipt = () => {
    const doc = new jsPDF();
    
    // Add company logo or header
    doc.setFontSize(20);
    doc.text('RESQ Receipt', 105, 20, { align: 'center' });
    
    // Add transaction details
    doc.setFontSize(12);
    doc.text(`Booking ID: ${transaction.booking_ref || 'N/A'}`, 20, 40);
    doc.text(`Amount: ₦${transaction.amount?.toLocaleString() || 'N/A'}`, 20, 50);
    doc.text(`Status: ${transaction.status === 1 ? 'Payment successful' : transaction.status === 2 ? 'Payment failed' : transaction.status === 3 ? 'Pending' : 'Abandoned'}`, 20, 60);
    doc.text(`Customer: ${transaction.user_data?.first_name} ${transaction.user_data?.last_name}`, 20, 70);
    doc.text(`Vehicle Model: ${transaction?.booking_data?.vehicle_model || 'N/A'}`, 20, 80);
    doc.text(`Total Km: ${transaction.drop_off_dst || 'N/A'}km`, 20, 90);
    doc.text(`Date: ${transaction.createdAt ? new Date(transaction.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}`, 20, 100);
    
    if (transaction.status === 1) {
      doc.text(`Towing Operator: ${transaction.operator?.name || 'N/A'}`, 20, 110);
      doc.text(`Pickup: ${transaction.start_address || 'N/A'}`, 20, 120);
      doc.text(`Drop-off: ${transaction.end_address || 'N/A'}`, 20, 130);
    }
    
    // Add footer
    doc.setFontSize(10);
    doc.text('Thank you for choosing RESQ!', 105, 280, { align: 'center' });
    
    // Save the PDF
    doc.save(`receipt-${transaction.booking_ref || 'transaction'}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-[999] flex justify-end bg-[#38383880] p-5 bg-opacity-50" onClick={onClose}>
      <div className="md:w-[48%] lg:w-1/3 w-100 z-[9999] h-full bg-white rounded-xl slide-in overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center py-3 px-6 border-b border-[#D6DADD]">
          <h2 className="text-base font-medium text-[#344054]">Transaction Details</h2>
          <button 
            className="text-[#3F3F46] hover:text-[#1C2023] cursor-pointer"
            onClick={onClose}
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        <div className='overflow-y-auto mb-5 h-[calc(100vh-200px)] slide-in scrollbar-hide hover:scrollbar-show'>     
          <div className="px-10 py-6">
            <div className="text-center mb-8">
              {/* {transaction.status} */}
              <div className="text-[28px] font-bold text-[#667085] mb-2">₦{transaction.amount?.toLocaleString() || 'N/A'}</div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-[14px] rounded-full ${
                transaction.status === 0 ? 'bg-[#FFF4E5]' :
                transaction.status === 1 ? 'bg-[#ECFDF3]' : 
                transaction.status === 2 ? 'bg-[#FFEFEF]' :
                'bg-[#F2F4F7]'
              }`}>
                {
                 transaction.status ===  0 ? <FaClock className='text-[#F79009]'/> :
                 transaction.status === 1 ? <FaRegCheckCircle className='text-[#12B76A]'/> : 
                 transaction.status === 2 ? <GiCancel className='text-[#B11B1B]'/> :
                 <FaTimes className='text-[#667085]'/>}
                <span className={`text-sm ${
                  transaction.status === 0 ? 'text-[#F79009]' :
                  transaction.status === 1 ? 'text-[#2FA270]' : 
                  transaction.status === 2 ? 'text-[#B11B1B]' :
                  'text-[#667085]'
                }`}>
                  {
                   transaction.status === 0 ? 'Pending' :
                   transaction.status === 1 ? 'Success' : 
                   transaction.status === 2 ? 'Failed' :
                   'Abandoned'}
                </span>
              </div>
            </div>
            


            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#667085] text-md font-normal">Booking ID</span>
                <span className="text-[#475467] text-sm font-medium">{transaction.booking_ref || 'N/A'}</span>
              </div>
               <div className="flex justify-between items-center">
                <span className="text-[#667085] text-md">Status</span>
                <span className="text-[#475467] text-sm font-medium">{transaction.status === 1 ? 'Payment successful' : transaction.status === 2 ? 'Payment failed' : transaction.status === 0 ? 'Pending' : 'Abandoned'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#667085] text-md">Customer</span>
                <span className="text-[#475467] text-sm font-medium">{transaction.user_data?.first_name} {transaction.user_data?.last_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#667085] text-md">Vehicle model</span>
                <span className="text-[#475467] text-sm font-medium">{transaction?.booking_data?.vehicle_model || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#667085] text-md">Service type</span>
                <span className="text-[#475467] text-sm font-medium">{'N/A'}</span>
              </div>
               <div className="flex justify-between items-center">
                <span className="text-[#667085] text-md">Total Km</span>
                <span className="text-[#475467] text-sm font-medium">{transaction.drop_off_dst || 'N/A'}km</span>
              </div>
               <div className="flex justify-between items-center">
                <span className="text-[#667085] text-md">Date</span>
                 <span className="text-[#475467] text-sm font-medium">{transaction.createdAt ? new Date(transaction.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
              </div>
              {transaction.status === 1 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] text-md">Towing operator</span>
                    <span className="text-[#475467] text-sm font-medium">{transaction.operator?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] text-md">Pickup</span>
                    <span className="text-[#475467] text-sm font-medium">{transaction.start_address || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#667085] text-md">Drop-off</span>
                    <span className="text-[#475467] text-sm font-medium">{transaction.end_address || 'N/A'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-[#D6DADD] px-6 py-4 flex justify-end">
          <button 
            onClick={handleDownloadReceipt}
            className="flex items-center gap-2 text-[#475467] border border-[#F9FAFB] bg-[#F9FAFB] rounded-lg px-4 py-2 font-medium hover:text-[#1C2023]"
          >
            <FaRegCheckCircle className='text-[#475467]' />
            <span>Download receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsSidebar; 