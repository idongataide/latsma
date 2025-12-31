import Images from "@/components/images";
import { useAllBookingsCount } from "@/hooks/useAdmin";
import React, { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api';
import './LagosHotspotsMap.css';

// Define interface for the data points
interface BookingDataPoint {
  area: string;
  total: number;
  longitude: number;
  latitude: number;
}

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';
type DemandLevel = 'high' | 'mid' | 'low';

// Custom marker component with ripple effect
const RippleMarker: React.FC<{
  position: { lat: number; lng: number };
  title: string;
  demandLevel: DemandLevel;
}> = ({ position, title, demandLevel }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const getPixelPositionOffset = (width: number, height: number) => ({
    x: -(width / 2),
    y: -(height / 2),
  });

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={getPixelPositionOffset}
    >
      <div 
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className={`location-ripple ${demandLevel}-demand`} />
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white rounded-lg shadow-lg text-sm whitespace-nowrap z-10">
            <div className="text-gray-800 font-medium capitalize">{title}</div>
            <div className="text-gray-500 text-xs mt-1">
              {demandLevel === 'high' ? 'High Demand Area' : 
               demandLevel === 'mid' ? 'Mid Demand Area' : 'Low Demand Area'}
            </div>
          </div>
        )}
      </div>
    </OverlayView>
  );
};

const LagosHotspotsMap: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('daily');
  const [dateRange, setDateRange] = useState<{ start_date: string; end_date: string }>({
    start_date: '',
    end_date: ''
  });

  // Function to calculate date range based on selected period
  const calculateDateRange = (period: Period) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (period) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'yearly':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        endDate = new Date(); // Current date
        break;
    }

    setDateRange({
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    });
  };

  // Update date range when period changes
  useEffect(() => {
    calculateDateRange(selectedPeriod);
  }, [selectedPeriod]);

  // Format the query string correctly
  const queryString = dateRange.start_date 
    ? `area-map&start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`
    : 'area-map';

  const { data: bookingsCount } = useAllBookingsCount(queryString);
  // const { data: bookingsCounts } = useAllBookingsCount(`count&${queryString}`);

  // Calculate total bookings for the selected period

  const containerStyle = {
    width: '100%',
    height: '400px'
  };

  // Center map on Lagos
  const center = {
    lat: 6.5244,
    lng: 3.3792
  };

  const apiKey = import.meta.env.VITE_GMAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  });

  // Calculate demand level for each area based on period total
  const getDemandLevel = (total: number): DemandLevel => {
    // Find the maximum bookings in any area
    const maxBookings = bookingsCount?.reduce((sum: number, point: BookingDataPoint) => sum + point.total, 0) || 0;
    // Calculate percentage relative to the maximum
    const percentage = (total / maxBookings) * 100;
    console.log(percentage,maxBookings,'percentssagess')
    if (percentage >= 51) return 'high';
    if (percentage >= 21 && percentage <= 50) return 'mid';
    return 'low';
  };

  return (
    <div className="bg-white border border-[#E5E9F0] rounded-lg p-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Hot spots in Lagos</h3>
        <div className="text-sm text-gray-500">
          <button 
            onClick={() => setSelectedPeriod('daily')}
            className={`px-3 py-1 text-xs cursor-pointer rounded-bl-md rounded-tl-md border border-[#F2F4F7] ${
              selectedPeriod === 'daily' ? 'text-[#fff] bg-[#E86229]' : 'text-[#475467]'
            }`}
          >
            Daily
          </button>
          <button 
            onClick={() => setSelectedPeriod('weekly')}
            className={`px-3 py-1 text-xs cursor-pointer border border-[#F2F4F7] ${
              selectedPeriod === 'weekly' ? 'text-[#fff] bg-[#E86229]' : 'text-[#475467]'
            }`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setSelectedPeriod('monthly')}
            className={`px-3 py-1 text-xs cursor-pointer border border-[#F2F4F7] ${
              selectedPeriod === 'monthly' ? 'text-[#fff] bg-[#E86229]' : 'text-[#475467]'
            }`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setSelectedPeriod('yearly')}
            className={`px-3 py-1 text-xs cursor-pointer border border-[#F2F4F7] ${
              selectedPeriod === 'yearly' ? 'text-[#fff] bg-[#E86229]' : 'text-[#475467]'
            }`}
          >
            Yearly
          </button>
          <button 
            onClick={() => setSelectedPeriod('all')}
            className={`px-3 py-1 text-xs cursor-pointer rounded-br-md rounded-tr-md border border-[#F2F4F7] ${
              selectedPeriod === 'all' ? 'text-[#fff] bg-[#E86229]' : 'text-[#475467]'
            }`}
          >
            All time
          </button>
        </div>
      </div>
      
      <div className="h-96 mb-8 flex items-center rounded-lg overflow-hidden justify-center text-gray-600 font-bold">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
          >
            {/* Add markers here based on the data */}
            {bookingsCount?.map((point: BookingDataPoint, index: number) => {
              const demandLevel = getDemandLevel(point.total);
              return (
                <RippleMarker
                  key={index}
                  position={{
                    lat: point.latitude,
                    lng: point.longitude
                  }}
                  title={`${point.area || 'Unknown Area'} (${point.total} requests)`}
                  demandLevel={demandLevel}
                />
              );
            })}
          </GoogleMap>
        ) : (
          <img src={Images.map} alt="Filter" className="w-full rounded-lg" /> // Fallback to image if map not loaded
        )}
      </div>
      <div className="mt-4 flex items-center gap-4 text-sm">
        <p><span className="inline-block w-3 h-3 mr-1 rounded-sm bg-red-500"></span>High demand area (≥51%)</p>
        <p><span className="inline-block w-3 h-3 mr-1 rounded-sm bg-green-500"></span>Mid demand area (21-50%)</p>
        <p><span className="inline-block w-3 h-3 mr-1 rounded-sm bg-yellow-500"></span>Low demand area (&lt;20%)</p>
      </div>
    </div>
  );
};

export default LagosHotspotsMap;