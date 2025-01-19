"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs"; // Import Clerk's useUser hook
import FraudScoreDisplay from "@/components/FraudScoreDisplay";
export default function VerifyAddressPage() {
  const [address, setAddress] = useState("");
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [remainingScans, setRemainingScans] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { isSignedIn, user } = useUser(); // Get Clerk user data

  useEffect(() => {
    if (!isSignedIn) {
      // Free tier (no signup): 1 scan per day
      setRemainingScans(1);
    } else if (user) {
      fetch(`/api/user/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          const dailyLimit = user.publicMetadata?.tier === "free" ? 3 : 30; // Free Tier: 3, Paid Tier: 30
          setRemainingScans(dailyLimit - (data.addressScanCount || 0));
        })
        .catch((err) => console.error("Failed to fetch user data:", err));
    }
  }, [isSignedIn, user]);

  const handleSignUpRedirect = () => {
    router.push("/sign-up");
  };

  const handleVerifyAddress = async () => {
    if (remainingScans <= 0) {
      setModalOpen(true);
      return;
    }

    if (!address.trim()) {
      setError("Please enter a valid physical address.");
      return;
    }

    setError(""); // Clear previous errors
    setLoading(true); // Start loading spinner

    try {
      const response = await fetch("/api/verify-address-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: isSignedIn ? user.id : null,
          address,
          domain,
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
      setError("Failed to verify address or domain.");
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  const closeModal = () => setModalOpen(false);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Verify Address or Domain</h1>
      <p className="text-gray-600 mb-4">
        {isSignedIn
          ? `You have ${remainingScans} scans left for today.`
          : `You have ${remainingScans} free scan left. Sign up for more!`}
      </p>
      <input
        className="input input-accent input-bordered w-full mb-4"
        placeholder="Enter physical address (required)"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <input
        className="input input-accent input-bordered w-full mb-4"
        placeholder="Enter domain/website (optional)"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
      />
      <button
        className="btn btn-primary w-full"
        onClick={handleVerifyAddress}
        disabled={loading}
      >
        {loading ? (
          <span className="loading loading-bars loading-lg"></span>
        ) : (
          "Verify"
        )}
      </button>

      {/* Display error message */}
      {error && <div className="alert alert-error mt-4">{error}</div>}

      {/* Display analysis results */}
      {result && (
        <div className="mt-6 p-4 bg-base-100 rounded shadow space-y-4">
          <h2 className="text-xl font-bold">Verification Result</h2>
          <div className="space-y-2">
            <p className="text-gray-800">
              <strong>1. Address Validity:</strong>{" "}
              {result.message
                .match(/Address Validity:\s*(.+?)(?=\n|$)/i)?.[1]
                ?.trim() ||
                "Unable to determine address validity. The analysis may be incomplete."}
            </p>
            <p className="text-gray-800">
              <strong>2. Domain Status:</strong>{" "}
              {result.message
                .match(/Domain Status:\s*(.+?)(?=\n|$)/i)?.[1]
                ?.trim() || "Domain status not provided or invalid."}
            </p>

            {/* FraudScoreDisplay */}
            <FraudScoreDisplay
              fraudScore={result.fraudScore}
              explanation={result.detailedAnalysis}
            />

            <p className="text-gray-800">
              <strong>3. Detailed Analysis:</strong>
            </p>
            <p className="text-gray-700 whitespace-pre-wrap">
              {result.message
                .match(/Detailed Analysis:\s*(.+)/i)?.[1]
                ?.trim() ||
                "The AI was unable to generate a detailed analysis. Please refine your input or try again."}
            </p>
          </div>
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
