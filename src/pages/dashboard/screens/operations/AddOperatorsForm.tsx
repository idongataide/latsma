import React from 'react';
import { useOnboardingStore } from '@/global/store';
import CompanyDetails from './CompanyDetails';
import AccountDetails from './AccountDetails';
import ContactDetails from './ContactDetails';

const AddOperatorsForm: React.FC = () => {
  const navPath = useOnboardingStore();

  return (
    <div className="p-14">       
      <div className="flex flex-col gap-4">
        {navPath?.navPath === "company-details" && <CompanyDetails /> }
        {navPath?.navPath === "account-details" && <AccountDetails /> }
        {navPath?.navPath === "contact-details" && <ContactDetails /> }
    </div>
  </div>
);
};

export default AddOperatorsForm; 