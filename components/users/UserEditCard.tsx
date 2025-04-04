"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@/lib/definitions";

export default function EditUserCard({ user }: { user: User }) {
  const supabase = createClient();
  const [formData, setFormData] = useState(user);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(formData)
      .eq("id", user.id);

    if (error) {
      alert("Failed to update user");
    } else {
      alert("User updated successfully");
    }

    setSaving(false);
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-xl mx-auto space-y-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Edit User</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-600">First Name</label>
          <input
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-600">Last Name</label>
          <input
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-600">Role</label>
          <input
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600">Email</label>
          <input
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="text-right">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center justify-center px-5 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
