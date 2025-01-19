// components/EducationPage.jsx
"use client";

import Link from "next/link";
import scamData from "@/data/scamData.json"; 

export default function EducationPage() {
  const { tips, examples, checklist } = scamData; // Destructure data from imported JSON

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Educational Resources</h1>

      {/* Tips Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Tips & Tricks</h2>
        <ul className="list-disc pl-5 space-y-2">
          {tips.map((tip, index) => (
            <li key={index} className="text-gray-700">
              {tip}
            </li>
          ))}
        </ul>
      </section>

      {/* Examples Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Real-World Scam Examples
        </h2>
        {examples.map((example, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-100 rounded">
            <h3 className="font-bold text-lg">{example.title}</h3>
            <p className="text-gray-600">{example.content}</p>
          </div>
        ))}
      </section>

      {/* Checklist Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          How to Spot Job Scams Checklist
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          {checklist.map((item, index) => (
            <li key={index} className="text-gray-700">
              <label>
                <input type="checkbox" className="mr-2" />
                {item}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8">
        <Link href="/dashboard" className="btn btn-secondary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
