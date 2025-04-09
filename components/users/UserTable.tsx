"use client";

import { User } from "@/lib/definitions";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";
import EditUserCard from "./UserEditCard"; // Adjust this import path if needed

export default function UserList() {
  const supabase = createClient();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        let { data, error } = await supabase.from("profiles").select("*");
        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [supabase]);

  const toggleUserExpansion = (id: string) => {
    setExpandedUserId(prev => (prev === id ? null : id));
  };

  if (loading) {
    return <div className="p-4 text-center">Loading users...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-destructive-foreground">{error}</div>;
  }

  return (
    <div className="flex flex-col w-4xl items-center bg-background p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">User List</h2>
      <table className="table-auto md:table-fixed w-full">
        <thead className="bg-gray-100 text-[var(--color-muted-foreground)]">
          <tr>
            <th className="py-2 px-6 text-left w-[10em]">First Name</th>
            <th className="py-2 px-6 text-left w-[10em]">Last Name</th>
            <th className="py-2 px-6 text-left w-[10em]">Role</th>
            <th className="py-2 px-6 text-left w-[10em]">Email</th>
            <th className="py-2 px-6 text-left w-[10em]"></th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-2 px-6 text-center">No users found.</td>
            </tr>
          ) : (
            users.map((user) => (
              <React.Fragment key={user.id}>
                <tr className="border-t">
                  <td className="py-2 px-6">{user.first_name}</td>
                  <td className="py-2 px-6">{user.last_name}</td>
                  <td className="py-2 px-6">{user.role}</td>
                  <td className="py-2 px-6">{user.email}</td>
                  <td className="py-2 px-6">
                    <button
                      onClick={() => toggleUserExpansion(user.id)}
                      className="px-4 py-1 bg-[var(--color-chart-5)] text-white rounded-full hover:bg-opacity-80 transition"
                    >
                      {expandedUserId === user.id ? "Close" : "Edit"}
                    </button>
                  </td>
                </tr>
                {expandedUserId === user.id && (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <div className="p-4 bg-gray-50">
                        <EditUserCard user={user} />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
