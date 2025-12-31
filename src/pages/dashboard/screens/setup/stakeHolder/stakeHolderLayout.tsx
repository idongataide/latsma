import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { FaAngleLeft, FaUsers } from "react-icons/fa"; 
import StakeHolderTable from "./StakeHolderTable";
import AddStakeHolderForm from "./AddStakeHolderForm";
import EditStakeholderForm from "./EditStakeholderForm";
import { useStakeholdersCount, useStakeholders } from "@/hooks/useAdmin";

const StakeHolderLayout: React.FC = () => {
  const [activeSidebar, setActiveSidebar] = useState<'add' | 'edit' | null>(null);
  const [editData, setEditData] = useState<any>(null);

  const handleAddClick = () => setActiveSidebar('add');
  const handleCloseSidebar = () => {
    setActiveSidebar(null);
    setEditData(null);
  };

  const { data: stakeholdersCount, mutate: mutateCount } = useStakeholdersCount();
  const { mutate: mutateStakeholders } = useStakeholders();

  const handleStakeholderAdded = () => {
    mutateStakeholders();
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

        {/* Active Stakeholders Card - similar to General cost points card */}
        <div className="bg-image rounded-lg sm border border-[#E5E9F0] p-6 mb-6 relative overflow-hidden ">
          <div className="relative z-10 flex justify-between items-center py-5">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-[#FFF0EA] rounded-full p-2">
                    <FaUsers className="text-[#FF6C2D]" />
                </div>
                <div className="ml-2">
                    {/* TODO: Replace with actual stakeholder count */}
                    <h2 className="text-[26px] font-bold text-[#475467] mb-1">{stakeholdersCount?.data?.total}</h2>
                    <p className="text-[#667085] text-md font-medium">Stakeholders</p>
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

        {/* Stakeholder Table */}
        <StakeHolderTable onEdit={(data) => {
          setEditData(data);
          setActiveSidebar('edit');
        }} />
      </div>

        {activeSidebar === 'add' && (
          <AddStakeHolderForm 
            isOpen={activeSidebar === 'add'} 
            onClose={handleCloseSidebar}
            onStakeholderAdded={handleStakeholderAdded}
          />
        )}

      {/* Edit Stakeholder Sidebar */}
      {activeSidebar === 'edit' && editData && (
        <EditStakeholderForm 
          isOpen={activeSidebar === 'edit'} 
          onClose={handleCloseSidebar}
          editData={editData}
          onStakeholderUpdated={handleStakeholderAdded}
        />
      )}
    </main>
  );
};

export default StakeHolderLayout; 