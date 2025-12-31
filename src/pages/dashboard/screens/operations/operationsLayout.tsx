import React from "react";
import AllOperations from "./allOperations";
import { FaPlus } from "react-icons/fa6";
import { FaCar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAllOperators } from "@/hooks/useAdmin";


const OperationsLayout: React.FC = () => {

  const { data: operators, isLoading } = useAllOperators()  

  return (
    <main>
      <div className="py-1 px-6 mt-10">
        <div className="flex px-4 justify-between mb-6 items-center">
          <h1 className="text-[18px] text-[#667085] font-[700]">Operations</h1>        
        </div>
        
        {/* Active Operators Card */}
        <div className="bg-image rounded-lg sm border border-[#E5E9F0] p-6 mb-6 relative overflow-hidden ">
         
          
          <div className="relative z-10 flex justify-between items-center py-5">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-[#FFF0EA] rounded-full p-2">
                    <FaCar className="text-[#FF6C2D]" />
                </div>
                <div className="ml-2">
                    <h2 className="text-[26px] font-bold text-[#475467] mb-1">{isLoading ? '...' : operators?.length}</h2>
                    <p className="text-[#667085] text-md font-medium">Active Operators</p>
                </div>
            </div>
            <Link to="/operators/add">
            <button className="flex items-center gap-2 cursor-pointer px-4 py-2 text-[16px] bg-[#FF6C2D] text-white rounded-lg hover:bg-[#FF6C2D] transition-colors">
              <FaPlus className="text-white" />
              <span> Add new</span>
            </button>
            </Link>
          </div>
        </div>
        
        <AllOperations data={operators} isLoading={isLoading} />
      </div>
    </main>
  );
};

export default OperationsLayout;