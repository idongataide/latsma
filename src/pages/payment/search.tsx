import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Input } from 'antd';
import { useSearch } from '@/hooks/useAdmin';
import { startPayment, completePayment } from '@/api/transactionsApi';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const SearchPage: React.FC = () => {
  const [plateNumber, setPlateNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const paymentInitiated = useRef(false);

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const plateFromUrl = params.get('plate');

  if (plateFromUrl) {
    const decodedPlate = decodeURIComponent(plateFromUrl);
    setPlateNumber(decodedPlate);
    setSearchQuery(decodedPlate); 
  }
}, []);

  console.log(currentTransactionId,'currentTransactionId')
  
  const { data: searchResult, isLoading, mutate } = useSearch(searchQuery);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (!plateNumber.trim()) {
      return;
    }
    setSearchQuery(plateNumber.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const hasSearched = searchQuery !== '';
  const hasResults = searchResult && Array.isArray(searchResult) && searchResult.length > 0;
  const vehicleData = hasResults ? searchResult[0] : null;
  

  const [form] = Form.useForm();

  useEffect(() => {
    if (vehicleData && vehicleData.driver) {
      form.setFieldsValue({
        driver_first_name: vehicleData.first_name || '',
        driver_last_name: vehicleData.last_name || '',
        driver_phone: vehicleData.phone_number || '',
        driver_email: vehicleData.email || '',
      });
    }
  }, [vehicleData, form]);

  const handleProceedToPay = async () => {
    if (!vehicleData || paymentInitiated.current) {
      return;
    }

    try {
      const values = await form.validateFields();
      
      const payload = {
        towing_id: vehicleData.towing_id,
        first_name: values.driver_first_name,
        last_name: values.driver_last_name,
        phone_number: values.driver_phone,
        email: values.driver_email,
      };
      
      setLoading(true);
      const response = await startPayment(payload as any);
      
      if (response?.error || response?.response?.data?.status === 'error') {
        setLoading(false);
        toast.error(response?.data?.msg || 'Failed to initiate payment');
        return;
      }

      const transactionId = response?.data?.transaction_id;
      const reference = response?.data?.reference;
      
      if (!transactionId || !reference) {
        setLoading(false);
        toast.error('Missing payment details');
        return;
      }

      if (window.PaystackPop) {
        paymentInitiated.current = true;
        
        const onPaymentSuccess = async (txId: string) => {
          try {
            setLoading(true);
            const response = await completePayment(txId);
            
            if (response?.error || response?.response?.data?.status === 'error') {
              setLoading(false);
              toast.error(response?.data?.msg || 'Failed to complete payment');
            } else {
              toast.success('Payment completed successfully!');
              if (typeof mutate === 'function') mutate();
              form.resetFields();
              setPlateNumber('');
              setSearchQuery('');
            }
          } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to complete payment';
            toast.error(msg);
          } finally {
            setLoading(false);
            paymentInitiated.current = false;
          }
        };

        

        const handler = window.PaystackPop.setup({
          key: response.data.paystackKey,
          email: values.driver_email,
          amount: response.data.amount * 100,
          ref: response.data.reference, 
          callback: function(paystackResponse: any) {
            console.log(paystackResponse,'paystackResponsepaystackResponse')
            if (paystackResponse.status === 'success') {
              onPaymentSuccess(transactionId);
            } else {
              toast.error('Payment was not successful');
              setLoading(false);
              paymentInitiated.current = false;
            }
          },
          onClose: function() {
            toast.error('Payment window closed');
            setLoading(false);
            paymentInitiated.current = false;
          }
        });
        
        handler.openIframe();
        setCurrentTransactionId(transactionId);
      }
      
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      paymentInitiated.current = false;
      
      if (err?.errorFields) return;
      const msg = err?.response?.data?.message || err?.message || 'Failed to complete payment';
      toast.error(msg);
    }
  };

 
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">      
      <div className="w-full max-w-md">
        <div className="flex gap-2 mb-6">
          <input
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter plate number"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={isLoading || loading}
          />
          <Button
            onClick={handleSearch}
            loading={isLoading}
            disabled={!plateNumber.trim() || loading}
            className="bg-[#FF6C2D]! h-[48px]! hover:bg-orange-600 text-white! font-semibold px-6! py-3! rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
          </Button>
        </div>

        {/* Show loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center mt-8">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#475467]">Searching...</p>
          </div>
        )}

        {hasSearched && !isLoading && !hasResults && (
          <div className="flex flex-col items-center justify-center mt-8">
            <div className="w-64 h-64 mb-6 flex items-center justify-center">
              <img 
                src="/images/empty.png" 
                alt="No results found"
                className="max-w-full max-h-full object-contain"                
              />
            </div>
            <p className="text-[#475467] text-lg font-medium mb-2">
              Nothing to find here!
            </p>
            <p className="text-[#475467] text-center">
              No vehicle found with plate number: <span className="font-semibold">"{searchQuery}"</span>
            </p>
            <p className="text-[#475467] text-center mt-2">
              Please check the plate number and try again
            </p>
          </div>
        )}

        {/* Results Section */}
        {hasSearched && !isLoading && hasResults && vehicleData && (
          <div className="mt-3">
            <div className='bg-[#F9FAFB] border-l-3 border-[#D0D5DD] px-3 py-3 rounded mb-5'>
              <span className='text-[#344054]'>Vehicle Details</span>
            </div>    
            <div className="space-y-4">
              <DetailRow label="Landmark" value={vehicleData.landmark} />
              <DetailRow label="Vehicle model" value={vehicleData.vehicle_model} />
              <DetailRow label="Vehicle colour" value={vehicleData.vehicle_color} />
              <DetailRow label="Vehicle type" value={vehicleData.vehicle_type} />
              <DetailRow 
                label="Number plate" 
                value={vehicleData.plate_number} 
              />
              <DetailRow 
                label="Vehicle registration" 
                value={vehicleData.vehicle_reg} 
              />
              <DetailRow 
                label="Reason for towing" 
                value={vehicleData.tow_reason} 
              />
              <DetailRow 
                label="Vehicle loading status" 
                value={vehicleData.vehicle_loaded === 0 ? "Not Loaded" : "Loaded"} 
              />

              {/* Attachments/URLs */}
              {vehicleData.url && vehicleData.url.length > 0 && (
                <div className="my-3 p-2 border-[#F2F4F7] rounded border">
                  <h4 className="font-semibold text-gray-700 mb-2">Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {vehicleData.url.map((urlItem: any, i: number) => (
                      <span 
                        key={i} 
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                      >
                        {typeof urlItem === 'string' ? urlItem : 'Attachment'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className='bg-[#F9FAFB] border-l-3 border-[#D0D5DD] px-3 py-3 rounded mt-4! mb-5'>
                <span className='text-[#344054]'>Driver's Details</span>
              </div> 
              
              <Form form={form} layout="vertical" className="space-y-3">
                <Form.Item
                  label={<span className="text-[#475467] text-[16px] font-medium">Driver First Name</span>}
                  name="driver_first_name"
                  rules={[{ required: true, message: 'Please enter first name' }]}
                >
                  <Input placeholder="First name" disabled={loading} />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[#475467] text-[16px] font-medium">Driver Last Name</span>}
                  name="driver_last_name"
                  rules={[{ required: true, message: 'Please enter last name' }]}
                >
                  <Input placeholder="Last name" disabled={loading} />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[#475467] text-[16px] font-medium">Driver Phone</span>}
                  name="driver_phone"
                  rules={[{ required: true, message: 'Please enter phone number' }]}
                >
                  <Input placeholder="Phone number" disabled={loading} />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[#475467] text-[16px] font-medium">Driver Email</span>}
                  name="driver_email"
                  rules={[{ required: false, type: 'email', message: 'Please enter a valid email' }]}
                >
                  <Input placeholder="Email" disabled={loading} />
                </Form.Item>

                <Button
                  loading={loading}
                  onClick={handleProceedToPay}
                  className='mt-6 w-[100%]! bg-[#FF6C2D]! h-[48px]! hover:bg-orange-600 text-white! font-semibold px-6! py-3! rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Proceed to Pay
                </Button>
              </Form>
            </div>  
          </div>
        )}

        {/* Initial state - before any search */}
        {!hasSearched && !isLoading && (
          <div className="flex flex-col items-center justify-center mt-8">
            <div className="w-64 h-64 mb-6 flex items-center justify-center opacity-50">
              <img 
                src="/images/empty.png" 
                alt="Enter plate number"
                className="max-w-full max-h-full object-contain"                
              />
            </div>
            <p className="text-[#475467] text-lg font-medium mb-2">
              Ready to search
            </p>
            <p className="text-[#475467] text-center">
              Enter your vehicle plate number to find your vehicle
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: any }> = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-[#475467] text-[16px] font-medium">{label}</span>
    <span className="text-[#475467] text-[16px] font-medium">
      {value || 'N/A'}
    </span>
  </div>
);

export default SearchPage;