import { PrismaClient } from "@prisma/client";
import cohere from "@/utils/apiClient";
import { calculateFraudScore } from "@/utils/fraudScore";

const prisma = new PrismaClient();

async function analyzeJobListingWithCohereAI(text) {
  try {
    const prompt = `
You are an expert in identifying scams in job listings. Analyze the following job listing and provide a detailed assessment in this exact format:

1. Scam Likelihood: [Answer "Yes" or "No." Do not use "N/A." Briefly explain why, focusing on red flags like vague descriptions, unrealistic pay, unverifiable company information, or missing details.]
2. Keywords or Phrases: [List specific keywords or phrases that suggest the listing might be a scam. If none, respond with "None."]
3. Detailed Analysis: [Provide a clear and detailed explanation. Highlight specific red flags, patterns, or missing details that make the job listing suspicious. Avoid vague descriptions or redundant information.]

If a section does not apply, respond explicitly with "None." Do NOT leave any section blank or use "N/A." Always provide a definitive answer for Scam Likelihood.

Job listing to analyze: "${text}"
`;

    console.log("Sending refined prompt to Cohere AI:", prompt);

    const response = await cohere.chat({
      model: "command-r",
      messages: [{ role: "user", content: prompt }],
    });

    console.log("Cohere AI Raw Response:", JSON.stringify(response, null, 2));

    const responseContent = response?.message?.content;
    if (!Array.isArray(responseContent) || responseContent.length === 0) {
      throw new Error("Invalid response format from Cohere AI.");
    }

    const responseText = responseContent[0]?.text || "No response generated.";

    const scamLikelihoodMatch = responseText.match(
      /1\.\s*Scam Likelihood:\s*(.+?)(?=\n|$)/i
    );
    const scamLikelihood = scamLikelihoodMatch?.[1]?.trim() || "Not Determined";

    const keywordsMatch = responseText.match(
      /2\.\s*Keywords or Phrases:\s*(.+?)(?=\n|$)/i
    );
    const suspiciousKeywords =
      keywordsMatch?.[1]?.trim() !== "None"
        ? keywordsMatch[1].split(",").map((k) => k.trim())
        : [];

    const detailedAnalysisMatch = responseText.match(
      /3\.\s*Detailed Analysis:\s*(.+)/i
    );
    const detailedAnalysis =
      detailedAnalysisMatch?.[1]?.trim() || "No detailed analysis provided.";

    // Fraud Score Calculation
    const factors = {
      suspiciousKeywords,
      domainValidity: "Unknown", // Add domain logic if applicable
      jobDescriptionIssues: detailedAnalysis.includes("vague"), // Example factor
    };

    const fraudScore = calculateFraudScore(factors);

    return {
      scamLikelihood,
      suspiciousKeywords,
      detailedAnalysis,
      fraudScore,
      factors,
    };
  } catch (error) {
    console.error("Error during Cohere AI analysis:", error.message);
    return {
      scamLikelihood: "Unknown",
      suspiciousKeywords: [],
      detailedAnalysis: "Failed to perform detailed analysis.",
      fraudScore: "N/A",
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Job listing text is required." });
  }

  try {
    let dailyLimit = 1; // Default for non-signed-up users
    let scanCount = 0;

    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      dailyLimit = user.tier === "paid" ? 30 : 3; // Paid or Free Tier
      scanCount = user.jobListingScanCount;

      const now = new Date();
      if (now > new Date(user.resetAt)) {
        scanCount = 0;
        await prisma.user.update({
          where: { id: userId },
          data: {
            jobListingScanCount: 0,
            resetAt: new Date(now.setUTCHours(24, 0, 0, 0)),
          },
        });
      }
    }

    if (scanCount >= dailyLimit) {
      return res.status(403).json({
        error: `You have reached your daily limit of ${dailyLimit} scans.`,
      });
    }

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { jobListingScanCount: scanCount + 1 },
      });
    }

    const result = await analyzeJobListingWithCohereAI(text);

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Error in /api/analyze-job-listing:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
}
