"use client";

import { useRouter } from "next/navigation"; // Use correct import
import { useState, useEffect } from "react";
import { getScanData, incrementScanCount } from "@/utils/scanTracker";
import FraudScoreDisplay from "@/components/FraudScoreDisplay";
export default function AnalyzeEmailPage({ user }) {
  const [emailText, setEmailText] = useState("");
  const [senderEmail, setSenderEmail] = useState(""); // Added for sender email
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [remainingScans, setRemainingScans] = useState(3);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter(); // Correct hook for routing

  useEffect(() => {
    if (!user) {
      const scanData = getScanData();
      setRemainingScans(3 - scanData.count);
    } else {
      fetch(`/api/user/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          const dailyLimit = user.tier === "free" ? 5 : 30;
          setRemainingScans(dailyLimit - data.scanCount);
        })
        .catch((err) => console.error("Failed to fetch user data:", err));
    }
  }, [user]);

  const handleAnalyzeEmail = async () => {
    if (remainingScans <= 0) {
      setModalOpen(true);
      return;
    }

    if (!emailText.trim() || !senderEmail.trim()) {
      setError("Please enter both the email text and the sender's email.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      let canProceed = true;

      if (!user) {
        canProceed = incrementScanCount();
        if (canProceed) {
          setRemainingScans((prev) => prev - 1);
        }
      }

      if (!canProceed) return;

      const response = await fetch("/api/analyze-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user ? user.id : null,
          text: emailText,
          email: senderEmail, // Added senderEmail to the request body
        }),
      });

      const data = await response.json();
      console.log("Backend Response:", data);
      if (response.ok) {
        setResult(data.result);
        if (user) {
          setRemainingScans((prev) => prev - 1);
        }
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to analyze email.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setModalOpen(false);

  const handleSignUpRedirect = () => {
    router.push("/sign-up"); // Correct routing function
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Analyze Email</h1>
      <p className="text-gray-600 mb-4">
        {user
          ? `You have ${remainingScans} scans left for today.`
          : `You have ${remainingScans} free scans left. Sign up for more!`}
      </p>

      {/* Input for email content */}
      <textarea
        className="textarea textarea-accent textarea-bordered w-full mb-4"
        placeholder="Paste email text here..."
        rows="6"
        value={emailText}
        onChange={(e) => setEmailText(e.target.value)}
      />

      {/* Input for sender's email */}
      <input
        type="email"
        className="input input-bordered w-full mb-4"
        placeholder="Sender's email address"
        value={senderEmail}
        onChange={(e) => setSenderEmail(e.target.value)}
      />

      <button
        className="btn btn-primary w-full"
        onClick={handleAnalyzeEmail}
        disabled={loading}
      >
        {loading ? (
          <span className="loading loading-bars loading-lg"></span>
        ) : (
          "Analyze Email"
        )}
      </button>

      {error && <div className="alert alert-error mt-4">{error}</div>}

      {result && (
        <div className="mt-6 p-4 bg-base-100 rounded shadow space-y-4">
          <h2 className="text-xl font-bold">Analysis Result</h2>
          <div className="space-y-2">
            <p className="text-gray-800">
              <strong>1. Scam Likelihood:</strong>{" "}
              {result.scamLikelihood || "Not Available"}
            </p>
            <p className="text-gray-800">
              <strong>2. Keywords and Phrases Indicating a Scam:</strong>
            </p>
            <ul className="list-disc pl-5 text-gray-700">
              {result.suspiciousKeywords &&
              result.suspiciousKeywords.length > 0 ? (
                result.suspiciousKeywords.map((keyword, index) => (
                  <li key={index}>{keyword}</li>
                ))
              ) : (
                <li>No keywords identified</li>
              )}
            </ul>
            <FraudScoreDisplay
              fraudScore={result.fraudScore || 0}
              explanation={
                result.detailedAnalysis || "No detailed analysis provided."
              }
            />
            <p className="text-gray-800">
              <strong>4. Detailed Analysis:</strong>
            </p>
            <p className="text-gray-700 whitespace-pre-wrap">
              {result.detailedAnalysis || "No detailed analysis provided."}
            </p>
          </div>
        </div>
      )}

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
              <button
                className="btn btn-primary"
                onClick={handleSignUpRedirect}
              >
                Sign Up Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
