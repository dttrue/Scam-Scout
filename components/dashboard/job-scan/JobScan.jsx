"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import analyzeJobListing from "@/utils/analyzeJobListing";
import Link from "next/link";

const JobScan = () => {
  const [jobContent, setJobContent] = useState("");
  const [report, setReport] = useState({ redFlags: [], riskLevel: "" });
  const [scansLeft, setScansLeft] = useState(1);
  const [showModal, setShowModal] = useState(false);

  // Retrieve job scans left from cookies on load
  useEffect(() => {
    const storedScans = Cookies.get("jobScansLeft");
    if (storedScans !== undefined && !isNaN(parseInt(storedScans))) {
      setScansLeft(parseInt(storedScans));
    } else {
      Cookies.set("jobScansLeft", 1, { expires: 1 });
      setScansLeft(1);
    }
  }, []);

  // Show modal when scans reach 0
  useEffect(() => {
    if (scansLeft === 0) {
      setShowModal(true);
    }
  }, [scansLeft]);

const handleSubmit = (e) => {
  e.preventDefault();

  // Show modal if scans are exhausted
  if (scansLeft <= 0) {
    setShowModal(true);
    return;
  }

  // Call the analysis function
  const { redFlags, riskLevel } = analyzeJobListing(jobContent);

  if (redFlags.length === 0) {
    alert("No red flags detected. The job listing appears safe.");
  }

  // Update the report state
  setReport({ redFlags, riskLevel });

  // Deduct scan count for the current session
  const newScansLeft = scansLeft - 1;
  setScansLeft(newScansLeft);

  // Persist scan count using cookies
  Cookies.set("jobScansLeft", newScansLeft, { expires: 1 });

  // Clear the input field for the next job listing
  setJobContent("");
};


  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Scan a Job Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={jobContent}
          onChange={(e) => setJobContent(e.target.value)}
          placeholder="Paste job listing here"
          className="textarea textarea-bordered w-full h-40"
        />

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={scansLeft <= 0}
        >
          Analyze Job Listing
        </button>
      </form>

      {/* Display Results */}
      {report.redFlags.length > 0 && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-xl font-semibold">
            Risk Level: <span>{report.riskLevel}</span>
          </h3>
          <ul className="list-disc pl-5">
            {report.redFlags.map((flag, index) => (
              <li key={index}>{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Sign Up to Unlock More Scans!</h3>
            <p className="py-4">
              You’ve reached your free scan limit. Create an account or upgrade
              to scan more job listings!
            </p>
            <div className="modal-action">
              <Link href="/sign-up" className="btn btn-primary">
                Sign Up
              </Link>
              <button onClick={() => setShowModal(false)} className="btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobScan;
