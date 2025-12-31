import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Select, AutoComplete } from 'antd';
import { updateAsset } from '@/api/operatorsApi';
import toast from 'react-hot-toast';
import ConfirmOperator from '@/pages/dashboard/screens/operations/2FA';

interface EditAssetProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onAssetUpdated?: () => void;
  assetData: {
    asset_id: string;
    operator_id: string;
    brand_name: string;
    vehicle_model: string;
    plate_number: string;
    availability: 'Available' | 'Unavailable';
    status: 'Enroute' | 'At rest';
    category?: string;
    home_area?: {
      type: string;
      coordinates: [number, number];
      address: string;
    };
  };
}

interface PlaceResult {
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    location_type: string;
    viewport: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };
  place_id: string;
  types: string[];
}

const AddressDetails: React.FC<{ result: PlaceResult }> = ({ result }) => {
  return (
    <div className="bg-[#F9FAFB] rounded-lg p-4 mb-4">
      <h3 className="text-[#475467] font-medium mb-3">Address Details</h3>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm text-[#667085]">Full Address</p>
          <p className="text-[#475467]">{result.formatted_address}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-2 bg-white rounded">
            <p className="text-sm text-[#667085]">Latitude</p>
            <p className="text-[#475467]">{result.geometry.location.lat}</p>
          </div>
          <div className="p-2 bg-white rounded">
            <p className="text-sm text-[#667085]">Longitude</p>
            <p className="text-[#475467]">{result.geometry.location.lng}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditAsset: React.FC<EditAssetProps> = ({ showModal, setShowModal, onAssetUpdated, assetData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<'Available' | 'Unavailable'>(assetData.availability);
  const [status, setStatus] = useState<'Enroute' | 'At rest'>(assetData.status);
  const [show2FA, setShow2FA] = useState(false);
  const [formValues, setFormValues] = useState<any>(null);
  const [selectedAddress, setSelectedAddress] = useState(assetData.home_area?.address || '');
  const [fetchedCoordinates, setFetchedCoordinates] = useState<{ longitude: number; latitude: number } | null>(assetData.home_area?.coordinates ? {
    longitude: assetData.home_area.coordinates[0],
    latitude: assetData.home_area.coordinates[1]
  } : null);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [fetchingAddress] = useState(false);
  const [addressDetails, setAddressDetails] = useState<PlaceResult | null>(null);

  useEffect(() => {
    if (showModal && assetData) {
      form.setFieldsValue({
        brandName: assetData.brand_name,
        vehicleModel: assetData.vehicle_model,
        numberPlate: assetData.plate_number,
        availability: assetData.availability,
        operator_id: assetData.operator_id,
        status: assetData.status,
        Category: assetData.category,
        vehicleLocation: assetData.home_area?.address
      });

      // Initialize address details if we have coordinates
      if (assetData.home_area?.coordinates && assetData.home_area?.address) {
        setSelectedAddress(assetData.home_area.address);
        setFetchedCoordinates({
          longitude: assetData.home_area.coordinates[0],
          latitude: assetData.home_area.coordinates[1]
        });
        // Create a mock PlaceResult for existing address
        setAddressDetails({
          formatted_address: assetData.home_area.address,
          geometry: {
            location: {
              lat: assetData.home_area.coordinates[1],
              lng: assetData.home_area.coordinates[0]
            },
            location_type: 'ROOFTOP',
            viewport: {
              northeast: {
                lat: assetData.home_area.coordinates[1] + 0.01,
                lng: assetData.home_area.coordinates[0] + 0.01
              },
              southwest: {
                lat: assetData.home_area.coordinates[1] - 0.01,
                lng: assetData.home_area.coordinates[0] - 0.01
              }
            }
          },
          address_components: [],
          place_id: '',
          types: []
        });
      }
    }
  }, [showModal, assetData, form]);

  const handleClose = () => {
    setShowModal(false);
    form.resetFields();
    setLoading(false);
    setShow2FA(false);
    setFormValues(null);
    setFetchedCoordinates(null);
    setSelectedAddress('');
    setAddressDetails(null);
    setAddressSuggestions([]);
  };

  // const fetchAddressSuggestions = async (input: string) => {
  //   if (!input || input.length < 3) {
  //     setAddressSuggestions([]);
  //     return;
  //   }

  //   try {
  //     const response = await fetch(
  //       `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=AIzaSyBHlJ9KQFnRZMz5jV6bZh-OQuS9iw16kGA`
  //     );
      
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
      
  //     const data = await response.json();
      
  //     if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
  //       throw new Error(data.error_message || 'Failed to fetch address suggestions');
  //     }
      
  //     const suggestions = data.predictions?.map((prediction: any) => prediction.description) || [];
  //     setAddressSuggestions(suggestions);
  //   } catch (error) {
  //     console.error('Error fetching address suggestions:', error);
  //     setAddressSuggestions([]);
  //   }
  // };

  const fetchCoordinatesForAddress = async (address: string) => {
    if (!address) {
      setFetchedCoordinates(null);
      setAddressDetails(null);
      return;
    }

    setLoading(true);
    setFetchedCoordinates(null);
    setSelectedAddress(address);
    setAddressDetails(null);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyBHlJ9KQFnRZMz5jV6bZh-OQuS9iw16kGA`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(data.error_message || 'Failed to geocode address');
      }
      
      if (!data.results || data.results.length === 0) {
        throw new Error('No results found for this address');
      }
      
      const result = data.results[0];
      const location = result.geometry.location;
      const coordinates = { 
        longitude: location.lng, 
        latitude: location.lat 
      };
      
      setFetchedCoordinates(coordinates);
      setAddressDetails(result);
      return coordinates;
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      setFetchedCoordinates(null);
      setAddressDetails(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (value: string) => {
    fetchCoordinatesForAddress(value);
    setAddressSuggestions([]);
  };

  const handleAddressSearch = (value: string) => {
    if (value.length > 3) {
      fetchCoordinatesForAddress(value);
    }
  };

  const handleFinish = async (values: any) => {
    const plateNumberRegex = /^[A-Za-z0-9]{3}-[A-Za-z0-9]+$/;
    if (!plateNumberRegex.test(values.numberPlate)) {
      toast.error('Plate number should be in ABC-123');
      return;
    }

    if (!fetchedCoordinates) {
      toast.error('Please enter a valid address and wait for coordinates to be fetched.');
      return;
    }

    setFormValues(values);
    setShow2FA(true);
  };

  const handle2FASuccess = async (otp: string) => {
    if (!formValues) return;

    setLoading(true);
    
    const payload = {
      brand_name: formValues.brandName,
      plate_number: formValues.numberPlate,
      vehicle_model: formValues.vehicleModel,
      availability: availability,
      operator_id: assetData.operator_id,
      status: status,
      category: formValues.Category,
      home_area_address: selectedAddress,
      home_area_coordinate: fetchedCoordinates,
      otp: otp
    };

    try {
      const response = await updateAsset(assetData.asset_id, payload);
      if (response?.status !== 'ok') {
        toast.error(response?.response?.data?.msg || 'Failed to update asset.');
      } else {
        toast.success('Asset updated successfully!');
        handleClose();
        if (onAssetUpdated) onAssetUpdated();
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while updating asset.');
    } finally {
      setLoading(false);
      setShow2FA(false);
      setFormValues(null);
    }
  };

  if (!showModal) return null;

  return (
    <>
      <div className="fixed inset-0 z-[999] flex justify-end bg-[#38383880] p-5 bg-opacity-50" onClick={handleClose}>
        <div className="md:w-[48%] lg:w-1/3 w-100 z-[9999] h-full bg-white rounded-xl slide-in overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center py-3 px-6">
            <h2 className="text-md font-semibold mb-0 text-[#1C2023] capitalize">Edit asset</h2>
            <button
              onClick={handleClose}
              className="text-[#7D8489] bg-[#EEF0F2] cursor-pointer py-2 px-3 rounded-3xl hover:text-black"
            >
              ✕
            </button>
          </div>
          <div className='overflow-y-auto flex flex-col border-t border-[#D6DADD] justify-between mb-5 h-[87%] slide-in scrollbar-hide hover:scrollbar-show'>
            <div className="px-10 pt-3 mt-8">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                className="space-y-4"
              >
                <Form.Item
                  label="Brand Name"
                  name="brandName"
                  rules={[{ required: true, message: 'Please enter brand name!' }]}
                >
                  <Input className="h-[42px]" placeholder="Enter brand name" />
                </Form.Item>

                <Form.Item
                  label="Vehicle Model"
                  name="vehicleModel"
                  rules={[{ required: true, message: 'Please enter vehicle model!' }]}
                >
                  <Input className="h-[42px]" placeholder="Enter vehicle model" />
                </Form.Item>

                <Form.Item
                  label="Category"
                  name="Category"
                  rules={[{ required: true, message: 'Please select a Category' }]}
                >
                  <Select placeholder="Select" className='!h-[42px]'>
                    <Select.Option value="Category A">Category A</Select.Option>
                    <Select.Option value="Category B">Category B</Select.Option>
                    <Select.Option value="Category C">Category C</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Number Plate"
                  name="numberPlate"
                  rules={[{ required: true, message: 'Please enter number plate!' }]}
                >
                  <Input className="h-[42px]" placeholder="Enter number plate (e.g., ABC-123)" />
                </Form.Item>

                <Form.Item
                  label="Availability"
                  name="availability"
                  rules={[{ required: true, message: 'Please select availability!' }]}
                >
                  <Select
                    className="h-[42px]!"
                    value={availability}
                    onChange={(value) => setAvailability(value)}
                  >
                    <Select.Option value="Available">Available</Select.Option>
                    <Select.Option value="Unavailable">Unavailable</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Status"
                  name="status"
                  rules={[{ required: true, message: 'Please select status!' }]}
                >
                  <Select
                    className="h-[42px]!"
                    value={status}
                    onChange={(value) => setStatus(value)}
                  >
                    <Select.Option value="Enroute">Enroute</Select.Option>
                    <Select.Option value="At rest">At rest</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Vehicle location"
                  name="vehicleLocation"
                  rules={[{ required: true, message: 'Please enter vehicle location' }]}
                >
                  <AutoComplete
                    options={addressSuggestions.map(address => ({ value: address }))}
                    onSelect={handleAddressSelect}
                    onSearch={handleAddressSearch}
                    className='!h-[42px]'
                    placeholder="Start typing an address..."
                    notFoundContent={fetchingAddress ? 'Searching...' : null}
                  />
                </Form.Item>

                {addressDetails && (
                  <AddressDetails result={addressDetails} />
                )}

                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    onClick={handleClose}
                    className="px-4 py-2 rounded-lg h-[42px]! cursor-pointer border border-[#D0D5DD] text-[#344054] font-medium hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    disabled={loading || !fetchedCoordinates}
                    className="px-4 py-2 rounded-lg h-[42px]! cursor-pointer bg-[#FF6C2D] text-white font-medium hover:bg-[#E55B1F]"
                  >
                    Update
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>

      {show2FA && (
        <ConfirmOperator
          onClose={() => setShow2FA(false)}
          onSuccess={handle2FASuccess}
        />
      )}
    </>
  );
};

export default EditAsset; 