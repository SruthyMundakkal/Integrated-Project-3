"use server";

import { createClient } from "@/utils/supabase/server";
import { encodedRedirect } from "@/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Profile, ReportData } from "./definitions";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

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

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/auth/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/auth/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/auth/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/auth/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/auth/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

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