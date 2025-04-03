"use client";

import ClaimList from "@/components/claims/ClaimList";
import { Claim } from "@/lib/definitions";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import CategoryBarChart from "../reports/CategoryBarChart";

export default function SuperAdminDashboard({ user, isAdmin }: { user: User, isAdmin: boolean }) {
  
  const supabase = createClient();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<JSX.Element>(<ClaimList isAdmin />);

  useEffect(() => {
    async function fetchClaims() {
      try {
        let { data, error } = await supabase
          .from('claims')
          .select(`
            *,
            profiles:employee_id (email)
          `)
          .order('submitted_on', { ascending: false });
          
        if (error) throw error;
        
        setClaims(data || []);
      } catch (err) {
        console.error('Error fetching claims:', err);
        setError('Failed to load claims');
      } finally {
        setLoading(false);
      }
    }
    
    fetchClaims();
  }, [supabase, user.id]);
  
  if (loading) {
    return <div className="p-4 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-destructive-foreground">{error}</div>;
  }

  const showClaimList = () => {
    setSelectedComponent(<ClaimList isAdmin />);
  }
  
  const showReport = () => {
    setSelectedComponent(<CategoryBarChart />);
  }

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>
      <p className="mb-4">Welcome, {user.email}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-muted p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-center">System Administration</h3>
          <div className="flex flex-col space-y-2">
            <Link href="/dashboard/superadmin-access/categories" className="text-foreground hover:underline">
              Manage Categories
            </Link>
            <Link href="/dashboard/admin-access/users" className="text-foreground hover:underline">
              Manage Users
            </Link>
            
          </div>
        </div>
        
        <div className="bg-muted p-4 rounded-lg shadok-md">
          <h3 className="text-lg font-semibold mb-2 text-center">Claims Overview</h3>
          <div className="grid grid-cols-2 gap-2">
            <p>Total Claims: {claims.length}</p>
            <p>Approved: {claims.filter(c => c.status === 'approved').length}</p>
            <p>Pending: {claims.filter(c => c.status === 'pending').length}</p>
            <p>Rejected: {claims.filter(c => c.status === 'denied').length}</p>
          </div>
        </div>
      </div>

      <button onClick={showClaimList} className="text-foreground hover:underline">
        View Claims List
      </button>
      
      <button onClick={showReport} className="text-foreground hover:underline">
        View Category Reports
      </button>
      
      <div className="margin-auto">
        {selectedComponent}
      </div>
    </div>
  );
}