"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
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

export default function AdminDashboard({ user }: { user: User }) {
  const supabase = createClient();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchClaims() {
      try {
        // Fetch all claims for admin review
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

  async function updateClaimStatus(claimId: string, status: string) {
    try {
      const { error } = await supabase
        .from('claims')
        .update({ status })
        .eq('id', claimId);
        
      if (error) throw error;
      
      // Update local state
      setClaims(claims.map(claim => 
        claim.id === claimId ? { ...claim, status } : claim
      ));
    } catch (err) {
      console.error('Error updating claim status:', err);
      alert('Failed to update claim status');
    }
  }

  if (loading) {
    return <div className="p-4 text-center">Loading claims...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <p className="mb-4">Welcome, Admin {user.email}</p>
      
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
      
      <div className="bg-white p-4 rounded-md shadow">
        <h2 className="text-lg font-semibold mb-2">Claims Management</h2>
        
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
                {filteredClaims.map((claim) => (
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
                      {claim.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => updateClaimStatus(claim.id, 'approved')}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => updateClaimStatus(claim.id, 'rejected')}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      )}
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