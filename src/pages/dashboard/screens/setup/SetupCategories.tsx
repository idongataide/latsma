import React from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from '@/pages/dashboard/common/LoadingScreen';
import { MdMenu as IconMenu } from "react-icons/md"; 
import { MdOutlineTrackChanges as IconTarget } from "react-icons/md"; 
import { MdOutlineAccountBalanceWallet as IconBag } from "react-icons/md"; 
import { PiBriefcaseThin } from "react-icons/pi";


interface SetupCategory {
  title: string;
  description: string;
  // icon: React.ElementType; // Use React.ElementType for icon components if available
  iconName: string; // Placeholder if using string names
  path: string;
}

const SetupCategories: React.FC = () => {
  const navigate = useNavigate();

  // The original useAllBookingsCount hook is likely not needed for this setup page
  // const { data: bookingsCount, isLoading } = useAllBookingsCount('count-status');
  const isLoading = false; // Assume not loading for now, replace with actual loading state if needed

  const setupCategories: SetupCategory[] = [
    {
      title: "General cost points",
      description: "Manage incoming requests for customer tow booking",
      iconName: "menu", // Placeholder
      path: "general-cost-points" 
    },
    {
      title: "Services cost",
      description: "Manage incoming requests for customer tow booking",
      iconName: "target",
      path: "services-cost" 
    },
    {
      title: "Stakeholder disbursement",
      description: "Manage incoming requests for customer tow booking",
      iconName: "bag", 
      path: "stakeholder-disbursement" 
    },
    {
      title: "Business process documentation",
      description: "Manage business documentation",
      iconName: "document", 
      path: "business-process-documentation" 
    },
  ];

  const handleCategoryClick = (path: string) => {
    navigate(path);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'menu':
        return (
          <div className="w-8 h-8 bg-[#FFECE3] rounded-full flex items-center justify-center">
              <IconMenu className="text-[#FF6C2D]" />
          </div>
        );
      case 'target':
        return (
          <div className="w-8 h-8 bg-[#FFECE3] rounded-full flex items-center justify-center">
              <IconTarget className="text-[#FF6C2D]" />
          </div>
        );
      case 'bag':
         return (
          <div className="w-8 h-8 bg-[#FFECE3] rounded-full flex items-center justify-center">
              <IconBag className="text-[#FF6C2D]" />
          </div>
        );
      case 'document':
         return (
          <div className="w-8 h-8 bg-[#FFECE3] rounded-full flex items-center justify-center">
              <PiBriefcaseThin  className="text-[#FF6C2D]" />
          </div>
         );
      default:
        return null;
    }
  };

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-[18px] text-[#667085] font-[700]">Setup</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {setupCategories.map((category, index) => (
          <div 
            key={index} 
            className="p-6 border border-[#E5E9F0] cursor-pointer bg-[#fff] rounded-lg transition-all duration-300 ease-in-out"
            onClick={() => handleCategoryClick(category.path)}
          >
            <div className="flex flex-col">
              <div className="mb-3 flex justify-end">
                  {renderIcon(category.iconName)}
              </div>      
              <div className="mb-4">
                <h2 className="text-lg text-[#475467] font-medium">{category.title}</h2>
                <p className="text-[14px] text-[#667085]">{category.description}</p>

              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default SetupCategories;