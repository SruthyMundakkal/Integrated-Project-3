"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

export default function ClaimForm() {
  const supabase = createClient();
  
  // State variables
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mileage, setMileage] = useState<number | string>("");
  const [startLocation, setStartLocation] = useState<string>("");
  const [endLocation, setEndLocation] = useState<string>("");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("id, name")
          .order("name", { ascending: true });

        if (categoryError) throw categoryError;
        setCategories(categoryData || []);

        // Get authenticated user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) throw new Error("User not authenticated");

        const userId = userData.user.id;

        console.log(userId);

        // Fetch profile where user.id matches profiles.user_id
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;

        setProfileId(profileData.id); // Store profile ID
      } catch (err: any) {
        console.error("Error:", err.message);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  const handleClaimSubmission = async () => {
    if (!profileId) {
      alert("Profile not found. Cannot submit claim.");
      return;
    }

    if (!selectedCategory) {
      alert("Please select a claim category.");
      return;
    }

    const claimData = {
      profile_id: profileId, // Link claim to profile
      category: selectedCategory,
      mileage: selectedCategory === "Travel" ? mileage : null,
      start_location: selectedCategory === "Travel" ? startLocation : null,
      end_location: selectedCategory === "Travel" ? endLocation : null,
    };

    const { error } = await supabase.from("claims").insert([claimData]);

    if (error) {
      alert("Failed to submit claim: " + error.message);
    } else {
      alert("Claim submitted successfully!");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <CardHeader>
        <CardTitle className="text-xl">Submit a Claim</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Claim Type Selection */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="claim-type" className="w-1/3">Claim Type</Label>
          <Select className="w-2/3" onValueChange={setSelectedCategory}>
            <SelectTrigger id="claim-type">
              <SelectValue placeholder="Select claim type" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Extra Fields for Travel Category */}
        {selectedCategory === "Travel" && (
          <>
            <div className="flex items-center space-x-4">
              <Label htmlFor="mileage" className="w-1/3">Mileage</Label>
              <Input id="mileage" type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} className="w-2/3" />
            </div>

            <div className="flex items-center space-x-4">
              <Label htmlFor="start-location" className="w-1/3">Start Location</Label>
              <Input id="start-location" value={startLocation} onChange={(e) => setStartLocation(e.target.value)} className="w-2/3" />
            </div>

            <div className="flex items-center space-x-4">
              <Label htmlFor="end-location" className="w-1/3">End Location</Label>
              <Input id="end-location" value={endLocation} onChange={(e) => setEndLocation(e.target.value)} className="w-2/3" />
            </div>
          </>
        )}

        {/* Amount Field */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="amount" className="w-1/3">Amount</Label>
          <Input id="amount" type="number" placeholder="0.00" className="w-2/3" />
        </div>

        {/* Description Field */}
        <div className="flex items-start space-x-4">
          <Label htmlFor="description" className="w-1/3">Description</Label>
          <Textarea id="description" placeholder="Enter details" className="w-2/3 min-h-[120px]" />
        </div>

        {/* Attach Document Field */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="document-upload" className="w-1/3">Attach Document</Label>
          <div className="w-2/3 border border-input rounded-md p-2">
            <label
              htmlFor="document-upload"
              className="flex flex-col items-center justify-center gap-1 py-4 cursor-pointer text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <Upload className="h-6 w-6" />
              <span className="text-sm">Click to upload file</span>
              <input id="document-upload" type="file" className="sr-only" />
            </label>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleClaimSubmission} className="w-full text-lg py-3">Submit Claim</Button>
      </CardFooter>
    </Card>
  );
}
