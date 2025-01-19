"use client";

import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [isClient, setIsClient] = useState(false); // Flag to ensure client-side rendering only

  useEffect(() => {
    // Mark as client-rendered after hydration
    setIsClient(true);
  }, []);

  // Placeholder for loading during SSR or user not loaded
  if (!isClient || !isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Redirect if the user is not authenticated
  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">
          You are not signed in. Please{" "}
          <SignInButton>
            <span className="text-blue-500 underline cursor-pointer">
              sign in
            </span>
          </SignInButton>{" "}
          to access your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Welcome,{" "}
        <span className="text-blue-500">{user.fullName || user.email}</span>!
      </h1>

      {/* Scans and Upgrade Status */}
      <div className="mb-6">
        <p className="mb-2">
          Scans Left:{" "}
          <span className="text-blue-500 font-bold">
            {user.publicMetadata.tier === "free" ? 5 : 30}
          </span>
        </p>
        <p>
          Upgrade Status:{" "}
          {user.publicMetadata.tier === "free" ? (
            <span className="text-gray-500">🔓 Free User</span>
          ) : (
            <span className="text-green-600 font-bold">🌟 Premium User</span>
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <Link href="/app/dashboard/submit" className="btn btn-primary w-full">
          Submit a Suspicious Email
        </Link>

        {user.publicMetadata.tier === "free" ? (
          <div className="p-4 bg-yellow-100 rounded-lg">
            <p className="mb-2">
              Upgrade now to unlock premium features like unlimited scans and
              viewing flagged emails!
            </p>
            <Link href="/pricing" className="btn btn-accent w-full">
              Upgrade to Premium
            </Link>
          </div>
        ) : (
          <Link
            href="/app/dashboard/flagged"
            className="btn btn-secondary w-full"
          >
            View Flagged Emails
          </Link>
        )}
      </div>

      {/* Sign Out */}
      <div className="mt-6">
        <SignOutButton>
          <button className="btn btn-error w-full">Sign Out</button>
        </SignOutButton>
      </div>
    </div>
  );
}
