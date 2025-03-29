"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Claim {
  id: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  user_id: string;
  user_email: string;
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
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>
      <p className="mb-4">Welcome, Super Administrator {user.email}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-md shadow">
          <h3 className="text-lg font-semibold mb-2">System Administration</h3>
          <div className="flex flex-col space-y-2">
            <Link href="/dashboard/superadmin-access/categories" className="text-blue-600 hover:underline">
              Manage Categories
            </Link>
            <Link href="/dashboard/admin-access/users" className="text-blue-600 hover:underline">
              Manage Users
            </Link>
            <Link href="/dashboard/admin-access/reports" className="text-blue-600 hover:underline">
              System Reports
            </Link>
          </div>
        </div>
        
        <div className="bg-green-100 p-4 rounded-md shadow">
          <h3 className="text-lg font-semibold mb-2">Claims Overview</h3>
          <div>
            <p>Total Claims: {claims.length}</p>
            <p>Pending: {claims.filter(c => c.status === 'pending').length}</p>
            <p>Approved: {claims.filter(c => c.status === 'approved').length}</p>
            <p>Rejected: {claims.filter(c => c.status === 'rejected').length}</p>
          </div>
        </div>
        
        <div className="bg-purple-100 p-4 rounded-md shadow">
          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          <div className="flex flex-col space-y-2">
            <Link href="/dashboard/claims/new" className="text-purple-600 hover:underline">
              Create New Claim
            </Link>
            <Link href="/dashboard/profile" className="text-purple-600 hover:underline">
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-md shadow">
        <h2 className="text-lg font-semibold mb-2">Recent Claims</h2>
        
        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All Claims
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1 rounded ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-3 py-1 rounded ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-3 py-1 rounded ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
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
                  <th className="py-2 px-4 text-left">Description</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.slice(0, 5).map((claim) => (
                  <tr key={claim.id} className="border-t">
                    <td className="py-2 px-4">{new Date(claim.created_at).toLocaleDateString()}</td>
                    <td className="py-2 px-4">{claim.user_email}</td>
                    <td className="py-2 px-4">${claim.amount.toFixed(2)}</td>
                    <td className="py-2 px-4">{claim.description}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${claim.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          claim.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <Link 
                        href={`/dashboard/claims/${claim.id}`} 
                        className="text-blue-600 hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {claims.length > 5 && (
              <div className="mt-4 text-center">
                <Link href="/dashboard/claims" className="text-blue-600 hover:underline">
                  View All Claims
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}