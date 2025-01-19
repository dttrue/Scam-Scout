"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getScanData, incrementJobListingScanCount } from "@/utils/scanTracker";
import { useUser } from "@clerk/nextjs";
import FraudScoreDisplay from "@/components/FraudScoreDisplay";

export default function JobListingScanPage() {
  const [jobListingText, setJobListingText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [remainingScans, setRemainingScans] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isSignedIn) {
      // Free tier (no signup): 1 scan per day
      const scanData = getScanData();
      const remaining = 1 - (scanData.jobListingCount || 0);
      setRemainingScans(Math.max(remaining, 0));
    } else if (user) {
      fetch(`/api/user/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          // Free Tier (Signed Up): 3 scans/day, Paid Tier: 30 scans/day
          const dailyLimit = user.publicMetadata?.tier === "free" ? 3 : 30;
          const usedScans = data.jobListingScanCount || 0;
          setRemainingScans(Math.max(dailyLimit - usedScans, 0));
        })
        .catch((err) => console.error("Failed to fetch user data:", err));
    }
  }, [isSignedIn, user]);

  const handleSignUpRedirect = () => {
    router.push("/sign-up");
  };

  const handleAnalyzeJobListing = async () => {
    if (remainingScans <= 0) {
      setModalOpen(true);
      return;
    }

    if (!jobListingText.trim()) {
      setError("Please enter a job listing to analyze.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      let canProceed = true;

      if (!isSignedIn) {
        canProceed = incrementJobListingScanCount();
        if (canProceed) {
          setRemainingScans((prev) => prev - 1);
        }
      }

      if (!canProceed) return;

      const response = await fetch("/api/analyze-job-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: isSignedIn ? user.id : null,
          text: jobListingText,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.result);
        if (isSignedIn) {
          setRemainingScans((prev) => prev - 1);
        }
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to analyze job listing.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setModalOpen(false);

return (
  <div className="p-8 max-w-2xl mx-auto">
    <h1 className="text-3xl font-bold mb-6">Analyze Job Listing</h1>
    <p className="text-gray-600 mb-4">
      {isSignedIn
        ? `You have ${remainingScans} scans left for today.`
        : `You have ${remainingScans} free scans left. Sign up for more!`}
    </p>
    <textarea
      className="textarea textarea-accent textarea-bordered w-full mb-4"
      placeholder="Paste job listing text here..."
      rows="6"
      value={jobListingText}
      onChange={(e) => setJobListingText(e.target.value)}
    />
    <button
      className="btn btn-primary w-full"
      onClick={handleAnalyzeJobListing}
      disabled={loading}
    >
      {loading ? (
        <span className="loading loading-bars loading-lg"></span>
      ) : (
        "Analyze Job Listing"
      )}
    </button>

    {/* Display error message */}
    {error && <div className="alert alert-error mt-4">{error}</div>}

    {/* Display analysis results */}
    {result && (
      <div className="space-y-2">
        <p className="text-gray-800">
          <strong>1. Scam Likelihood:</strong>{" "}
          {result.scamLikelihood || "No response available"}
        </p>
        <p className="text-gray-800">
          <strong>2. Keywords and Phrases Indicating a Scam:</strong>
        </p>
        <ul className="list-disc pl-5 text-gray-700">
          {result.suspiciousKeywords && result.suspiciousKeywords.length > 0 ? (
            result.suspiciousKeywords.map((keyword, index) => (
              <li key={index}>{keyword}</li>
            ))
          ) : (
            <li>No keywords or phrases identified.</li>
          )}
        </ul>
        <p className="text-gray-800">
          <strong>3. Detailed Analysis:</strong>
        </p>
        <p className="text-gray-700 whitespace-pre-wrap">
          {result.detailedAnalysis || "No response available"}
        </p>

        {/* Fraud Score Display */}
        {result.fraudScore !== undefined && (
          <FraudScoreDisplay
            fraudScore={result.fraudScore}
            explanation={result.detailedAnalysis}
          />
        )}
      </div>
    )}

    {/* Modal for Scan Limit Reached */}
    {modalOpen && (
      <div className="modal modal-open">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Daily Scan Limit Reached</h3>
          <p className="py-4">
            You have used all your scans for today. Sign up to get more scans!
          </p>
          <div className="modal-action">
            <button className="btn" onClick={closeModal}>
              Close
            </button>
            <button className="btn btn-primary" onClick={handleSignUpRedirect}>
              Sign Up Now
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
