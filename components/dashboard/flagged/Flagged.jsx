"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function FlaggedPage() {
  const [flaggedEmails, setFlaggedEmails] = useState([]);

  // Fetch flagged emails from the server
  useEffect(() => {
    const fetchFlaggedEmails = async () => {
      try {
        const response = await fetch("/api/flaggedEmails");
        if (response.ok) {
          const emails = await response.json();
          setFlaggedEmails(emails);
        } else {
          console.error("Failed to fetch flagged emails");
        }
      } catch (error) {
        console.error("Error fetching flagged emails:", error);
      }
    };

    fetchFlaggedEmails();
  }, []);

  // Function to delete a flagged email
  const handleDelete = async (index) => {
    try {
      const response = await fetch(`/api/flaggedEmails?index=${index}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Email deleted successfully!");
        setFlaggedEmails((prev) => prev.filter((_, i) => i !== index));
      } else {
        const { error } = await response.json();
        alert(`Failed to delete email: ${error}`);
      }
    } catch (error) {
      alert("Something went wrong while deleting the email.");
    }
  };

  // Function to edit a flagged email
  const handleEdit = async (index) => {
    const updatedTitle = prompt(
      "Enter a new title for the email:",
      flaggedEmails[index]?.title || ""
    );
    if (!updatedTitle) return;

    try {
      const updatedEmail = { ...flaggedEmails[index], title: updatedTitle };
      const response = await fetch(`/api/flaggedEmails?index=${index}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEmail),
      });

      if (response.ok) {
        alert("Email updated successfully!");
        setFlaggedEmails((prev) =>
          prev.map((email, i) => (i === index ? updatedEmail : email))
        );
      } else {
        const { error } = await response.json();
        alert(`Failed to edit email: ${error}`);
      }
    } catch (error) {
      alert("Something went wrong while editing the email.");
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Flagged Emails</h1>

      {flaggedEmails.length > 0 ? (
        <ul className="space-y-4">
          {flaggedEmails.map((email, index) => (
            <li key={index} className="p-4 bg-gray-100 rounded-lg">
              <h3 className="text-lg font-bold">{email.title}</h3>
              <p className="text-sm text-gray-500">
                <strong>Date:</strong> {email.date}
              </p>
              <p>
                <strong>Risk Level:</strong> {email.riskLevel}
              </p>
              <p>
                <strong>Red Flags:</strong>
              </p>
              <ul className="list-disc pl-5">
                {email.redFlags.map((flag, i) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>

              {/* Edit Button */}
              <button
                onClick={() => handleEdit(index)}
                className="btn btn-warning mt-4 mr-2"
              >
                Edit
              </button>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(index)}
                className="btn btn-error mt-4"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No flagged emails saved yet.</p>
      )}

      <div className="mt-6">
        <Link href="/dashboard" className="btn btn-secondary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
