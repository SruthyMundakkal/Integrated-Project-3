"use server";

import { createClient } from "@/utils/supabase/server";
import { encodedRedirect } from "@/utils/utils";
import { redirect } from "next/navigation";
import { Profile, ReportData } from "./definitions";

/**
 * Authenticates a user with email and password
 * @param {FormData} formData - Form data containing email and password
 * @returns {Promise<never>} Redirects to dashboard on success or sign-in page with error
 */
export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

/**
 * Signs out the current user
 * @returns {Promise<never>} Redirects to sign-in page
 */
export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

/**
 * Fetches all expense claims with related profile and category data
 * @returns {Promise<Claim[] | null>} Array of claim objects or null if error
 */
export const fetchAllClaimsData = async () => {
  const supabase = await createClient();
  
  let { data: claims, error } = await supabase
    .from('claims')
    .select(`
      *,
      profiles:employee_id (email),
      categories:category_id (name)
      `)
      .order('submitted_on', { ascending: false });

  return claims;
}

/**
 * Fetches report data for expense claims by category for the last 6 months
 * @param {string | null} employeeId - Optional employee ID to filter results by employee
 * @returns {Promise<ReportData[] | null>} Array of report data objects or null if error
 */
export const fetchReportData = async (
    employeeId: string | null = null
): Promise<ReportData[] | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    'get_claim_category_totals_last_6_months',
    { p_employee_id: employeeId }
  );

  if (error) {
    console.error('Error fetching report data:', error.message);
    return null;
  }

  if (data && Array.isArray(data)) {
    return data.map(claim => ({
      ...claim,
      total_amount: typeof claim.total_amount === 'string'
        ? parseFloat(claim.total_amount)
        : claim.total_amount,
    }));
  }

  return [];
}

/**
 * Fetches all employee profiles sorted by last name and first name
 * @returns {Promise<Profile[] | null>} Array of profile objects or null if error
 */
export const fetchEmployees = async (): Promise<Profile[] | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email')
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true });

  if (error) {
    console.error('Error fetching employees:', error);
    return null;
  }

  return data;
}