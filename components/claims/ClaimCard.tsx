"use client";

import { Claim } from "@/lib/definitions"; // Adjust the import path as necessary
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

interface ClaimCardProps {
  claimId: string;
  user: User;
  isAdmin?: boolean;
  isInlineView?: boolean; // New prop to control rendering style
}

export default function ClaimCard({ claimId, user, isAdmin = false, isInlineView = false }: ClaimCardProps) {
  const supabase = createClient();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  
  useEffect(() => {
    async function fetchClaimDetails() {
      try {
        const { data, error } = await supabase
          .from('claims')
          .select(`*, 
            profiles:employee_id (email, first_name, last_name),
            categories:category_id (name),
            reviewer:reviewed_by (email)
            `)
          .eq('id', claimId)
          .single()
        
        if (error) throw error;
        
        setClaim(data);
      } catch (err) {
        console.error('Error fetching claim details:', err);
        setError('Failed to load claim details');
      } finally {
        setLoading(false);
      }
    }
    
    fetchClaimDetails();
  }, [claimId, supabase]);

  const handleUpdateStatus = async (newStatus: 'approved' | 'denied') => {
    if (!claim) return;
    
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('claims')
        .update({ 
          status: newStatus,
          reviewed_on: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq('id', claim.id);
      
      if (error) throw error;
      
      // Refresh claim data
      setClaim({
        ...claim,
        status: newStatus,
        reviewed_on: new Date().toISOString(),
        reviewed_by: user.id,
      });
      
    } catch (err) {
      console.error('Error updating claim status:', err);
      setError('Failed to update claim status');
    } finally {
      setUpdating(false);
    }
  };
  
  if (loading) {
    return <div className={`text-center ${isInlineView ? 'p-2' : 'p-6'}`}>Loading claim details...</div>;
  }
  
  if (error) {
    return <div className={`text-center ${isInlineView ? 'p-2' : 'p-6'} text-destructive-foreground`}>{error}</div>;
  }
  
  if (!claim) {
    return <div className={`text-center ${isInlineView ? 'p-2' : 'p-6'}`}>Claim not found</div>;
  }

  const canReview = isAdmin && claim.status === 'pending';
  const isOwnClaim = user.id === claim.employee_id;

  const containerClass = isInlineView 
    ? "bg-transparent p-0 max-w-none mx-0" 
    : "bg-background rounded-lg shadow p-6 max-w-3xl mx-auto";

  return (
    <div className={containerClass}>
      <div className={`grid grid-cols-1 ${isInlineView ? 'md:grid-cols-2 gap-4 mb-4' : 'md:grid-cols-2 gap-6 mb-6'}`}>
        {/* Left column */}
        <div className="space-y-4">
          <div>
            <h2 className={`${isInlineView ? 'text-base' : 'text-lg'} font-semibold mb-3`}>Claim Information</h2>
            <div className="space-y-2">
              <div className="flex justify-start gap-2">
                <span className="text-muted-foreground">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                  ${claim.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    claim.status === 'denied' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'}`}>
                  {claim.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-start gap-2">
                <span className="text-muted-foreground">Amount:</span>
                <span>${claim.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-start gap-2">
                <span className="text-muted-foreground">Date Submitted:</span>
                <span>{new Date(claim.submitted_on).toLocaleDateString()}</span>
              </div>
              {claim.category_id && (
                <div className="flex justify-start gap-2">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{claim.categories?.name || 'Unknown'}</span>
                </div>
              )}
            </div>
          </div>

          {claim.reviewed_on && (
              <div>
              <h2 className={`${isInlineView ? 'text-base' : 'text-lg'} font-semibold mb-3`}>Review Information</h2>
              <div className="space-y-2">
                <div className="flex justify-start gap-2">
                  <span className="text-muted-foreground">Reviewed On:</span>
                  <span>{new Date(claim.reviewed_on).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-start gap-2">
                  <span className="text-muted-foreground">Reviewed By:</span>
                  <span>{claim.reviewer?.email || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right column */}
        <div className="space-y-4">
          <div>
            <h2 className={`${isInlineView ? 'text-base' : 'text-lg'} font-semibold mb-3`}>Employee Details</h2>
            <div className="space-y-2">
              <div className="flex justify-start gap-2">
                <span className="text-muted-foreground">Name:</span>
                <span>{claim.profiles?.first_name && claim.profiles?.last_name ? 
                  `${claim.profiles.first_name} ${claim.profiles.last_name}` : 'N/A'}</span>
              </div>
              <div className="flex justify-start gap-2">
                <span className="text-muted-foreground">Email:</span>
                <span>{claim.profiles?.email || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          {claim.mileage && (
              <div>
              <h2 className={`${isInlineView ? 'text-base' : 'text-lg'} font-semibold mb-3`}>Mileage Details</h2>
              <div className="space-y-2">
                <div className="flex justify-start gap-2">
                  <span className="text-muted-foreground">Start Location:</span>
                  <span>{claim.start_location || 'N/A'}</span>
                </div>
                <div className="flex justify-start gap-2">
                  <span className="text-muted-foreground">End Location:</span>
                  <span>{claim.end_location || 'N/A'}</span>
                </div>
                <div className="flex justify-start gap-2">
                  <span className="text-muted-foreground">Mileage:</span>
                  <span>{claim.mileage} miles</span>
                </div>
              </div>
            </div>
          )}

            {claim.receipt_url && (
                <div>
                <h2 className={`${isInlineView ? 'text-base' : 'text-lg'} font-semibold mb-3`}>Receipt</h2>
                <a 
                    href={claim.receipt_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                >
                    View Receipt
                </a>
                </div>
            )}
        </div>
      </div>

      {canReview && (
          <div className={`${isInlineView ? 'mt-4 border-t pt-2' : 'mt-8 border-t pt-4'}`}>
          <div className="flex space-x-2">
            <button
              onClick={() => handleUpdateStatus('approved')}
              disabled={updating}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
              Approve Claim
            </button>
            <button
              onClick={() => handleUpdateStatus('denied')}
              disabled={updating}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
              Deny Claim
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
