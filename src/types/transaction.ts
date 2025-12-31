export interface Transaction {
  _id: string;
  trasaction_id: string;
  booking_ref?: string;
  user_data?: { 
    first_name: string; 
    last_name: string; 
    email: string; 
    phone_number: string; 
  };
  booking_data?: { 
    vehicle_model?: string; 
  };
  vehicle_model?: string;
  status?: number;
  amount?: number;
  createdAt?: string;
  operator?: { 
    _id: string; 
    name: string; 
  };
  drop_off_dst?: number;
  start_address?: string;
  end_address?: string;
  action?: string;
  service_fee?: number;
} 