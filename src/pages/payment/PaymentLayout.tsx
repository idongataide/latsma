// PaymentLayout.jsx
import Images from '@/components/images';
import { FaTimes } from 'react-icons/fa';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';


const PaymentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleClose = () => {
    navigate('/payment');
  };

  const isBannerPage = location.pathname === '/payment';

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      isBannerPage 
        ? "bg-[url('/images/payment-bg.png')] bg-cover bg-center bg-no-repeat"
        : "bg-white"
    }`}>
      {/* Header/Navbar */}
      <div className={`flex justify-between p-3 px-10 ${
        !isBannerPage ? 'border-b border-gray-200' : ''
      }`}>
        <Link to="/">
        <div className='flex items-center'>
          <img src={Images.logodark} alt='logo' className='h-10'/>
        </div>
        </Link>
        <div 
          className="flex items-center cursor-pointer hover:opacity-80 transition"
          onClick={handleClose}
        >
          <FaTimes/> <span className='ml-3'>Close</span> 
        </div>
      </div>
      
      <Outlet />
    </div>
  );
};

export default PaymentLayout;