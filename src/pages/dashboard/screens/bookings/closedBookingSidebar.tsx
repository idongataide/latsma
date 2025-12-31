import React from 'react';

interface ClosedTimelineEntry {
  title: string;
  description: string;
  time: string;
}

interface ClosedBookingInfo {
  date?: string;
  reason?: string;
  timeline: ClosedTimelineEntry[];
}

interface ClosedBookingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    address: string;
    closedInfo?: ClosedBookingInfo;
  };
}

const ClosedBookingSidebar: React.FC<ClosedBookingSidebarProps> = ({
  isOpen,
  onClose,
  booking
}) => {
  if (!isOpen || !booking || !booking.closedInfo) {
    return null;
  }

  const { closedInfo } = booking;

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
            <h2 className="text-md font-semibold text-[#1C2023]">Booking Details</h2>
            <button
            onClick={onClose}
            className="text-[#7D8489] bg-[#EEF0F2] cursor-pointer py-2 px-3 rounded-3xl hover:text-black"
            >
            ✕
            </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex flex-col h-[calc(100vh-160px)] slide-in scrollbar-hide hover:scrollbar-show px-7 py-4">
            
          <div>
            <p className="text-xs text-[#98A2B3]">Closed booking timeline</p>
          </div>

          <div className="space-y-6">
            {closedInfo.timeline.map((event, index) => (
              <div key={`${event.title}-${index}`}>
                <p className="text-sm font-semibold text-[#344054]">{event.title}</p>
                <p className="text-sm text-[#667085] mt-1">{event.description}</p>
                <p className="text-xs text-[#98A2B3] mt-1">{event.time}</p>
                {index !== closedInfo.timeline.length - 1 && (
                  <div className="border-b border-dashed border-[#E4E7EC] mt-4" />
                )}
              </div>
            ))}
          </div>

        
        </div>

        <div className="px-6 pb-8">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#FF6C2D] text-white rounded-xl font-medium hover:bg-[#E55B1F] transition-colors"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClosedBookingSidebar;

