"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

interface Claim {
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
}

export default function EmployeeDashboard({ user }: { user: User }) {
  const supabase = createClient();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClaims() {
      try {
        let { data, error } = await supabase
          .from('claims')
          .select('*')
          .eq('employee_id', user.id)
          .order('submitted_on', { ascending: false });
          
        if (error) throw error;
        setClaims(data || []);
      } catch (err) {
        console.error('Error fetching claims:', err);
        setError('Failed to load your claims');
      } finally {
        setLoading(false);
      }
    }
    
    fetchClaims();
  }, [supabase, user.id]);

  if (loading) {
    return <div className="p-4 text-center">Loading your claims...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-destructive-foreground">{error}</div>;
  }

  return (
    <>
    </>
  );
}