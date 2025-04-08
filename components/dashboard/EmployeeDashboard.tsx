"use client";

import { fetchAllClaimsData } from "@/lib/actions";
import { Claim } from "@/lib/definitions";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import ClaimList from "../claims/ClaimList";

export default function EmployeeDashboard({ user, isAdmin }: { user: User, isAdmin: boolean }) {
  
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"claims" | "report">("claims");

  useEffect(() => {
    async function fetchClaims() {
      try {
        const allClaimsData = await fetchAllClaimsData(); // Call the function and await its result
        
        setClaims(allClaimsData || []);
      } catch (err) {
        console.error('Error fetching claims:', err);
        setError('Failed to load claims');
      } finally {
        setLoading(false);
      }
    }
    
    fetchClaims();
  }, [user.id, isAdmin]);
  
  if (loading) {
    return <div className="p-4 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-destructive-foreground">{error}</div>;
  }

  const showClaimList = () => {
    setCurrentView("claims");
  }
  
  const showReport = () => {
    setCurrentView("report");
  }

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Employee Dashboard</h1>
      <p className="mb-4">Welcome, {user.email}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        
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

      <button onClick={showClaimList} className="text-foreground hover:underline">
        View Claims List
      </button>
      
      <div className="w-full max-w-4xl">
        {currentView === 'claims' && (
          <ClaimList 
            isAdmin={isAdmin}
            user={user}
            claims={claims}
          />
        )}
      </div>
    </div>
  );
}