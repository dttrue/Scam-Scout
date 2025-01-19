"use client";

import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import React from "react";

export default function AuthenticatedDashboardLayout({ children }) {
  return (
    <ClerkProvider debug={true}>
      <SignedOut>
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500 mb-4">
            You are not signed in. Please sign in or sign up to access your
            dashboard.
          </p>
          <div className="flex space-x-4">
            <SignInButton mode="modal">
              <button className="btn btn-primary">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="btn btn-secondary">Sign Up</button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <div>
          <div className="flex justify-between items-center p-4 bg-gray-100">
            <UserButton />
            <h1 className="text-lg font-bold">Welcome to your Dashboard</h1>
          </div>
          {children}
        </div>
      </SignedIn>
    </ClerkProvider>
  );
}
