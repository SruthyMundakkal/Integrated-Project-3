"use client";

import { Claim } from "@/lib/definitions";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useState } from "react";
import ClaimCard from "./ClaimCard";
import ClaimForm from "./ClaimForm";
import React from "react";

interface ClaimListProps {
  isAdmin: boolean;
  user: User;
  claims: Array<Claim>;
}

export default function ClaimList({ isAdmin, user, claims = [] }: ClaimListProps) {
  const [filter, setFilter] = useState<string>("all");
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);
  const [showClaimForm, setShowClaimForm] = useState(false);

  const toggleClaimExpansion = (claimId: string) => {
    setExpandedClaimId(expandedClaimId === claimId ? null : claimId);
  };

  const filteredClaims = filter === "all"
    ? claims
    : claims.filter(claim => claim.status === filter);

  return (
    <div className="flex flex-col w-4xl items-center bg-background p-4 rounded-lg">
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-lg font-semibold">Claims</h2>
        <button
          onClick={() => setShowClaimForm(!showClaimForm)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {showClaimForm ? "Back to Claims" : "Add New Claim"}
        </button>
      </div>

      {showClaimForm ? (
        <ClaimForm />
      ) : (
      <div className="claim-List">
        <div className="mb-4 flex space-x-2 justify-start w-full">
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
          <div className="">
            <table className="table-auto md:table-fixed">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-6 text-left w-[10em]">Date</th>
                  {isAdmin && <th className="py-2 px-6 text-left w-[10em]">Employee</th>}
                  <th className="py-2 px-6 text-left w-[10em]">Amount</th>
                  <th className="py-2 px-6 text-left w-[10em]">Status</th>
                  <th className="py-2 px-6 text-left w-[10em]"></th>
                </tr>
              </thead>
              <tbody>
              {filteredClaims.map((claim) => (
                <React.Fragment key={claim.id}>
                    <tr key={claim.id} className="border-t">
                      <td className="py-2 px-6">{new Date(claim.submitted_on).toLocaleDateString()}</td>
                      {isAdmin && <td className="py-2 px-6">{claim.profiles?.email}</td>}
                      <td className="py-2 px-6">${claim.amount.toFixed(2)}</td>
                      <td className="py-2 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                          ${claim.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            claim.status === 'denied' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {claim.status}
                        </span>
                      </td>
                      <td className="py-2 px-6">
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
                              // user={{ id: userId || '' } as any} 
                              isAdmin={isAdmin} 
                              isInlineView={true} 
                            />
                            
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}
        {/* <ClaimForm/> */}
    </div>
    
  );
}