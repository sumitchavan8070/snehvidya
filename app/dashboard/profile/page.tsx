import UserAddressCard from "./components/UserAddressCard";
import UserInfoCard from "./components/UserInfoCard";
import UserMetaCard from "./components/UserMetaCard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Profile | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Profile page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Profile() {
  return (
    <div>
      <div className="rounded-2xl bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">Manage your profile</p>
        </div>

        <div className="space-y-6">
          <UserMetaCard />  


        </div>
      </div>
    </div>
  );
}
