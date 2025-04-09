/**
 * Interface representing an expense claim in the system
 */
export interface Claim {
    /** Unique identifier for the claim */
    id: string;
    /** ID of the employee who submitted the claim */
    employee_id: string;
    /** Total monetary amount of the claim */
    amount: number;
    /** Date when the claim was submitted */
    submitted_on: string;
    /** Date when the claim was reviewed, or null if not yet reviewed */
    reviewed_on: string | null;
    /** ID of the expense category */
    category_id: string | null;
    /** Current status of the claim */
    status: 'pending' | 'approved' | 'denied';
    /** ID of the employee who reviewed the claim */
    reviewed_by: string | null;
    /** Starting location for mileage claims */
    start_location: string | null;
    /** Ending location for mileage claims */
    end_location: string | null;
    /** Number of miles for a mileage claim */
    mileage: number | null;
    /** URL pointer to the uploaded receipt */
    receipt_url: string | null;
    /** ID of the employee who submitted the claim on behalf of someone else */
    submitted_by: string | null;
  
  /** Related employee profile information */
  profiles?: {
    /** Email address of the employee */
    email?: string;
    /** First name of the employee */
    first_name?: string;
    /** Last name of the employee */
    last_name?: string;
  };
  /** Related expense category information */
  categories?: {
    /** Name of the expense category */
    name?: string;
  };
  /** Information about the reviewer */
  reviewer?: {
    /** Email address of the reviewer */
    email: string;
  };
}

/**
 * Interface representing a user in the system
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** Email address of the user */
  email?: string | undefined;
  /** First name of the user (optional) */
  first_name?: string;
  /** Last name of the user (optional) */
  last_name?: string;
  /** Role of the user within the system */
  role?: string | undefined;
}

/**
 * Interface representing expense report data aggregated by category
 */
export interface ReportData {
  /** ID of the expense category */
  category_id: string;
  /** Name of the expense category */
  category_name: string;
  /** Total amount spent in this category */
  total_amount: number;
}

/**
 * Interface representing a user profile
 */
export interface Profile {
  /** Unique identifier for the profile */
  id: string;
  /** First name of the user */
  first_name: string;
  /** Last name of the user (optional) */
  last_name: string | null;
  /** Email address of the user */
  email: string;
  /** Role of the user (optional) */
  role?: 'employee' | 'admin' | 'super_admin';
}

/**
 * Props for the ClaimList component
 */
export interface ClaimListProps {
  /** Flag indicating whether the user has admin privileges */
  isAdmin: boolean;
  /** The currently authenticated user object */
  user: User;
  /** Array of claim objects to be displayed in the list */
  claims: Array<Claim>;
}

/**
 * Props for the Report component
 */
export interface ReportProps {
  /** Flag indicating whether the user has admin privileges */
  isAdmin: boolean;
  /** The currently authenticated user object */
  user: User;
}

/**
 * Interface representing a file object in storage
 */
export interface StorageFileObject {
  /** The name of the file in storage */
  name: string;
  /** The unique identifier of the file */
  id: string | null;
  /** The timestamp when the file was last updated */
  updated_at: string | null;
  /** The timestamp when the file was created */
  created_at: string | null;
  /** The timestamp when the file was last accessed */
  last_accessed_at: string | null;
  /** Additional metadata associated with the file */
  metadata: Record<string, any> | null;
}