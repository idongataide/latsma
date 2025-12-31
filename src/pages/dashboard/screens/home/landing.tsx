import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AutoComplete, Button } from 'antd';
import { FaCrosshairs, FaTimes } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

interface LocationData {
  address: string;
  fullAddress: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyC6OO39gLvWbZpMzBiLSs1pGNehjJbr2Vg';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [destinationLocation, setDestinationLocation] = useState<LocationData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [destinationSearch, setDestinationSearch] = useState<string>('');
  const [currentLocationSearch, setCurrentLocationSearch] = useState<string>('');
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [currentLocationSuggestions, setCurrentLocationSuggestions] = useState<string[]>([]);
  const [loadingDestination, setLoadingDestination] = useState(false);
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState(false);
  const [showCurrentLocation, setShowCurrentLocation] = useState(false);

  // Fetch autocomplete suggestions (optional, will work if API is available)
  const fetchAutocompleteSuggestions = async (input: string, isDestination: boolean) => {
    if (!input || input.length < 3) {
      if (isDestination) {
        setDestinationSuggestions([]);
      } else {
        setCurrentLocationSuggestions([]);
      }
      return;
    }

    try {
      const response = await fetch(
        `/maps/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.predictions) {
        const suggestions = data.predictions.map((prediction: any) => prediction.description);
        if (isDestination) {
          setDestinationSuggestions(suggestions);
        } else {
          setCurrentLocationSuggestions(suggestions);
        }
      } else {
        if (isDestination) {
          setDestinationSuggestions([]);
        } else {
          setCurrentLocationSuggestions([]);
        }
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      if (isDestination) {
        setDestinationSuggestions([]);
      } else {
        setCurrentLocationSuggestions([]);
      }
    }
  };

  // Try to fetch coordinates, but proceed with manual address if API fails
  const tryFetchCoordinates = async (address: string, isDestination: boolean) => {
    if (!address.trim()) return null;

    if (isDestination) {
      setLoadingDestination(true);
    } else {
      setLoadingCurrent(true);
    }

    try {
      const response = await fetch(
        `/maps/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;
        const coordinates = { 
          latitude: location.lat,
          longitude: location.lng
        };
        
        const locationData: LocationData = {
          address: address,
          fullAddress: result.formatted_address || address,
          coordinates
        };
        
        return locationData;
      } else {
        // API returned error or no results - create location data without coordinates
        console.warn(`Geocoding API error: ${data.status} - ${data.error_message || 'No results'}`);
        const locationData: LocationData = {
          address: address,
          fullAddress: address,
          coordinates: undefined
        };
        return locationData;
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      // API failed - create location data without coordinates
      const locationData: LocationData = {
        address: address,
        fullAddress: address,
        coordinates: undefined
      };
      return locationData;
    } finally {
      if (isDestination) {
        setLoadingDestination(false);
      } else {
        setLoadingCurrent(false);
      }
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setGettingCurrentLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Create location data with coordinates from geolocation
          const locationData: LocationData = {
            address: 'Current Location',
            fullAddress: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
            coordinates: { latitude, longitude }
          };
          setCurrentLocation(locationData);
          setCurrentLocationSearch('Current Location');
          toast.success('Current location detected');
        } catch (error) {
          console.error('Error getting location:', error);
          toast.error('Failed to get current location. Please enter it manually.');
        } finally {
          setGettingCurrentLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Failed to get current location. Please enter it manually.');
        setGettingCurrentLocation(false);
      }
    );
  };

  const clearCurrentLocation = () => {
    setCurrentLocation(null);
    setCurrentLocationSearch('');
    setCurrentLocationSuggestions([]);
  };

  const handleDestinationSelect = async (value: string) => {
    setDestinationSearch(value);
    setDestinationSuggestions([]);
    const locationData = await tryFetchCoordinates(value, true);
    if (locationData) {
      setDestinationLocation(locationData);
    }
  };

  const handleDestinationSearch = async (value: string) => {
    setDestinationSearch(value);
    if (value.length >= 3) {
      await fetchAutocompleteSuggestions(value, true);
    } else {
      setDestinationSuggestions([]);
    }
  };

  const handleCurrentLocationSelect = async (value: string) => {
    setCurrentLocationSearch(value);
    setCurrentLocationSuggestions([]);
    const locationData = await tryFetchCoordinates(value, false);
    if (locationData) {
      setCurrentLocation(locationData);
    }
  };

  const handleCurrentLocationSearch = async (value: string) => {
    setCurrentLocationSearch(value);
    if (value.length >= 3) {
      await fetchAutocompleteSuggestions(value, false);
    } else {
      setCurrentLocationSuggestions([]);
    }
  };

  const handleProceed = async () => {
    if (!showCurrentLocation) {
      // First step: Validate destination
      if (!destinationSearch.trim()) {
        toast.error('Please enter a destination location');
        return;
      }

      // If destination location is not already fetched, create it from the manual input
      if (!destinationLocation) {
        const locationData: LocationData = {
          address: destinationSearch,
          fullAddress: destinationSearch,
          coordinates: undefined
        };
        setDestinationLocation(locationData);
      }

      // Proceed to next step
      setShowCurrentLocation(true);
    } else {
      // Second step: Validate current location
      if (!currentLocationSearch.trim()) {
        toast.error('Please enter your current location');
        return;
      }

      // If current location is not already fetched, create it from the manual input
      if (!currentLocation) {
        const locationData: LocationData = {
          address: currentLocationSearch,
          fullAddress: currentLocationSearch,
          coordinates: undefined
        };
        setCurrentLocation(locationData);
      }

      // Make sure we have location objects (they should be set above)
      const finalDestinationLocation = destinationLocation || {
        address: destinationSearch,
        fullAddress: destinationSearch,
        coordinates: undefined
      };

      const finalCurrentLocation = currentLocation || {
        address: currentLocationSearch,
        fullAddress: currentLocationSearch,
        coordinates: undefined
      };

      // Navigate to booking screen with location data
      navigate('/home/booking', {
        state: {
          destinationLocation: finalDestinationLocation,
          currentLocation: finalCurrentLocation
        }
      });
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `#1D2939 url('/images/map-bg.png') center/cover no-repeat`
      }}
>      <Toaster position="top-right" />
      
