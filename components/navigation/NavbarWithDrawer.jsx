"use client";

import Link from "next/link";
import { useState } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs"; // Import Clerk hooks and SignOutButton

const navLinks = [
  { name: "Submit Email", href: "/dashboard/submit" },
  { name: "Job Scans", href: "/dashboard/job-scan" },
  { name: "Flagged Emails", href: "/dashboard/flagged" },
  { name: "Scam Data", href: "/dashboard/education" },
];

export default function NavbarWithDrawer() {
  const { isSignedIn } = useUser(); // Use Clerk's useUser hook to check sign-in status
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const renderNavLinks = () =>
    navLinks.map((link, index) => (
      <li key={index}>
        <Link href={link.href} onClick={toggleDrawer}>
          {link.name}
        </Link>
      </li>
    ));

  return (
    <div className="drawer drawer-end">
      {/* Drawer Toggle */}
      <input
        id="navbar-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={drawerOpen}
        readOnly
      />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className="navbar bg-base-300 w-full px-4">
          <div className="flex-1">
            <Link href="/" className="text-xl font-bold">
              Scam Scout
            </Link>
          </div>
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <ul className="menu menu-horizontal">
              {isSignedIn ? (
                renderNavLinks() // Render nav links for authenticated users
              ) : (
                <>
                  <li>
                    <Link href="/sign-in" className="btn btn-primary btn-sm">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link href="sign-up" className="btn btn-secondary btn-sm">
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="flex lg:hidden">
            <label
              htmlFor="navbar-drawer"
              className="btn btn-square btn-ghost"
              onClick={toggleDrawer}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-6 h-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>
        </div>
      </div>

      {/* Drawer Sidebar */}
      <div className="drawer-side">
        <label
          htmlFor="navbar-drawer"
          className="drawer-overlay"
          onClick={toggleDrawer}
        ></label>
        <ul className="menu bg-base-200 w-80 p-4 min-h-full">
          {isSignedIn ? (
            <>
              {renderNavLinks()}
              <li>
                <SignOutButton>
                  <button
                    onClick={toggleDrawer} // Close the drawer after signing out
                    className="btn btn-error btn-sm"
                  >
                    Sign Out
                  </button>
                </SignOutButton>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  href="sign-in"
                  className="btn btn-primary btn-sm hover:btn-accent shadow-lg transition-transform transform hover:scale-105"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="sign-up"
                  className="btn btn-secondary btn-sm hover:btn-warning shadow-lg transition-transform transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="submit"
                  className="btn btn-primary btn-sm hover:btn-accent shadow-lg transition-transform transform hover:scale-105"
                >
                  Submit Email
                </Link>
              </li>
              <li>
                <Link
                  href="job-scan"
                  className="btn btn-primary btn-sm hover:btn-accent shadow-lg transition-transform transform hover:scale-105"
                >
                  Job Scan
                </Link>
              </li>
              <li>
                <Link
                href="verify-address-domain"
                className="btn btn-primary btn-sm hover:btn-accent shadow-lg transition-transform transform hover:scale-105"
                >
                  Verify Address Domain
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
