import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";

export default async function SuperAdminDashboard() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  async function handleSubmit(formData: FormData) {
    "use server";

    const category = formData.get("category") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const description = formData.get("description") as string;
    const file = formData.get("document") as File;

    if (!category || !amount || !description || !file) {
      return;
    }

    // Upload file to Supabase Storage
    // const { data: fileData, error: fileError } = await supabase.storage
    //   .from("claims-documents")
    //   .upload(`documents/${file.name}`, file);

    // if (fileError) {
    //   console.error("File upload failed:", fileError);
    //   return;
    // }

    // Save claim to database
    // const { error } = await supabase.from("claims").insert([
    //   {
    //     user_id: user.id,
    //     category,
    //     amount,
    //     description,
    //     document_url: fileData?.path,
    //   },
    // ]);

    // if (error) {
    //   console.error("Claim submission failed:", error);
    // }
  }

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 border rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Submit a Claim</h2>

      <form action={handleSubmit} className="space-y-4">
        {/* Category Select */}
        <Select>
        <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
        </SelectContent>
        </Select>

        {/* Amount Input */}
        <Input type="number" name="amount" placeholder="Enter amount" required />

        {/* Description Textarea */}
        <Textarea name="description" placeholder="Enter description" required />

        {/* File Upload */}
        <Input type="file" name="document" required />

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          Submit Claim
        </Button>
      </form>
    </div>
  );
}
