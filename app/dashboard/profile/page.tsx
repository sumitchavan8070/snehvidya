import UserMetaCard from "./components/UserMetaCard";
import { Metadata } from "next";
import React from "react";
import { User } from "lucide-react";

export const metadata: Metadata = {
  title: "Profile | School Management System",
  description: "View and manage your profile information",
};

export default function Profile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-muted-foreground mt-1">View and manage your profile information</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="space-y-6">
          <UserMetaCard />
        </div>
      </div>
    </div>
  );
}
