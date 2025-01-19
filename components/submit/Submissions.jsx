"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import detectRedFlags from "@/utils/detectRedFlags";
import SubmissionPageHeader from "@/components/header/SubmissionPageHeader";
import Link from "next/link";

const Submission = () => {
  const [emailContent, setEmailContent] = useState("");
  const [report, setReport] = useState({ redFlags: [], riskLevel: "" });
  const [scansLeft, setScansLeft] = useState(3); // Default free-tier scans
  const [showModal, setShowModal] = useState(false);

  // Initialize scansLeft from cookies
  useEffect(() => {
    const storedScans = Cookies.get("scansLeft");
    if (storedScans !== undefined && !isNaN(parseInt(storedScans))) {
      setScansLeft(parseInt(storedScans));
    } else {
      Cookies.set("scansLeft", 3, { expires: 1 });
      setScansLeft(3);
    }
  }, []);

  // Show modal when scans reach 0
  useEffect(() => {
    if (scansLeft <= 0) {
      setShowModal(true);
    }
  }, [scansLeft]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if scans are available (free tier)
    if (scansLeft <= 0) {
      setShowModal(true);
      return;
    }

    // Determine the tier
    const userTier = scansLeft > 3 ? "paid" : "free";

    // Call detectRedFlags with appropriate tier
    const { redFlags, riskLevel } = detectRedFlags(emailContent, userTier);
    console.log("Detection Report:", { redFlags, riskLevel });

    setReport({ redFlags, riskLevel });

    // Deduct scan count for free tier
    if (userTier === "free") {
      const newScansLeft = scansLeft - 1;
      setScansLeft(newScansLeft);
      Cookies.set("scansLeft", newScansLeft, { expires: 1 });
    }

    setEmailContent(""); // Clear the input
  };

  return (
    <div>
      <SubmissionPageHeader scansLeft={scansLeft} />
      <div className="p-8 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            placeholder="Paste suspicious email content here"
            className="textarea textarea-bordered w-full h-40"
          />
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={scansLeft <= 0}
          >
            Analyze Email
          </button>
        </form>

        {/* Report Section */}
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
              <h3 className="font-bold text-lg">
                Sign Up to Unlock More Scans!
              </h3>
              <p className="py-4">
                You’ve reached your free scan limit. Create a free account to
                get 10 scans per day and save your scam reports!
              </p>
              <div className="modal-action">
                <Link href="/sign-up" className="btn btn-primary">
                  Sign Up for Free
                </Link>
                <button onClick={() => setShowModal(false)} className="btn">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Submission;