      {/* Background Map Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGMwIDIuMjA5LTEuNzkxIDQtNCA0cy00LTEuNzkxLTQtNCAxLjc5MS00IDQtNCA0IDEuNzkxIDQgNHptMTAtMTBjMCAyLjIwOS0xLjc5MSA0LTQgNHMtNC0xLjc5MS00LTQgMS43OTEtNCA0LTQgNCAxLjc5MSA0IDR6IiBzdHJva2U9IiNGRkYyIiBzdHJva2Utd2lkdGg9IjEuNSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
      </div>

      {/* Location indicators */}
      <div className="absolute bottom-50 left-40 flex items-center justify-center">
        <span className="absolute w-10 h-10 rounded-full bg-[#FF6C2D] opacity-20 animate-beacon"></span>      
        <span className="w-4 h-4 bg-[#FF6C2D] rounded-full shadow-lg opacity-50 shadow-[#FF6C2D]"></span>
      </div>
      <div className="absolute bottom-50 right-42 flex items-center justify-center">
        <span className="absolute w-10 h-10 rounded-full bg-[#FF6C2D] opacity-20 animate-beacon"></span>      
        <span className="w-4 h-4 bg-[#FF6C2D] rounded-full shadow-lg opacity-50 shadow-[#FF6C2D]"></span>
      </div>
      <div className="absolute bottom-32 right-180 flex items-center justify-center">
        <span className="absolute w-10 h-10 rounded-full bg-[#FF6C2D] opacity-20 animate-beacon"></span>      
        <span className="w-4 h-4 bg-[#FF6C2D] rounded-full shadow-lg opacity-50 shadow-[#FF6C2D]"></span>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        <div className="w-full max-w-md">
          {/* Main Heading */}
          <h1 className="text-white text-4xl md:text-5xl leading-[1.2]! font-bold text-center mb-12">
            Find the Nearest Towing Van Closest to You
          </h1>

          <div className="w-full max-w-[350px] mx-auto">
            {!showCurrentLocation ? (
              <>
                {/* Destination Input - First Step */}
                <div className="mb-5">                  
                  <AutoComplete
                    options={destinationSuggestions.map(addr => ({ value: addr }))}
                    onSelect={handleDestinationSelect}
                    onSearch={handleDestinationSearch}
                    value={destinationSearch}
                    onChange={(value) => setDestinationSearch(value)}
                    className="w-full"
                    placeholder="Enter Destination Address"
                    size="large"
                    style={{ height: '45px' }}
                    notFoundContent={loadingDestination ? 'Searching...' : null}
                  />                  
                </div>
                
                {/* Proceed Button - First Step */}
                {destinationSearch.trim() && (
                  <Button
                    type="primary"
                    onClick={handleProceed}
                    loading={loadingDestination}
                    disabled={!destinationSearch.trim()}
                    className="w-full h-[50px] rounded-sm! bg-[#FF6C2D] text-white font-medium text-lg hover:bg-[#E55B1F] transition border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="large"
                  >
                    {loadingDestination ? 'Checking address...' : 'Proceed'}
                  </Button>
                )}
              </>
            ) : (
              <>
                {/* Current Location Input - Second Step */}
                <div className="mb-8">
                  <label className="block text-white text-sm font-medium mb-2">
                    Current Location
                  </label>
                  <div className="relative">
                    <AutoComplete
                      options={currentLocationSuggestions.map(addr => ({ value: addr }))}
                      onSelect={handleCurrentLocationSelect}
                      onSearch={handleCurrentLocationSearch}
                      value={currentLocationSearch}
                      onChange={(value) => setCurrentLocationSearch(value)}
                      className="w-full"
                      placeholder="Enter Your Current Address"
                      size="large"
                      style={{ height: '45px' }}
                      notFoundContent={loadingCurrent ? 'Searching...' : null}
                      disabled={gettingCurrentLocation}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {gettingCurrentLocation ? (
                        <span className="text-white text-sm">Getting location...</span>
                      ) : (
                        <>
                          {currentLocationSearch ? (
                            <button
                              onClick={clearCurrentLocation}
                              className="text-white hover:text-[#FF6C2D] transition-colors"
                              title="Clear location"
                            >
                              <FaTimes className="text-lg" />
                            </button>
                          ) : (
                            <button
                              onClick={getCurrentLocation}
                              className="text-white hover:text-[#FF6C2D] transition-colors"
                              title="Use current location"
                            >
                              <FaCrosshairs className="text-lg" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">
                    Enter your current address or use your device location
                  </p>
                </div>

                {/* Proceed Button - Second Step */}
                <Button
                  type="primary"
                  onClick={handleProceed}
                  loading={loadingCurrent}
                  disabled={!currentLocationSearch.trim()}
                  className="w-full h-[50px]! rounded-sm! bg-[#FF6C2D] text-white! font-medium text-lg hover:bg-[#E55B1F] transition border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="large"
                >
                  {loadingCurrent ? 'Checking address...' : 'Find Towing Van'}
                </Button>

                {/* Back button to edit destination */}
                <Button
                  type="text"
                  onClick={() => setShowCurrentLocation(false)}
                  className="w-full mt-4 text-[#FF6C2D]! hover:text-[#FF6C2D]"
                >
                  ← Back to edit destination
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;