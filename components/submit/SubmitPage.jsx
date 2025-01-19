// Import localStorage utilities
"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import detectRedFlags from "@/utils/detectRedFlags";
import { useUser } from "@/contexts/UserContext";
import SubmissionPageHeader from "@/components/header/SubmissionPageHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SubmitPage = () => {
  const { user, setUser } = useUser();
  const [emailContent, setEmailContent] = useState("");
  const [report, setReport] = useState({ redFlags: [], riskLevel: "" });
  const [showModal, setShowModal] = useState(false);
  const [isClient, setIsClient] = useState(false); // Flag for client-only rendering
  const router = useRouter();
const [emailTitle, setEmailTitle] = useState(""); // New state for the email title

const saveFlaggedEmail = async () => {
  const newEntry = {
    title: emailTitle || emailContent.slice(0, 50) + "...",
    content: emailContent,
    redFlags: report.redFlags,
    riskLevel: report.riskLevel,
    date: new Date().toLocaleString(),
  };

  try {
    const response = await fetch("/api/flaggedEmails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEntry),
    });

    if (response.ok) {
      alert("Email saved successfully!");
      setEmailTitle(""); // Reset the title input
    } else {
      const { error } = await response.json();
      console.error("Error saving email:", error);
      alert(`Failed to save email: ${error}`);
    }
  } catch (error) {
    console.error("Failed to save flagged email:", error);
    alert("Something went wrong while saving the email.");
  }
};






  // Ensure this code runs only after hydration
  useEffect(() => {
    setIsClient(true);

    // Initialize scansLeft from cookies
    const storedScans = Cookies.get("scansLeft");
    if (storedScans !== undefined && !isNaN(parseInt(storedScans))) {
      setUser((prev) => ({ ...prev, scansLeft: parseInt(storedScans) }));
    } else {
      Cookies.set("scansLeft", 10, { expires: 1 });
      setUser((prev) => ({ ...prev, scansLeft: 10 }));
    }
  }, [setUser]);

 const handleSubmit = (e) => {
   e.preventDefault();

   if (!user.isUpgraded && user.scansLeft <= 0) {
     setShowModal(true);
     return;
   }

   // Process submission
   const { redFlags, riskLevel } = detectRedFlags(
     emailContent,
     user.isUpgraded ? "paid" : "free"
   );
   setReport({ redFlags, riskLevel });

   if (!user.isUpgraded) {
     const newScansLeft = user.scansLeft - 1;
     setUser((prev) => ({ ...prev, scansLeft: newScansLeft }));
     Cookies.set("scansLeft", newScansLeft, { expires: 1 });
   }

   setEmailContent("");
 };

  if (!isClient) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <SubmissionPageHeader scansLeft={user.scansLeft} />
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Submit Suspicious Email</h1>

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
            disabled={!user.isUpgraded && user.scansLeft <= 0}
          >
            Analyze Email
          </button>
        </form>

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

            <div className="mt-4">
              <label htmlFor="emailTitle" className="block font-semibold">
                Email Title (Optional):
              </label>
              <input
                type="text"
                id="emailTitle"
                value={emailTitle}
                onChange={(e) => setEmailTitle(e.target.value)}
                placeholder="Add a title for this email"
                className="input input-bordered w-full"
              />
            </div>

            <button onClick={saveFlaggedEmail} className="btn btn-accent mt-4">
              Save Flagged Email
            </button>
          </div>
        )}

        {showModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Upgrade to Premium</h3>
              <p className="py-4">
                You've used all your free scans. Upgrade to a premium plan for
                unlimited scans!
              </p>
              <div className="modal-action">
                <Link href="/pricing" className="btn btn-primary">
                  Upgrade Now
                </Link>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="btn"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitPage;
