import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import ClosedBookingSidebar from './closedBookingSidebar';
import { useAllBookings } from '@/hooks/useAdmin';
import LoadingScreen from '../../common/LoadingScreen';

interface Coordinates {
  longitude: number;
  latitude: number;
}

interface Point {
  type: string;
  coordinates: number[];
}

interface UserData {
  first_name: string;
  last_name: string;
  phone_number: string;
  avatar: string;
}

interface Booking {
  booking_ref: string;
  user_id: string;
  plate_number: string;
  vehicle_color: string;
  landmark: string;
  vehicle_model: string;
  vehicle_reg: string;
  vehicle_type: string;
  tow_reason: string;
  start_address: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  end_address: string;
  start_coord: Coordinates;
  end_coord: Coordinates;
  pickup_coord: Point;
  ride_status: number; // 0=pending, 1=ongoing, 2=completed, 3=cancelled, 4=rejected
  charge_status: number;
  settle_status: number;
  vehicle_loaded: number;
  url: string[];
  share_holders_pay: any[];
  remainder: number;
  est_time: number;
  drop_off_dst: number;
  request_area_data: any;
  towing_params: any;
  createdAt: string;
  updatedAt: string;
  towing_id: string;
  user_data: UserData;
}

const BookingLayout: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');
  const [selectedClosedBooking, setSelectedClosedBooking] = useState<Booking | null>(null);
  const { data: allBookings = [], isLoading } = useAllBookings();

  const activeBookings = allBookings.filter((booking: Booking) => 
    booking.ride_status >= 0 && booking.ride_status <= 2
  );

  const closedBookings = allBookings.filter((booking: Booking) => 
    booking.ride_status === 3 || booking.ride_status === 4
  );

  const currentBookings = activeTab === 'active' ? activeBookings : closedBookings;

  const handleViewDetails = (booking: Booking) => {
    if (booking.ride_status === 3 || booking.ride_status === 4) {
      setSelectedClosedBooking(booking);
      return;
    }
    navigate(`/bookings/${booking.towing_id}`);
  };

  const handleCloseSidebar = () => {
    setSelectedClosedBooking(null);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }
  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#344054] mb-6">Booking</h1>

         <div className="bg-white rounded-lg border p-1 overflow-hidden border-[#E5E9F0] mx-auto max-w-xl">
            <div className="flex space-x-2 ">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-3 w-[50%] font-normal cursor-pointer text-sm relative -mb-[1px] ${
                  activeTab === 'active'
                    ? 'text-[#E86229] rounded border border-[#FFD1BE] bg-[#FFF0EA]! font-medium!'
                    : 'text-[#475467] hover:text-[#475467]'
                }`}
              >
                Active ({activeBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('closed')}
                className={`px-4 py-3 w-[50%] font-normal  cursor-pointer text-sm relative -mb-[1px] ${
                  activeTab === 'closed'
                    ? 'text-[#E86229] rounded border border-[#FFD1BE] bg-[#FFF0EA]! font-medium!'
                    : 'text-[#475467] hover:text-[#475467]'
                }`}
              >
                Closed ({closedBookings.length})
              </button>
            </div>
          </div>

          {currentBookings.length === 0 ? (
            <div className="text-center py-12 text-[#667085]">
              <p>No {activeTab} bookings found</p>
            </div>
          ) : (
            <>
            {currentBookings.map((booking: Booking) => (
                <div className="mt-6 pb-4 bg-[#F9FAFB] rounded-lg max-w-xl mx-auto">
                <div
                  key={booking.booking_ref}
                  className="bg-[#fff] rounded-lg border border-[#E5E9F0] p-4 hover:shadow-sm transition-shadow mb-3"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center">
                      <div className="relative mr-3 flex items-center">
                        {/* Vertical line */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-11 bg-[#D0D5DD]"></div>
                        {/* Circle */}
                        <div className={`w-2 h-2 rounded-full z-10 ${
                          activeTab === 'active' ? 'bg-[#FF6C2D]' : 'bg-[#667085]'
                        }`}></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[16px] font-[500] text-[#475467] mb-2">
                        {booking.start_address}
                      </p>
                      <p className="text-[16px] font-[500] text-[#475467]">
                        {booking.end_address}
                      </p>
                    </div>
                    
                  </div>
                </div>
                <button
                  onClick={() => handleViewDetails(booking)}
                  className="flex items-center text-[#FF6C2D] cursor-pointer my-2! ml-auto font-medium text-sm hover:text-[#E55B1F] transition-colors whitespace-nowrap"
                >
                  View Details
                  <FaArrowRight className="mr-3 cursor-pointer  ml-1 text-xs" />
                </button>
            </div>
              ))}
              </>
          )}
           
      {selectedClosedBooking && (
        <ClosedBookingSidebar
        isOpen={!!selectedClosedBooking}
        booking={{ address: selectedClosedBooking!.start_address }}
        onClose={handleCloseSidebar}
        />
      )}
    </div>
    </div>
  );
};

export default BookingLayout;