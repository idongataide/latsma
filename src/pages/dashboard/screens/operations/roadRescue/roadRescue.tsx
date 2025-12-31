import { FaAngleLeft } from 'react-icons/fa';
import CompanyProfileCard from './bioData';
import VehicleAssets from './assetsList';
import DriversList from './driversList';
import { Toaster } from 'react-hot-toast';

const RoadRescue = () => {
  
  return (
    <>
      <Toaster containerStyle={{ zIndex: 999999 }}/>
     <div className="py-1 px-6 mt-10-">
        <div 
            className="flex items-center mb-5 mt-10 cursor-pointer"
            onClick={() => window.history.back()}
            >
            <FaAngleLeft className='text-lg text-[#667085]' />
            <p className='ml-2 font-bold text-[#667085] text-lg'>Back</p>
        </div>
        <CompanyProfileCard /> 
        <VehicleAssets />
        <DriversList />
    </div>
    </>
  );
};

export default RoadRescue;