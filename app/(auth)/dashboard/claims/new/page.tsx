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
        // Only fetch claims for the current user
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
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Employee Dashboard</h1>
      <p className="mb-4">Welcome, {user.email}</p>
      
      <div className="bg-blue-50 p-4 mb-6 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Your Claims</h2>
        
        {claims.length === 0 ? (
          <p>You haven't submitted any claims yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">Date Submitted</th>
                  <th className="py-2 px-4 text-left">Amount</th>
                  <th className="py-2 px-4 text-left">Type</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr key={claim.id} className="border-t">
                    <td className="py-2 px-4">{new Date(claim.submitted_on).toLocaleDateString()}</td>
                    <td className="py-2 px-4">${claim.amount.toFixed(2)}</td>
                    <td className="py-2 px-4">
                      {claim.mileage ? 'Mileage' : 'Expense'}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${claim.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          claim.status === 'denied' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      {claim.mileage && (
                        <span className="block text-sm">
                          {claim.start_location} → {claim.end_location} ({claim.mileage} miles)
                        </span>
                      )}
                      {claim.receipt_url && (
                        <a 
                          href={claim.receipt_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-sm"
                        >
                          View Receipt
                        </a>
                      )}
                      {claim.reviewed_on && (
                        <span className="block text-xs text-gray-500 mt-1">
                          Reviewed on {new Date(claim.reviewed_on).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <a href="/dashboard/claims/new/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Submit New Claim
      </a>
    </div>
  );
}