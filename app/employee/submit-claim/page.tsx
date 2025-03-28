"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
}

export default function SubmitClaim() {
  const supabase = createClient();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    description: "",
    receipt_url: "",
  });

  // Form validation errors
  const [errors, setErrors] = useState<{
    category_id?: string;
    amount?: string;
    description?: string;
  }>({});

  useEffect(() => {
    async function fetchCategories() {
      try {
        console.log("Fetching categories...");
        
        let { data: categories, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        console.log("Categories result:", { categories, error });

        if (error) throw error;
        setCategories(categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setMessage({ 
          text: "Failed to load expense categories", 
          type: "error" 
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear validation error when field is modified
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.category_id) {
      newErrors.category_id = "Please select an expense category";
    }
    
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount greater than zero";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Please provide a description";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to submit a claim");
      }
      
      const amount = parseFloat(formData.amount);
      
      // For debugging - check what data we're sending
      console.log("About to submit claim with data:", {
        user_id: user.id,
        category_id: formData.category_id,
        amount: amount,
        description: formData.description,
        receipt_url: formData.receipt_url || null
      });
      
      // Submit the claim to Supabase
      const { data, error } = await supabase
        .from('claims')
        .insert([
          {
            user_id: user.id,
            category_id: formData.category_id,
            amount: amount,
            description: formData.description,
            receipt_url: formData.receipt_url || null, // Add this line
            status: 'pending', // Default status for new claims
            created_at: new Date().toISOString()
          },
        ])
        .select();
      
      if (error) {
        console.error("Supabase error details:", error);
        throw error;
      }
      
      setMessage({ text: "Claim submitted successfully!", type: "success" });
      setFormData({
        category_id: "",
        amount: "",
        description: "",
        receipt_url: "",
      });
      
    } catch (err) {
      console.error("Error submitting claim:", err);
      setMessage({ 
        text: err instanceof Error ? err.message : "Failed to submit claim", 
        type: "error" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">Submit New Claim</h2>
        <p className="text-gray-600 mb-6">Complete the form below to submit a new expense claim for reimbursement.</p>
        
        {message && (
          <div className={`mb-6 p-4 border-l-4 rounded ${
            message.type === "success" 
              ? "bg-green-50 border-green-500 text-green-700" 
              : "bg-red-50 border-red-500 text-red-700"
          }`}>
            {message.text}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                Expense Category *
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.category_id ? "border-red-300" : "border-gray-300"
                } shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              {errors.category_id && (
                <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount ($) *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.amount ? "border-red-300" : "border-gray-300"
                } shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.description ? "border-red-300" : "border-gray-300"
                } shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                placeholder="Provide details about the expense"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="receipt_url" className="block text-sm font-medium text-gray-700">
                Receipt URL (optional)
              </label>
              <input
                type="text"
                id="receipt_url"
                name="receipt_url"
                value={formData.receipt_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="http://example.com/receipt.jpg"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Claim
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
