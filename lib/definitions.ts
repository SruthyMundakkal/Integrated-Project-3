export interface Claim {
    id: string;
    employee_id: string;
    amount: number;
    submitted_on: string;
    reviewed_on: string | null;
    category_id: string | null;
    status: 'pending' | 'approved' | 'denied';
    reviewed_by: string | null;
    start_location: string | null;
    end_location: string | null;
    mileage: number | null;
    receipt_url: string | null;
    submitted_by: string | null;
  
  // Join data that may be added after fetching
  profiles?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  categories?: {
    name: string;
  };
  reviewer?: {
    email: string;
  };
}

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'employee' | 'admin' | 'super_admin';
}
