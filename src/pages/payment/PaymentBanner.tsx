// PaymentBanner.jsx
import { Button } from 'antd';
import Images from '@/components/images';
import { Link } from 'react-router-dom';

const PaymentBanner = () => {
  return (
    <div className="w-full max-w-[500px] mt-10 items-center mx-auto">
      <div className="payment-card">
        <div className='flex justify-center'>
          <img src={Images.paymentLogo} alt='logo' className='h-30'/>
        </div>
        <h1 className="text-[#344054] text-4xl md:text-5xl leading-[1.2]! font-bold text-center mb-8">
          Make payment for towing services quick and easy
        </h1>
        <div className="payment-content flex justify-center items-center">
          <Link to="search">
            <Button
              type="primary"
              htmlType="submit"
              className="h-[46px]! mt-3! rounded-lg! bg-[#FF6C2D] px-7! font-bold! text-lg hover:bg-gray-300 transition border-0"
            >
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentBanner;