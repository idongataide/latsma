import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { FaAngleLeft, FaUsers } from "react-icons/fa";
import GeneralCostTable from "./GeneralCostTable";
import AddGeneralCostForm from "./AddGeneralCostForm";
import { useFeesCount, useFees } from '@/hooks/useAdmin';

const GeneralCostLayout: React.FC = () => {
  const [activeSidebar, setActiveSidebar] = useState<string | null>(null);

  const { data: feesCountData, mutate: mutateCount } = useFeesCount();
  const { mutate: mutateFees } = useFees();
  const feesCount = feesCountData?.data[0]?.total ?? 0;

  const handleAddClick = () => {
    setActiveSidebar('add');
  };

  const handleCloseSidebar = () => {
    setActiveSidebar(null);
  };

  const handleFeeAdded = () => {
    mutateFees();
    mutateCount();
  };

  return (
    <main>
      <div className="py-1 px-6 mt-10">
        <div 
          className="flex items-center mb-5 mt-10 cursor-pointer"
          onClick={() => window.history.back()}
          >
          <FaAngleLeft className='text-lg text-[#667085]' />
          <p className='ml-2 font-bold text-[#667085] text-lg'>Back</p>
        </div>
        {/* Active Operators Card */}
        <div className="bg-image rounded-lg sm border border-[#E5E9F0] p-6 mb-6 relative overflow-hidden ">
          <div className="relative z-10 flex justify-between items-center py-5">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-[#FFF0EA] rounded-full p-2">
                    <FaUsers className="text-[#FF6C2D]" />
                </div>
                <div className="ml-2">
                    <h2 className="text-[26px] font-bold text-[#475467] mb-1">{feesCount}</h2>
                    <p className="text-[#667085] text-md font-medium">General cost points</p>
                </div>
            </div>
            <button
              className="flex cursor-pointer items-center gap-2 px-4 py-2 text-[16px] bg-[#FF6C2D] text-white rounded-lg hover:bg-[#FF6C2D] transition-colors"
              onClick={handleAddClick}
            >
              <FaPlus className="text-white" />
              <span> Add new</span>
            </button>
          </div>
        </div>
        
        <GeneralCostTable/>
      </div>

      {activeSidebar === 'add' && (
        <AddGeneralCostForm onClose={handleCloseSidebar} onFeeAdded={handleFeeAdded} />
      )}
      
    </main>
  );
};

export default GeneralCostLayout;
