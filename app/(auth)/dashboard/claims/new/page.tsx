"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

export default function ClaimForm() {
  const supabase = createClient();
  const [categories, setCategories] = useState<any[]>([]); // Store categories
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Track selected category
  const [mileage, setMileage] = useState<number | string>(""); // State for mileage
  const [startLocation, setStartLocation] = useState<string>(""); // State for start location
  const [endLocation, setEndLocation] = useState<string>(""); // State for end location
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name")
          .order("name", { ascending: true });

        if (error) throw error;
        setCategories(data || []); // Store categories in state
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [supabase]);

  if (loading) {
    return <div className="p-4 text-center">Loading categories...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  const handleCategoryChange = (value: string) => {
    console.log("Selected Category ID:", value); // Add this log to check the selected value
    setSelectedCategory(value); // Update selected category
  };
  

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <CardHeader>
        <CardTitle className="text-xl">Submit a Claim</CardTitle>
        <CardDescription>Fill out the form below to submit your claim request.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Claim Type Row */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="claim-type" className="w-1/3">Claim Type</Label>
          <Select className="w-2/3" onValueChange={handleCategoryChange}>
            <SelectTrigger id="claim-type">
              <SelectValue placeholder="Select claim type" />
            </SelectTrigger>
            <SelectContent>
              {/* Dynamically populate categories in SelectItems */}
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
              <Input
                id="mileage"
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="Enter mileage"
                className="w-2/3"
              />
            </div>

            <div className="flex items-center space-x-4">
              <Label htmlFor="start-location" className="w-1/3">Starting Location</Label>
              <Input
                id="start-location"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                placeholder="Enter start location"
                className="w-2/3"
              />
            </div>

            <div className="flex items-center space-x-4">
              <Label htmlFor="end-location" className="w-1/3">Ending Location</Label>
              <Input
                id="end-location"
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                placeholder="Enter end location"
                className="w-2/3"
              />
            </div>
          </>
        )}

        {/* Amount Row */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="amount" className="w-1/3">Amount</Label>
          <Input id="amount" type="number" placeholder="0.00" className="w-2/3" />
        </div>

        {/* Description Row */}
        <div className="flex items-start space-x-4">
          <Label htmlFor="description" className="w-1/3">Description</Label>
          <Textarea id="description" placeholder="Enter details" className="w-2/3 min-h-[120px]" />
        </div>

        {/* Attach Document Row */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="document-upload" className="w-1/3">Attach Document</Label>
          <div className="w-2/3 border border-input rounded-md p-2">
            <label
              htmlFor="document-upload"
              className="flex flex-col items-center justify-center gap-1 py-4 cursor-pointer text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <Upload className="h-2 w-6" />
              <span className="text-sm">Click to upload file</span>
              <input id="document-upload" type="file" className="sr-only" />
            </label>
          </div>
        </div>

        
      </CardContent>
      <CardFooter>
        <Button className="w-full text-lg py-3">Submit Claim</Button>
      </CardFooter>
    </Card>
  );
}
