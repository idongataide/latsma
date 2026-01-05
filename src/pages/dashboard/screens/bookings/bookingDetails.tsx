import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaAngleLeft } from 'react-icons/fa';
import { PiCheckCircleBold } from "react-icons/pi";
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import Images from '@/components/images';
import InvoiceSidebar from './InvoiceSidebar';
import VanDetails from './vanDetails';
import { useBookingDetails } from '@/hooks/useAdmin';
import { updateArrival, confirmTowing } from '@/api/bookingsApi';
import toast from 'react-hot-toast';
import formatTimestamp from '@/global/FormatTime';



interface TimelineAction {
  type: 'view' | 'confirm';
  label: string;
  onClick: () => void;
}

interface TimelineEvent {
  id: string;
  title: string;
  description: React.ReactNode;
  timestamp: string;
  status: string;
  actions?: TimelineAction[];
}

const BookingDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isVanDetailsOpen, setIsVanDetailsOpen] = useState(false);
  const { data: bookingData, mutate } = useBookingDetails(id);
  const [confirming, setConfirming] = useState(false);
  const [completing, setCompleting] = useState(false);

  const handleConfirmArrival = async () => {
    if (!bookingData) return;
    const confirmed = window.confirm('Are you sure you want to confirm arrival for this booking?');
    if (!confirmed) return;

    try {
      setConfirming(true);
      await updateArrival({ towing_id: bookingData.towing_id });
      if (mutate) await mutate();
      toast.success('Arrival confirmed');
    } catch (err) {
      console.error('Failed to confirm arrival', err);
      toast.error('Failed to confirm arrival');
    } finally {
      setConfirming(false);
    }
  };

  const handleConfirmTowing = async () => {
    if (!bookingData) return;
    const confirmed = window.confirm('Are you sure you want to mark this towing as completed?');
    if (!confirmed) return;

    try {
      setCompleting(true);
      await confirmTowing({ towing_id: bookingData.towing_id });
      if (mutate) await mutate();
      toast.success('Towing marked as completed');
    } catch (err) {
      console.error('Failed to confirm towing completion', err);
      toast.error('Failed to confirm towing completion');
    } finally {
      setCompleting(false);
    }

  };

  
  const timelineEvents = useMemo<TimelineEvent[]>(() => {
    const etaMinutes = bookingData?.est_time
      ? Math.ceil(bookingData.est_time / 60)
      : null;

    const events: TimelineEvent[] = [
      {
        id: '1',
        title: 'Booking request made',
        description: 'Your booking request has been submitted and awaiting approval',
        timestamp: bookingData?.createdAt || 'N/A',
        status: bookingData ? 'submitted' : 'pending'
      },
      {
        id: '2',
        title: 'Booking Pending',
        description: 'Your booking is pending approval',
        timestamp: bookingData?.createdAt || 'N/A',
        status: bookingData ? (bookingData.ride_status === 0 ? 'pending' : '') : 'pending'
      }, 
      {
        id: '3',
        title: 'Booking approved',
        description: (
          <>
            Your towing van is on the way, estimated to arrive in{' '}
            {etaMinutes && (
              <span className='font-medium text-[#FF6C2D]'>
                {etaMinutes} minutes
              </span>
            )}
          </>
        ),
        timestamp: bookingData?.updatedAt || 'N/A',
        status: bookingData ? (bookingData.ride_status >= 1 ? 'approved' : '') : '',
        actions: [{
          type: 'view',
          label: 'View',
          onClick: () => setIsVanDetailsOpen(true)
        }]
      },
      {
        id: '4',
        title: 'Towing Van Arrived',
        description: 'Your towing van has arrived',
        timestamp: bookingData?.updatedAt || 'N/A',
        status: bookingData ? (bookingData.ride_status >= 2 ? 'arrived' : '') : '',
        actions: bookingData && bookingData.ride_status === 1 ? [
          {
            type: 'confirm',
            label: 'Confirm',
            onClick: () => handleConfirmArrival()
          }
        ] : undefined
      },
      {
        id: '5',
        title: 'Towing Completed',
        description: 'Confirm that the service has completed',
        timestamp: bookingData?.updatedAt || 'N/A',
        status: bookingData ? (bookingData.ride_status >= 3 ? 'completed' : '') : '',
        actions: (() => {
          if (!bookingData) return undefined;
          const actionsArr: TimelineAction[] = [];
          if (bookingData.ride_status === 2) {
            actionsArr.push({ type: 'confirm', label: 'Confirm', onClick: () => handleConfirmTowing() });
          }
          if (bookingData.charge_status !== 1) {
            actionsArr.push({ type: 'view', label: 'Invoice', onClick: () => setIsInvoiceOpen(true) });
          }
          return actionsArr.length ? actionsArr : undefined;
        })()
      }
    ];

    if (!bookingData) {
      return events.slice(0, 1);
    }

    const status = bookingData.ride_status;

    if (status === 0) {
      return events.slice(0, 2);
    }

    if (status === 1) {     
      return events.filter(e => e.id !== '2');
    }


    return events.filter(e => e.id !== '2');
  }, [bookingData]);

  const containerStyle = {
    width: '100%',
    height: '400px'
  };

  const center = {
    lat: 6.5244,
    lng: 3.3792
  };

  const apiKey = import.meta.env.VITE_GMAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || ''
  });

  return (
    <div className="w-full p-3 md:p-6 ">
      <div className="mb-6">
        <div 
          className="flex items-center mb-5 cursor-pointer"
          onClick={() => navigate('/bookings')}
        >
          <FaAngleLeft className='text-lg text-[#667085]' />
          <p className='ml-2 font-bold text-[#667085] text-lg'>Back</p>
        </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-[#E5E9F0] mx-auto px-6 py-8 max-w-xl">

             <div className="bg-white rounded-xl border border-[#E5E9F0]  mb-6">
              <div className="h-40 rounded-lg overflow-hidden">
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={11}
                  >
                  </GoogleMap>
                ) : (
                  <img 
                    src={Images.map} 
                    alt="Map" 
                    className="w-full h-full object-cover" 
                  />
                )}
              </div>
            </div>
            <div className="bg-white  py-2 md:p-6 ">
              <h2 className="text-xl font-semibold text-[#344054] mb-6">Booking Timeline</h2>
              
              <div className="space-y-6">
                {timelineEvents.map((event, index) => (
                  <div key={event.id} className="flex items-start">
                    {/* Timeline Line & Icon */}
                    <div className="flex flex-col items-center mr-4">
                      {(() => {
                        // Explicit active statuses
                        const activeStatuses = ['submitted', 'approved', 'arrived', 'completed'];
                        const isHighlighted = !!event.status && activeStatuses.includes(event.status);
                        return (
                          <>
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isHighlighted ? 'bg-[#F9FAFB]' : 'bg-[#E5E9F0]'
                              }`}
                            >
                              <PiCheckCircleBold className={`${isHighlighted ? 'text-[#FF6C2D]' : 'text-[#98A2B3]'} text-lg`} />
                            </div>

                            {index < timelineEvents.length - 1 && (
                              <div
                                className="w-[1px] h-16 mt-2"
                                style={{
                                  borderStyle: 'dashed',
                                  borderWidth: '1px',
                                  borderColor: isHighlighted ? '#FF6C2D' : '#E5E9F0'
                                }}
                              ></div>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 pb-2">
                      <h3 className="text-base font-[500] text-[#667085] mb-1">
                        {event.title}
                      </h3>
                      <div className='flex items-center justify-between border border-[#E5E9F0] rounded p-2'>
                        <p className="text-[16px] font-[400] text-[#475467]">
                          {event.description}
                        </p>
                        {event.actions && event.actions.map((act, ai) => (
                          act.type === 'confirm' ? (
                            <button
                              key={`action-${event.id}-${ai}`}
                              onClick={act.onClick}
                              className="text-white cursor-pointer bg-[#FF6C2D] px-3 py-1 rounded text-sm font-medium hover:bg-[#E55B1F] transition-colors ml-2"
                              disabled={confirming || completing}
                            >
                              {confirming || completing ? 'Confirming...' : act.label}
                            </button>
                          ) : (
                            <button
                              key={`action-${event.id}-${ai}`}
                              onClick={act.onClick}
                              className="text-[#FF6C2D] cursor-pointer text-sm font-medium hover:text-[#E55B1F] transition-colors ml-2"
                            >
                              {act.label}
                            </button>
                          )
                        ))}
                      </div>

                      <p className="text-sm text-[#475467] mt-1">
                        {formatTimestamp(event.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      {/* Invoice Sidebar */}
      <InvoiceSidebar
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        booking={bookingData}
      />

      {/* Van Details Modal */}
      <VanDetails
        isOpen={isVanDetailsOpen}
        onClose={() => setIsVanDetailsOpen(false)}
        booking={bookingData}
      />
    </div>
  );
};

export default BookingDetails;

