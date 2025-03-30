"use client";

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import ClaimCard from "./ClaimCard";

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

interface ClaimListProps {
  isAdmin?: boolean;
  userId?: string;
}

export default function ClaimList({ isAdmin = false, userId }: ClaimListProps) {
  const supabase = createClient();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClaims() {
      try {
        let query = supabase
          .from('claims')
          .select(`
            *,
            profiles:employee_id (email)
          `)
          .order('submitted_on', { ascending: false });

        // If not admin, only fetch user's claims
        if (!isAdmin && userId) {
          query = query.eq('employee_id', userId);
        }

        const { data, error } = await query;
          
        if (error) throw error;
        
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
  }, [supabase, userId, isAdmin]);

  const toggleClaimExpansion = (claimId: string) => {
    setExpandedClaimId(expandedClaimId === claimId ? null : claimId);
  };

  const filteredClaims = filter === "all" 
    ? claims 
    : claims.filter(claim => claim.status === filter);

  if (loading) {
    return <div className="p-4 text-center">Loading claims...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-destructive-foreground">{error}</div>;
  }

  return (
    <div className="bg-background p-4 rounded-lg w-full">
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
          onClick={() => setFilter("denied")}
          className={`px-3 py-1 rounded ${filter === 'denied' ? 'bg-secondary text-foreground' : 'bg-muted'}`}
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
                {isAdmin && <th className="py-2 px-4 text-left">Employee</th>}
                <th className="py-2 px-4 text-left">Amount</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 px-4 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.map((claim) => (
                <>
                  <tr key={claim.id} className="border-t">
                    <td className="py-2 px-4">{new Date(claim.submitted_on).toLocaleDateString()}</td>
                    {isAdmin && <td className="py-2 px-4">{claim.user_email}</td>}
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
                      <button
                        onClick={() => toggleClaimExpansion(claim.id)}
                        className="text-foreground hover:underline focus:outline-none"
                      >
                        {expandedClaimId === claim.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedClaimId === claim.id && (
                    <tr>
                      <td colSpan={isAdmin ? 5 : 4} className="p-0">
                        <div className="p-4 bg-gray-50">
                          <ClaimCard 
                            claimId={claim.id} 
                            user={{ id: userId || '' } as any} 
                            isAdmin={isAdmin} 
                            isInlineView={true} 
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
