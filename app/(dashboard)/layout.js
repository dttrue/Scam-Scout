"use client";

import React, { useState, useEffect, cloneElement } from "react";

export default function GuestDashboardLayout({ children }) {
  const [emailScansLeft, setEmailScansLeft] = useState(3);
  const [jobScansLeft, setJobScansLeft] = useState(1);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  useEffect(() => {
    const scanData = JSON.parse(localStorage.getItem("scanData")) || {
      emailScans: 0,
      jobScans: 0,
      resetAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    if (Date.now() > scanData.resetAt) {
      const resetData = {
        emailScans: 0,
        jobScans: 0,
        resetAt: Date.now() + 24 * 60 * 60 * 1000,
      };
      localStorage.setItem("scanData", JSON.stringify(resetData));
      setEmailScansLeft(3);
      setJobScansLeft(1);
    } else {
      setEmailScansLeft(3 - scanData.emailScans);
      setJobScansLeft(1 - scanData.jobScans);
    }
  }, []);

  const incrementEmailScan = () => {
    const scanData = JSON.parse(localStorage.getItem("scanData"));
    if (scanData.emailScans < 3) {
      scanData.emailScans += 1;
      setEmailScansLeft(3 - scanData.emailScans);
      localStorage.setItem("scanData", JSON.stringify(scanData));
      return true;
    } else {
      setShowSignUpModal(true);
      return false;
    }
  };

  const incrementJobScan = () => {
    const scanData = JSON.parse(localStorage.getItem("scanData"));
    if (scanData.jobScans < 1) {
      scanData.jobScans += 1;
      setJobScansLeft(1 - scanData.jobScans);
      localStorage.setItem("scanData", JSON.stringify(scanData));
      return true;
    } else {
      setShowSignUpModal(true);
      return false;
    }
  };

  return (
    <>
      <div className="p-6">
        {React.Children.map(children, (child) =>
          cloneElement(child, {
            emailScansLeft,
            jobScansLeft,
            incrementEmailScan,
            incrementJobScan,
          })
        )}
      </div>

      {showSignUpModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Sign Up for More Scans</h3>
            <p className="py-4">
              You’ve reached your daily limit. Sign up to unlock additional
              scans and premium features.
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowSignUpModal(false)}>
                Close
              </button>
              <a href="/sign-up" className="btn btn-primary">
                Sign Up
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
