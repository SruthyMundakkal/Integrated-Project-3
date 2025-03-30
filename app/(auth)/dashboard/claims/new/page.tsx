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
  const [amount, setAmount] = useState<number | string>(""); // For the amount field
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null); // URL of the uploaded file

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

//   // Handle file selection
//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files?.length) {
//       const selectedFile = e.target.files[0];
//       setFile(selectedFile);
  
//       const fileName = Date.now() + "-" + selectedFile.name; // Generate a unique file name
//       try {
//         // Upload file to the 'claim-receipts' bucket
//         const { data, error } = await supabase.storage
//           .from("claim-receipts") // Updated bucket name
//           .upload(fileName, selectedFile);
  
//         if (error) {
//           console.error("File upload failed:", error);
//           alert("File upload failed: " + error.message);
//           return;
//         }
  
//         // Get the file URL
//         const fileUrl = data?.path;
//         console.log("File uploaded successfully. URL:", fileUrl);
  
//         // Save the file URL (receipt_url) in your table or claim data
//         const claimData = {
//           employee_id: profileId,
//           category_id: categories.find((category) => category.name === selectedCategory)?.id,
//           amount: Number(amount),
//           mileage: selectedCategory === "Travel" ? mileage : null,
//           start_location: selectedCategory === "Travel" ? startLocation : null,
//           end_location: selectedCategory === "Travel" ? endLocation : null,
//           status: "pending",
//           submitted_by: profileId,
//           receipt_url: fileUrl, // Store the file URL in the table
//         };
  
//         const { error: claimError } = await supabase.from("claims").insert([claimData]);
  
//         if (claimError) {
//           alert("Failed to submit claim: " + claimError.message);
//         } else {
//           alert("Claim submitted successfully!");
//         }
//       } catch (error: unknown) {
//         // Type assertion to error as a known Error object
//         if (error instanceof Error) {
//           console.error("Error uploading file:", error.message);
//           alert("Error uploading file: " + error.message);
//         } else {
//           console.error("Unknown error during file upload:", error);
//           alert("Unknown error during file upload.");
//         }
//       }
//     }
//   };

  const handleClaimSubmission = async () => {
    if (!profileId) {
      alert("Profile not found. Cannot submit claim.");
      return;
    }

    if (!selectedCategory) {
      alert("Please select a claim category.");
      return;
    }

    if (!amount || isNaN(Number(amount))) {
      alert("Please enter a valid amount.");
      return;
    }

    const claimData = {
      employee_id: profileId, // Assuming profile_id maps to employee_id
      category_id: categories.find((category) => category.name === selectedCategory)?.id,
      amount: Number(amount),
      mileage: selectedCategory === "Travel" ? mileage : null,
      start_location: selectedCategory === "Travel" ? startLocation : null,
      end_location: selectedCategory === "Travel" ? endLocation : null,
      status: "pending", // Set the status to 'pending'
      submitted_by: profileId, // The claim is submitted by the current user
      receipt_url: receiptUrl || null, // Add the file URL if file is present
    };

    const { error } = await supabase.from("claims").insert([claimData]);

    if (error) {
      alert("Failed to submit claim: " + error.message);
    } else {
      alert("Claim submitted successfully!");
    }
  };
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
  
      try {
        // Upload file to the claim-receipts bucket
        const { data, error: uploadError } = await supabase.storage
          .from("claim-receipts")
          .upload(`${profileId}/${selectedFile.name}`, selectedFile);
  
        if (uploadError) {
          throw uploadError;
        }
  
        // Get the URL of the uploaded file
        const fileUrl = `${supabase.storageUrl}/claim-receipts/${data?.path}`;
  
        // Insert claim data with receipt URL
        const claimData = {
          employee_id: profileId,
          category_id: categories.find((category) => category.name === selectedCategory)?.id,
          amount: Number(amount),
          mileage: selectedCategory === "Travel" ? mileage : null,
          start_location: selectedCategory === "Travel" ? startLocation : null,
          end_location: selectedCategory === "Travel" ? endLocation : null,
          status: "pending",  // Set the status to 'pending'
          submitted_by: profileId,
          receipt_url: fileUrl,  // Save the file URL in the claim
        };
  
        const { error } = await supabase.from("claims").insert([claimData]);
  
        if (error) {
          alert("Failed to submit claim: " + error.message);
        } else {
          alert("Claim submitted successfully!");
        }
      } catch (err: any) {
        console.error("File upload failed:", err.message);
        alert("File upload failed: " + err.message);
      }
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
          <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-2/3" />
        </div>

        {/* Description Field */}
        <div className="flex items-start space-x-4">
          <Label htmlFor="description" className="w-1/3">Description</Label>
          <Textarea 
            id="description" 
            placeholder="Enter details" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            className="w-2/3 min-h-[120px]" 
          />
        </div>

        {/* Attach Document Field */}
        <div className="flex items-center space-x-4">
        <Label htmlFor="document-upload" className="w-1/3">Attach Document</Label>
        <div className="w-2/3 border border-input rounded-md p-2 flex items-center space-x-2">
            <Input 
            id="document-upload" 
            type="file" 
            onChange={handleFileChange} 
            className="hidden" 
            />
            <label 
            htmlFor="document-upload" 
            className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-md flex items-center space-x-2"
            >
            <Upload size={16} />
            <span>Choose File</span>
            </label>
            {file && <span className="text-sm text-gray-600">{file.name}</span>}
        </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleClaimSubmission} className="w-full text-lg py-3">Submit Claim</Button>
      </CardFooter>
    </Card>
  );
}
