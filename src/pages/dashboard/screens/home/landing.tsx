import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AutoComplete, Button, Select, Spin } from 'antd';
import { FaCrosshairs, FaTimes, FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useCommandCenters } from '@/hooks/useAdmin';

const { Option } = Select;

interface LocationData {
  address: string;
  fullAddress: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface CommandCenterItem {
  _id: string;
  name: string;
  address: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  command_id: string;
}

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [destinationLocation, setDestinationLocation] = useState<LocationData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [destinationSearch, setDestinationSearch] = useState<string>('');
  const [currentLocationSearch, setCurrentLocationSearch] = useState<string>('');
  const [currentLocationSuggestions, setCurrentLocationSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [loadingDestination, setLoadingDestination] = useState(false);
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState(false);
  const [showCurrentLocation, setShowCurrentLocation] = useState(false);
  const [showManualDestination, setShowManualDestination] = useState(false);
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Fetch command centers
  const { data: commandCenters, isLoading: isLoadingCommandCenters } = useCommandCenters();

  const handleDestinationSelect = (commandId: string) => {
    const selectedCommand = commandCenters?.find(
      (center: CommandCenterItem) => center.command_id === commandId || center._id === commandId
    );
    
    if (selectedCommand) {
      setDestinationSearch(selectedCommand.name);
      
      const coordinates = selectedCommand.location?.coordinates || [];
      const locationData: LocationData = {
        address: selectedCommand.name,
        fullAddress: selectedCommand.address,
        coordinates: coordinates.length >= 2 ? {
          latitude: coordinates[1], // latitude is at index 1
          longitude: coordinates[0] // longitude is at index 0
        } : undefined
      };
      
      setDestinationLocation(locationData);
      toast.success(`${selectedCommand.name} selected`);
    }
  };

  const tryFetchCoordinates = async (address: string): Promise<LocationData | null> => {
    if (!address.trim()) return null;

    try {
      const response = await fetch(
        `/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
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
    }
  };

  // Fetch autocomplete suggestions for destination
  const fetchDestinationSuggestions = async (input: string) => {
    if (!input || input.length < 3) {
      setDestinationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.predictions) {
        const suggestions = data.predictions.map((prediction: any) => prediction.description);
        setDestinationSuggestions(suggestions);
      } else {
        setDestinationSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching destination suggestions:', error);
      setDestinationSuggestions([]);
    }
  };

  const fetchAutocompleteSuggestions = async (input: string) => {
    if (!input || input.length < 3) {
      setCurrentLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.predictions) {
        const suggestions = data.predictions.map((prediction: any) => prediction.description);
        setCurrentLocationSuggestions(suggestions);
      } else {
        setCurrentLocationSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setCurrentLocationSuggestions([]);
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

  const clearDestinationLocation = () => {
    setDestinationLocation(null);
    setDestinationSearch('');
    setDestinationSuggestions([]);
    setShowManualDestination(false);
  };

  const handleManualDestinationSelect = async (value: string) => {
    setDestinationSearch(value);
    setDestinationSuggestions([]);
    setLoadingDestination(true);
    const locationData = await tryFetchCoordinates(value);
    if (locationData) {
      setDestinationLocation(locationData);
      toast.success('Destination address set');
    }
    setLoadingDestination(false);
  };

  const handleCurrentLocationSelect = async (value: string) => {
    setCurrentLocationSearch(value);
    setCurrentLocationSuggestions([]);
    setLoadingCurrent(true);
    const locationData = await tryFetchCoordinates(value);
    if (locationData) {
      setCurrentLocation(locationData);
    }
    setLoadingCurrent(false);
  };

  const handleDestinationSearchInput = async (value: string) => {
    setDestinationSearch(value);
    if (value.length >= 3) {
      await fetchDestinationSuggestions(value);
    } else {
      setDestinationSuggestions([]);
    }
  };

  const handleCurrentLocationSearch = async (value: string) => {
    setCurrentLocationSearch(value);
    if (value.length >= 3) {
      await fetchAutocompleteSuggestions(value);
    } else {
      setCurrentLocationSuggestions([]);
    }
  };

  const handleProceed = async () => {
    if (!showCurrentLocation) {
      if (!destinationSearch.trim()) {
        toast.error('Please select or enter a destination');
        return;
      }

      // If manual destination and location not fetched yet, fetch it now
      if (showManualDestination && !destinationLocation) {
        setLoadingDestination(true);
        const locationData = await tryFetchCoordinates(destinationSearch);
        if (locationData) {
          setDestinationLocation(locationData);
        }
        setLoadingDestination(false);
      }

      // If command center selected and location not set, set it
      if (!showManualDestination && !destinationLocation) {
        const selectedCommand = commandCenters?.find(
          (center: CommandCenterItem) => center.name === destinationSearch
        );
        
        if (selectedCommand) {
          const coordinates = selectedCommand.location?.coordinates || [];
          const locationData: LocationData = {
            address: selectedCommand.name,
            fullAddress: selectedCommand.address,
            coordinates: coordinates.length >= 2 ? {
              latitude: coordinates[1],
              longitude: coordinates[0]
            } : undefined
          };
          setDestinationLocation(locationData);
        }
      }

      setShowCurrentLocation(true);
    } else {
      if (!currentLocationSearch.trim()) {
        toast.error('Please enter your current location');
        return;
      }

      if (!currentLocation) {
        setLoadingCurrent(true);
        const locationData = await tryFetchCoordinates(currentLocationSearch);
        if (locationData) {
          setCurrentLocation(locationData);
        }
        setLoadingCurrent(false);
      }

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

  const toggleManualDestination = () => {
    setShowManualDestination(true);
    setDestinationSearch('');
    setDestinationLocation(null);
    setDestinationSuggestions([]);
  };

  const toggleBackToZonalOffices = () => {
    setShowManualDestination(false);
    setDestinationSearch('');
    setDestinationLocation(null);
    setDestinationSuggestions([]);
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `#1D2939 url('/images/map-bg.png') center/cover no-repeat`
      }}
    >
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
                  <label className="block text-white text-sm font-medium mb-2">
                    {showManualDestination ? 'Enter Destination Address' : 'Select Destination Zonal Office'}
                  </label>
                  
                  {!showManualDestination ? (
                    <>
                      {isLoadingCommandCenters ? (
                        <div className="flex items-center justify-center p-4 bg-white rounded">
                          <Spin size="small" />
                          <span className="ml-2 text-gray-600">Loading zonal offices...</span>
                        </div>
                      ) : (
                        <Select
                          placeholder="Select a zonal office"
                          className="w-full h-[45px]! capitalize!"
                          size="large"
                          onChange={handleDestinationSelect}
                          value={destinationSearch || undefined}
                          showSearch
                          filterOption={(input, option) =>
                            typeof option?.children === 'string' && (option.children as string).toLowerCase().includes(input.toLowerCase())
                          }
                          loading={isLoadingCommandCenters}
                        >
                          {commandCenters?.map((center: CommandCenterItem) => (
                            <Option 
                              key={center.command_id || center._id} 
                              value={center.command_id || center._id}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium capitalize!">{center.name}</span>
                                <span className="text-xs text-gray-500 truncate capitalize">
                                  {center.address}
                                </span>
                              </div>
                            </Option>
                          ))}
                        </Select>
                      )}
                      
                      <div className="mt-3 text-right">
                        <button
                          type="button"
                          onClick={toggleManualDestination}
                          className="text-[#FF6C2D] hover:text-[#E55B1F] text-sm font-medium flex items-center gap-1 ml-auto"
                        >
                          <FaEdit className="text-xs" />
                          Can't find it? Enter address manually
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative mb-2">
                        <AutoComplete
                          options={destinationSuggestions.map(addr => ({ value: addr }))}
                          onSelect={handleManualDestinationSelect}
                          onSearch={handleDestinationSearchInput}
                          value={destinationSearch}
                          onChange={(value) => setDestinationSearch(value)}
                          className="w-full"
                          placeholder="Enter destination address"
                          size="large"
                          style={{ height: '45px' }}
                          notFoundContent={loadingDestination ? 'Searching...' : null}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {destinationSearch && (
                            <button
                              onClick={clearDestinationLocation}
                              className="text-white hover:text-[#FF6C2D] transition-colors"
                              title="Clear destination"
                            >
                              <FaTimes className="text-lg" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-1 text-right">
                        <button
                          type="button"
                          onClick={toggleBackToZonalOffices}
                          className="text-[#FF6C2D] hover:text-[#E55B1F] text-sm font-medium flex items-center gap-1 ml-auto"
                        >
                          ← Back to zonal offices
                        </button>
                      </div>
                    </>
                  )}
                  
                  <p className="text-gray-300 text-xs mt-1">
                    {showManualDestination 
                      ? 'Enter any destination address'
                      : 'Choose from available LASTMA zonal offices'}
                  </p>
                </div>
                
                {/* Proceed Button - First Step */}
                {destinationSearch.trim() && (
                  <Button
                    type="primary"
                    onClick={handleProceed}
                    disabled={!destinationSearch.trim()}
                    loading={loadingDestination}
                    className="w-full h-[50px] rounded-sm! bg-[#FF6C2D] text-white font-medium text-lg hover:bg-[#E55B1F] transition border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="large"
                  >
                    {loadingDestination ? 'Fetching coordinates...' : 'Proceed'}
                  </Button>
                )}
              </>
            ) : (
              <>
                {/* Current Location Input - Second Step */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-white text-sm font-medium">
                      Destination Selected
                    </label>
                    <span className="text-[#FF6C2D] text-sm font-medium bg-[#FF6C2D]/10 px-3 py-1 rounded-full">
                      {destinationSearch}
                    </span>
                  </div>
                  
                  <label className="block text-white text-sm font-medium mb-2 mt-4">
                    Your Current Location
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
                    Enter your current address or click the <FaCrosshairs className="inline text-xs" /> icon to use your device location
                  </p>
                </div>

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

                <Button
                  type="text"
                  onClick={() => {
                    setShowCurrentLocation(false);
                    if (showManualDestination) {
                      setShowManualDestination(false);
                    }
                  }}
                  className="w-full mt-4 text-[#FF6C2D]! hover:text-[#E55B1F]"
                >
                  ← Back to select different destination
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