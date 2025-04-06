"use client";

import { Claim } from "@/lib/definitions";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useState } from "react";
import ClaimCard from "./ClaimCard";

interface ClaimListProps {
  isAdmin: boolean;
  user: User;
  claims: Array<Claim>;
}

export default function ClaimList({ isAdmin, user, claims = [] }: ClaimListProps) {
  const [filter, setFilter] = useState<string>("all");
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);

  const toggleClaimExpansion = (claimId: string) => {
    setExpandedClaimId(expandedClaimId === claimId ? null : claimId);
  };

  const filteredClaims = filter === "all"
    ? claims
    : claims.filter(claim => claim.status === filter);

  return (
    <div className="flex flex-col items-center bg-background p-4 rounded-lg">
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-lg font-semibold">Claims</h2>
        <Link
          href="/dashboard/claims/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Create New Claim
        </Link>
      </div>

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
              {filteredClaims.flatMap((claim) => {
                const rows = [];
                rows.push(
                  <tr key={claim.id} className="border-t hover:bg-muted/50">
                    <td className="py-2 px-4 align-top">{new Date(claim.submitted_on).toLocaleDateString()}</td>
                    {isAdmin && <td className="py-2 px-4 align-top">{claim.profiles?.email || 'N/A'}</td>}
                    <td className="py-2 px-4 align-top">${claim.amount.toFixed(2)}</td>
                    <td className="py-2 px-4 align-top">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                          claim.status === 'denied' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-2 px-4 align-top">
                      <button
                        onClick={() => toggleClaimExpansion(claim.id)}
                        className="text-primary hover:underline focus:outline-none text-sm"
                      >
                        {expandedClaimId === claim.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                );

                if (expandedClaimId === claim.id) {
                  rows.push(
                    <tr key={`${claim.id}-details`} className="border-b bg-muted/20">
                      <td colSpan={isAdmin ? 5 : 4} className="p-0">
                        <div className="p-4">
                          <ClaimCard
                            claimId={claim.id}
                            user={user}
                            isAdmin={isAdmin}
                            isInlineView={true}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                }
                return rows;
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}