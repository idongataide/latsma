import { FaRegCalendarAlt } from 'react-icons/fa';
import { FiEdit2, FiMail, FiPhone, FiMapPin, FiCreditCard } from 'react-icons/fi';
import { useOperatorData } from '@/hooks/useAdmin';
import { useParams } from 'react-router-dom';
import LoadingScreen from '@/pages/dashboard/common/LoadingScreen';
import React from 'react';
import EditCompanyProfile from './editCompanyProfile';
import EditContactDetails from './editContactDetails';

const CompanyProfileCard = () => {
  const { id } = useParams<{ id: string }>();
  const { data: companyData, isLoading: companyLoading } = useOperatorData(id || '');
  const [showEditCompany, setShowEditCompany] = React.useState(false);
  const [showEditContact, setShowEditContact] = React.useState(false);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate initials from contact rep name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const handleEditCompany = () => {
    setShowEditCompany(true);
  };

  const handleEditContact = () => {
    setShowEditContact(true);
  };

  const handleEditSuccess = () => {
    // Refresh data or update state as needed
  };

  if (companyLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4">
        {/* First section - takes 2/3 on md screens, 3/4 on lg screens */}
        <div className="w-full lg:w-3/4 bg-white rounded-2xl p-6">
          {/* Company Header */}
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold capitalize text-[#475467]">{companyData?.name}</h1>
            <button 
              onClick={handleEditCompany}
              className="flex items-center text-sm gap-2 text-[#FF6C2D] cursor-pointer hover:text-[#E55B1F]"
            >
              <FiEdit2 className="w-3 h-3 cursor-pointer" />
              <span>Edit</span>
            </button>
          </div>

          {/* Company Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center mb-2 w-12 h-12 rounded-full bg-[#F2F4F7] text-[#101828] font-medium">
                  <FiMail className="w-5 h-5 text-[#667085]" />
                </div> 
                <div className="">
                  <p className="text-base text-[#475467] font-medium">{companyData?.email}</p>
                  <p className="text-xs text-[#667085] font-normal">Email address</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center justify-center mb-2 w-12 h-12 rounded-full bg-[#F2F4F7] text-[#101828] font-medium">
                  <FaRegCalendarAlt className="w-5 h-5 text-[#667085]" />
                </div> 
                <div className="">
                  <p className="text-base text-[#475467] font-medium">
                    {companyData?.createdAt ? formatDate(companyData.createdAt) : 'N/A'}
                  </p>
                  <p className="text-xs text-[#667085] font-normal">Date onboarded</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center mb-2 w-12 h-12 rounded-full bg-[#F2F4F7] text-[#101828] font-medium">
                  <FiPhone className="w-5 h-5 text-[#667085]" />
                </div>
                <div>
                  <p className="text-base text-[#475467] font-medium">{companyData?.phone_number || 'N/A'}</p>
                  <p className="text-xs text-[#667085] font-normal">Phone number</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center justify-center mb-2 w-12 h-12 rounded-full bg-[#F2F4F7] text-[#101828] font-medium">
                  <FiMapPin className="w-5 h-5 text-[#667085]" />
                </div>
                <div>
                  <p className="text-base capitalize text-[#475467] font-medium">
                    {`${companyData?.lga || 'N/A'}-${companyData?.state || 'N/A'}`}
                  </p>
                  <p className="text-xs text-[#667085] font-normal">LGA-State</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center mb-2 w-12 h-12 rounded-full bg-[#F2F4F7] text-[#101828] font-medium">
                  <FiCreditCard className="w-5 h-5 text-[#667085]" />
                </div>
                <div>
                  <p className="text-base text-[#475467] font-medium">
                    {companyData?.bank_data?.account_number || 'N/A'}
                  </p>
                  <p className="text-xs text-[#667085] font-normal">
                    {companyData?.bank_data?.bank_name || 'Bank not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>    
        </div>
        
        {/* Second section - takes 1/3 on md screens, 1/4 on lg screens */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-white rounded-2xl p-6">
          <div className="bg-[#F9FAFB] rounded-lg flex p-2 mb-2">
            <h3 className="text-sm font-medium text-[#475467]">Contact person</h3>
            <button 
              onClick={handleEditContact}
              className="flex items-center text-sm cursor-pointer gap-2 ms-auto text-[#FF6C2D] hover:text-[#E55B1F]"
            >
              <FiEdit2 className="w-3 h-3 cursor-pointer" />
              <span>Edit</span>
            </button>
          </div>
          
          <div className="text-center gap-4">
            {/* Avatar with initials */}
            <div className="flex items-center justify-center mx-auto mb-2 w-12 h-12 rounded-full bg-[#F2F4F7] text-[#101828] font-medium">
              {getInitials(
                companyData?.contact_rep_firstname || 'N', 
                companyData?.contact_rep_lastname || 'A'
              )}
            </div>            
            
            {/* Contact details */}
            <div className="space-y-1">
              <p className="text-base capitalize font-medium text-[#101828]">
                {`${companyData?.contact_rep_firstname || ''} ${companyData?.contact_rep_lastname || ''}`.trim() || 'Not Available'}
              </p>
              <p className="text-sm text-[#667085]">
                {companyData?.contact_rep_email || 'Not Available'}
              </p>
              <p className="text-sm text-[#667085]">
                {companyData?.contact_rep_phone || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modals */}
      <EditCompanyProfile
        isOpen={showEditCompany}
        onClose={() => setShowEditCompany(false)}
        operatorData={companyData}
        onSuccess={handleEditSuccess}
      />

      <EditContactDetails
        isOpen={showEditContact}
        onClose={() => setShowEditContact(false)}
        initialData={{
          assetco_id: companyData?.assetco_id,
          first_name: companyData?.contact_rep_firstname,
          last_name: companyData?.contact_rep_lastname,
          contact_phone: companyData?.contact_rep_phone,
          contact_email: companyData?.contact_rep_email
        }}
        onNext={handleEditSuccess}
      />
    </>
  );
};

export default CompanyProfileCard;