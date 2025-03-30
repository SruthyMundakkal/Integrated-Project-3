"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
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
  user_email?: string;
}

export default function SuperAdminDashboard({ user }: { user: User }) {
  const supabase = createClient();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchClaims() {
      try {
        // Fetch all claims for super admin review
        let { data, error } = await supabase
          .from('claims')
          .select(`
            *,
            profiles:employee_id (email)
          `)
          .order('submitted_on', { ascending: false });
          
        if (error) throw error;
        
        // Format the data to include user_email
        const formattedData = (data || []).map(claim => ({
          ...claim,
          user_email: claim.profiles?.email || 'Unknown'
        }));
        
        setClaims(formattedData);
      } catch (err) {
        console.error('Error fetching claims:', err);
        setError('Failed to load claims');
      } finally {
        setLoading(false);
      }
    }
    
    fetchClaims();
  }, [supabase, user.id]);

  const filteredClaims = filter === "all" 
    ? claims 
    : claims.filter(claim => claim.status === filter);

  if (loading) {
    return <div className="p-4 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-destructive-foreground">{error}</div>;
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
        
        <div className="bg-muted p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-center">Claims Overview</h3>
          <div className="grid grid-cols-2 gap-2">
            <p>Total Claims: {claims.length}</p>
            <p>Approved: {claims.filter(c => c.status === 'approved').length}</p>
            <p>Pending: {claims.filter(c => c.status === 'pending').length}</p>
            <p>Rejected: {claims.filter(c => c.status === 'denied').length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-background p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Claims</h2>
          <Link 
            href="/dashboard/claims/new" 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Create New Claim
          </Link>
        </div>
        
        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-secondary text-foreground' : 'bg-muted'}`}
          >
            All Claims
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1 rounded ${filter === 'pending' ? 'bg-secondary text-foreground' : 'bg-muted'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-3 py-1 rounded ${filter === 'approved' ? 'bg-secondary text-foreground' : 'bg-muted'}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-3 py-1 rounded ${filter === 'rejected' ? 'bg-secondary text-foreground' : 'bg-muted'}`}
          >
            Rejected
          </button>
        </div>
        
        {filteredClaims.length === 0 ? (
          <p>No claims found matching the selected filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Employee</th>
                  <th className="py-2 px-4 text-left">Amount</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="border-t">
                    <td className="py-2 px-4">{new Date(claim.submitted_on).toLocaleDateString()}</td>
                    <td className="py-2 px-4">{claim.user_email}</td>
                    <td className="py-2 px-4">${claim.amount.toFixed(2)}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${claim.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          claim.status === 'denied' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <Link 
                        href={`/dashboard/claims/${claim.id}`} 
                        className="text-foreground hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}