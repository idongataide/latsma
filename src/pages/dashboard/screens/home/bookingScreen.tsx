import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, Select } from 'antd';
import { FaAngleLeft, FaCloudUploadAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Images from '@/components/images';
import SummarySidebar from '@/pages/dashboard/screens/home/SummarySidebar';
import SuccessModal from '@/pages/dashboard/screens/home/SuccessModal';
import { createBookings } from '@/api/bookingsApi';

const { Option } = Select;
const { TextArea } = Input;

interface LocationData {
  address: string;
  fullAddress: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface BookingData {
  start_coord: {
    longitude: number;
    latitude: number;
  };
  end_coord: {
    longitude: number;
    latitude: number;
  };
  start_address: string;
  end_address: string;
  landmark: string;
  vehicle_loaded: string; // "0" or "1"
  vehicle_model: string;
  vehicle_color: string;
  vehicle_type: string;
  reason: string;
  plate_number: string;
  vehicle_reg: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  mobile?: string;
}

const BookingScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [vehicleRegistration, setVehicleRegistration] = useState<string>('private');
  const [isVehicleLoaded, setIsVehicleLoaded] = useState<string>('not-loaded');
  const [vehicleImage, setVehicleImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSummarySidebarOpen, setIsSummarySidebarOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [bookingSummaryData, setBookingSummaryData] = useState<any>(null);
  const [showDriverSection, setShowDriverSection] = useState(false);
  const [driverForm] = Form.useForm();
  
  // Get location data from navigation state
  const destinationLocation = (location.state as any)?.destinationLocation as LocationData | undefined;
  const currentLocation = (location.state as any)?.currentLocation as LocationData | undefined;

  
  useEffect(() => {
    if (!destinationLocation || !currentLocation) {
      toast.error('Please select locations first');
      navigate('/');
    }
  }, [destinationLocation, currentLocation, navigate]);

  const handleVehicleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        toast.error('You can only upload PNG or JPEG files!');
        return;
      }
      const isLt3M = file.size / 1024 / 1024 < 3;
      if (!isLt3M) {
        toast.error('Image must be smaller than 3MB!');
        return;
      }
      setVehicleImage(file);
    }
  };

  const handleUpload = () => {
    if (!vehicleImage) {
      toast.error('Please select an image first');
      return;
    }
    toast.success('Image uploaded successfully!');
  };

  const onFinish = (values: any) => {
    // Prepare booking summary data
    const summaryData = {
      destinationLocation: destinationLocation,
      currentLocation: currentLocation,
      location: destinationLocation?.address || '',
      landmark: values.landmarkDescription || '',
      vehicleModel: values.vehicleModel || '',
      vehicleColour: values.vehicleColour || '',
      vehicleType: values.vehicleType || '',
      numberPlate: values.numberPlate || '',
      vehicleRegistration: vehicleRegistration,
      reasonForTowing: values.reasonForTowing || '',
      isVehicleLoaded: isVehicleLoaded,
      vehicleImage: vehicleImage
    };

    setBookingSummaryData(summaryData);
    setShowDriverSection(true);
  };

  const onDriverFinish = (values: any) => {
    // Add driver data to booking summary
    const updatedSummaryData = {
      ...bookingSummaryData,
      driverFirstName: values.firstName,
      driverLastName: values.lastName,
      driverEmail: values.emailAddress,
      driverPhone: values.phoneNumber
    };
    setBookingSummaryData(updatedSummaryData);
    setIsSummarySidebarOpen(true);
    setShowDriverSection(false);
  };

  const handleSkipDriverSection = () => {
    setIsSummarySidebarOpen(true);
    setShowDriverSection(false);
  };

  const prepareBookingData = (): BookingData => {
    if (!bookingSummaryData || !currentLocation || !destinationLocation) {
      throw new Error('Missing booking data');
    }

    const formatVehicleType = (type: string): string => {
      const typeMap: Record<string, string> = {
        'sedan': 'sedan',
        'suv': 'suv',
        'truck': 'truck',
        'van': 'bus', // Assuming van maps to bus
        'bus': 'bus',
        'motorcycle': 'sedan', // Map to sedan as default
        'other': 'sedan' // Map to sedan as default
      };
      return typeMap[type.toLowerCase()] || 'sedan';
    };

    const formatReason = (reason: string): string => {
      const reasonMap: Record<string, string> = {
        'breakdown': 'malfunction',
        'accident': 'accident',
        'flat-tire': 'malfunction',
        'out-of-fuel': 'malfunction',
        'battery-dead': 'malfunction',
        'other': 'malfunction'
      };
      return reasonMap[reason.toLowerCase()] || 'malfunction';
    };

    return {
      start_coord: {
        longitude: currentLocation.coordinates?.longitude || 0.9,
        latitude: currentLocation.coordinates?.latitude || 0.23
      },
      end_coord: {
        longitude: destinationLocation.coordinates?.longitude || 0.4,
        latitude: destinationLocation.coordinates?.latitude || 0.5
      },
      start_address: currentLocation.address || '',
      end_address: destinationLocation.address || '',
      landmark: bookingSummaryData.landmark || '',
      vehicle_loaded: bookingSummaryData.isVehicleLoaded === 'loaded' ? '1' : '0',
      vehicle_model: bookingSummaryData.vehicleModel || '',
      vehicle_color: bookingSummaryData.vehicleColour || '',
      vehicle_type: formatVehicleType(bookingSummaryData.vehicleType || ''),
      reason: formatReason(bookingSummaryData.reasonForTowing || ''),
      plate_number: bookingSummaryData.numberPlate || '',
      vehicle_reg: bookingSummaryData.vehicleRegistration || 'private',
      first_name: bookingSummaryData.driverFirstName,
      last_name: bookingSummaryData.driverLastName,
      email: bookingSummaryData.driverEmail,
      mobile: bookingSummaryData.driverPhone
    };
  };

  

  const handleBookNow = async () => {
    setLoading(true);
  
    try {
      const bookingData = prepareBookingData();
      
      const response = await createBookings(bookingData);

      if (response?.error || response?.status === 'error' || response?.data?.status === 'error' || response?.response?.data?.status === 'error') {
        toast.error(response?.response?.data?.msg || response.msg || 'Failed to submit towing.');
        setLoading(false);
      } else {
        
        setLoading(false);
        setIsSummarySidebarOpen(false);
        setIsSuccessModalOpen(true);

        form.resetFields();
        driverForm.resetFields();
        setVehicleImage(null);
        setVehicleRegistration("private");
        setIsVehicleLoaded("not-loaded");
        setBookingSummaryData(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error('Booking error:', error);
      setLoading(false);
      toast.error('Failed to submit booking. Please try again.');
    }
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false); 
  };

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <div 
          className="flex items-center mb-5 cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <FaAngleLeft className='text-lg text-[#667085]' />
          <p className='ml-2 font-bold text-[#667085] text-lg'>Back</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-[#E5E9F0] mx-auto px-6 py-8 max-w-xl">

          {/* Promotional Banner */}
          <div className="mb-10">
            <img src={Images.bookingBanner} alt="Booking Banner" className="w-full h-full object-cover" />    
          </div>

          <div className="bg-[#F9FAFB] rounded-lg p-4 mb-4 border border-[#E5E9F0]">
            <div className="space-y-2">
              {currentLocation && (
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-[#667085] mr-3"></div>
                  <p className="text-sm font-medium text-[#344054]">{currentLocation.address}</p>
                </div>
              )}
              {destinationLocation && (
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full border-2 border-[#667085] mr-3"></div>
                  <p className="text-sm font-medium text-[#667085]">{destinationLocation.address}</p>
                </div>
              )}
            </div>
          </div>

          {!showDriverSection &&
            <Form 
              form={form}
              layout="vertical" 
              onFinish={onFinish}
            >
              {/* Location Details Section */}
              <div className="mb-8">
                <h3 className="text-[#344054] text-lg font-semibold mb-4">Location Details</h3>
                
                <Form.Item 
                  label="Landmark description" 
                  name="landmarkDescription"
                  rules={[{ required: true, message: 'Please enter landmark description' }]}
                >
                  <TextArea 
                    placeholder="Detailed description of the pickup location"
                    rows={4}
                    className="!h-auto"
                  />
                </Form.Item>
              </div>

              {/* Vehicle Details Section */}
              <div className="mb-8">
                <h3 className="text-[#344054] text-lg font-semibold mb-4">Vehicle Details</h3>
                
                <Form.Item 
                  label="Vehicle model" 
                  name="vehicleModel"
                  rules={[{ required: true, message: 'Please enter vehicle model' }]}
                >
                  <Input placeholder="e.g Lexus RX 350" className="!h-[42px]" />
                </Form.Item>

                <Form.Item 
                  label="Vehicle Colour" 
                  name="vehicleColour"
                  rules={[{ required: true, message: 'Please enter vehicle colour' }]}
                >
                  <Input placeholder="e.g Red" className="!h-[42px]" />
                </Form.Item>

                <Form.Item 
                  label="Vehicle type" 
                  name="vehicleType"
                  rules={[{ required: true, message: 'Please select vehicle type' }]}
                >
                  <Select placeholder="Select" className="!h-[42px]">
                    <Option value="sedan">Sedan</Option>
                    <Option value="suv">SUV</Option>
                    <Option value="truck">Truck</Option>
                    <Option value="van">Van</Option>
                    <Option value="motorcycle">Motorcycle</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Number plate"
                  name="numberPlate"
                  rules={[
                    { required: true, message: 'Please enter number plate' },                    
                  ]}
                >
                  <Input placeholder="Enter details" />
                </Form.Item>

                <Form.Item label="Vehicle registration" name="vehicleRegistration">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`flex-1 py-2.5 rounded-lg border text-base font-medium transition ${
                        vehicleRegistration === 'private' 
                          ? 'bg-[#FFF3ED] border-[#FF6C2D] text-[#FF6C2D]' 
                          : 'bg-white border-[#D0D5DD] text-[#667085]'
                      }`}
                      onClick={() => {
                        setVehicleRegistration('private');
                        form.setFieldsValue({ vehicleRegistration: 'private' });
                      }}
                    >
                      Private
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2.5 rounded-lg border text-base font-medium transition ${
                        vehicleRegistration === 'commercial' 
                          ? 'bg-[#FFF3ED] border-[#FF6C2D] text-[#FF6C2D]' 
                          : 'bg-white border-[#D0D5DD] text-[#667085]'
                      }`}
                      onClick={() => {
                        setVehicleRegistration('commercial');
                        form.setFieldsValue({ vehicleRegistration: 'commercial' });
                      }}
                    >
                      Commercial
                    </button>
                  </div>
                  <Input type="hidden" value={vehicleRegistration} />
                </Form.Item>

                <Form.Item 
                  label="Reason for towing request" 
                  name="reasonForTowing"
                  rules={[{ required: true, message: 'Please select reason for towing' }]}
                >
                  <Select placeholder="Select" className="!h-[42px]">
                    <Option value="breakdown">Breakdown</Option>
                    <Option value="accident">Accident</Option>
                    <Option value="flat-tire">Flat Tire</Option>
                    <Option value="out-of-fuel">Out of Fuel</Option>
                    <Option value="battery-dead">Dead Battery</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="Is the vehicle loaded?" name="isVehicleLoaded">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`flex-1 py-2.5 rounded-lg border text-base font-medium transition ${
                        isVehicleLoaded === 'not-loaded' 
                          ? 'bg-[#FFF3ED] border-[#FF6C2D] text-[#FF6C2D]' 
                          : 'bg-white border-[#D0D5DD] text-[#667085]'
                      }`}
                      onClick={() => {
                        setIsVehicleLoaded('not-loaded');
                        form.setFieldsValue({ isVehicleLoaded: 'not-loaded' });
                      }}
                    >
                      Not loaded
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2.5 rounded-lg border text-base font-medium transition ${
                        isVehicleLoaded === 'loaded' 
                          ? 'bg-[#FFF3ED] border-[#FF6C2D] text-[#FF6C2D]' 
                          : 'bg-white border-[#D0D5DD] text-[#667085]'
                      }`}
                      onClick={() => {
                        setIsVehicleLoaded('loaded');
                        form.setFieldsValue({ isVehicleLoaded: 'loaded' });
                      }}
                    >
                      Loaded
                    </button>
                  </div>
                  <Input type="hidden" value={isVehicleLoaded} />
                </Form.Item>
              </div>

              {/* Other Information Section */}
              <div className="mb-8">
                <h3 className="text-[#344054] text-lg font-semibold mb-4">Other Information</h3>
                
                <div className="mt-4">
                  <div className="text-md text-[#475467] font-medium mb-2">Vehicle image</div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleVehicleImageChange}
                    accept="image/jpeg,image/png"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center bg-[#fff] gap-3 cursor-pointer px-4 py-5 mb-4 rounded-xl border-[0.6px] text-left border-dashed border-[#FF9D72]"
                  >
                    <span className="bg-[#FFF0EA] rounded-full p-4">
                      <FaCloudUploadAlt className="text-[#FF6C2D]" />
                    </span>
                    <span>
                      <div className="font-medium text-[16px] text-[#475467]">
                        {vehicleImage ? vehicleImage.name : 'Click to upload'}
                      </div>
                      <div className="text-[10px] text-[#667085]">PNG or JPEG file, 3MB max.</div>
                    </span>
                    <span 
                      className={`text-md text-[#fff] ml-auto rounded-md px-4 py-2 font-medium ${
                        loading ? 'bg-gray-400' : 'bg-[#FF6C2D]'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpload();
                      }}
                    >
                      {loading ? 'Uploading...' : 'Upload'}
                    </span>
                  </button>
                </div>
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full h-[46px]! rounded-lg bg-[#FF6C2D] text-white font-medium text-lg hover:bg-[#E55B1F] transition border-0"
                >
                  Proceed
                </Button>
              </Form.Item>
            </Form>
          }
        </div>

        {/* Driver Information Section */}
        {showDriverSection && (
          <div className="bg-white rounded-2xl border border-[#E5E9F0] mx-auto px-6 py-8 max-w-xl mt-6">
            <Form
              form={driverForm}
              layout="vertical"
              onFinish={onDriverFinish}
            >
              <div className="mb-8">
                <h3 className="text-[#344054] text-lg font-semibold mb-4">Driver Information</h3>
                
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[{ required: true, message: 'Please enter first name' }]}
                >
                  <Input placeholder="e.g John" className="!h-[42px]" />
                </Form.Item>

                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[{ required: true, message: 'Please enter last name' }]}
                >
                  <Input placeholder="e.g Doe" className="!h-[42px]" />
                </Form.Item>

                <Form.Item
                  label="Email Address"
                  name="emailAddress"
                  rules={[
                    { required: true, message: 'Please enter email address' },
                    { type: 'email', message: 'Please enter a valid email address' }
                  ]}
                >
                  <Input placeholder="e.g john@example.com" className="!h-[42px]" />
                </Form.Item>

                <Form.Item
                  label="Phone Number"
                  name="phoneNumber"
                  rules={[{ required: true, message: 'Please enter phone number' }]}
                >
                  <Input placeholder="+234" className="!h-[42px]" />
                </Form.Item>
              </div>

              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleSkipDriverSection}
                  className="text-[#FF6C2D] text-sm font-medium hover:underline"
                >
                  SKIP SECTION
                </button>
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full h-[46px]! rounded-lg bg-[#FF6C2D] text-white font-medium text-lg hover:bg-[#E55B1F] transition border-0"
                >
                  Proceed
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </div>

      {/* Summary Sidebar */}
      <SummarySidebar
        isOpen={isSummarySidebarOpen}
        onClose={() => setIsSummarySidebarOpen(false)}
        bookingData={bookingSummaryData || {
          location: '',
          landmark: '',
          vehicleModel: '',
          vehicleColour: '',
          vehicleType: '',
          numberPlate: '',
          vehicleRegistration: '',
          reasonForTowing: '',
          isVehicleLoaded: '',
          vehicleImage: null
        }}
        loading={loading}
        onBookNow={handleBookNow}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
      />
    </div>
  );
};

export default BookingScreen;