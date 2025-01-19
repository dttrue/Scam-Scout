import cohere from "@/utils/apiClient";
import { PrismaClient } from "@prisma/client";
import { calculateFraudScore } from "@/utils/fraudScore"; // For rule-based scoring (Free Tier)

const prisma = new PrismaClient();

async function analyzeWithCohereAI(text, email, useAIForFraudScore = false) {
  try {
    const prompt = `
    You are an expert in identifying email scams. Analyze the following email and provide a detailed assessment in this exact format:

    1. Scam Likelihood: [Answer "Yes" or "No." Do not use "N/A." Briefly explain why, focusing on red flags such as suspicious sender information, urgency, vague or generic content, requests for personal information, financial offers, unexpected attachments, or links.]
    2. Keywords or Phrases: [List specific keywords or phrases that suggest the email might be a scam. If none, respond with "None."]
    3. Detailed Analysis: [Provide a clear and detailed explanation. Highlight specific red flags, patterns, or suspicious elements that make the email questionable. Avoid vague descriptions or redundant information. Specifically analyze the sender's credibility, email formatting, grammar, and the purpose of the email. Mention if the email content creates undue urgency, has financial bait, or uses deceptive tactics.]
    4. Recommended Action: [Provide actionable advice for the user, such as "Do not click on any links," "Verify the sender's email address," or "Mark this email as spam."]

    If a section does not apply, respond explicitly with "None." Do NOT leave any section blank. Always provide a definitive answer for Scam Likelihood.

    Email to analyze: "${text}"
    `;

    console.log("Sending prompt to Cohere AI:", prompt);

    const response = await cohere.chat({
      model: "command-r",
      messages: [{ role: "user", content: prompt }],
    });

    console.log("Cohere AI Raw Response:", JSON.stringify(response, null, 2));

    const responseText =
      response?.message?.content[0]?.text || "No response generated.";

    // Parse AI response for analysis
    const scamLikelihood = responseText
      .match(/1\.\s*Scam Likelihood:\s*(.+?)(?=\n|$)/i)?.[1]
      ?.trim();
    const keywords =
      responseText
        .match(/2\.\s*Keywords or Phrases:\s*(.+?)(?=\n|$)/i)?.[1]
        ?.trim() || "None";
    const detailedAnalysis =
      responseText.match(/3\.\s*Detailed Analysis:\s*(.+)/i)?.[1]?.trim() ||
      "None";

    const analysisResult = {
      scamLikelihood: scamLikelihood || "Not Determined",
      suspiciousKeywords:
        keywords === "None" ? [] : keywords.split(",").map((k) => k.trim()),
      detailedAnalysis,
    };

    // Extract factors for fraud score calculation
    const factors = {
      suspiciousKeywords:
        text.match(/\b(urgent|loan|money|click here)\b/gi) || [],
      domainValidity: email.match(/@.+\.(xyz|info|biz|click)$/)
        ? "Invalid"
        : "Valid",
      senderDomain: email,
      urgency: /ACT FAST|URGENTLY/i.test(text),
      formattingIssues: /[A-Z]{4,}|!{2,}/.test(text),
    };

    // Calculate fraud score
    let fraudScore;
    if (useAIForFraudScore) {
      const scorePrompt = `
      Based on the analysis below, assign a fraud score between 0 and 100, with 0 being completely safe and 100 being highly risky.
      Analysis: ${responseText}
      Provide your score only, without any additional text.
      `;
      const scoreResponse = await cohere.chat({
        model: "command-r",
        messages: [{ role: "user", content: scorePrompt }],
      });
      fraudScore =
        parseInt(scoreResponse.message?.content[0]?.text, 10) || "N/A";
    } else {
      fraudScore = calculateFraudScore(factors);
    }

    return { ...analysisResult, fraudScore, factors };
  } catch (error) {
    console.error("Error during Cohere AI analysis:", error.message);
    return {
      scamLikelihood: "Unknown",
      suspiciousKeywords: [],
      detailedAnalysis: "Failed to perform analysis.",
      fraudScore: "N/A",
      factors: {},
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, text, email } = req.body;

  if (!text || !email) {
    return res
      .status(400)
      .json({ error: "Email text and sender email are required." });
  }

  try {
    let dailyLimit = 3; // Default for non-signed-up users
    let scanCount = 0;
    let useAIForFraudScore = false;

    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ error: "User not found." });

      dailyLimit = user.tier === "paid" ? 30 : 5;
      scanCount = user.scanCount;
      useAIForFraudScore = user.tier === "paid";

      const now = new Date();
      if (now > new Date(user.resetAt)) {
        scanCount = 0;
        await prisma.user.update({
          where: { id: userId },
          data: {
            scanCount: 0,
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
        data: { scanCount: scanCount + 1 },
      });
    }

    const result = await analyzeWithCohereAI(text, email, useAIForFraudScore);

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Error in /api/analyze-email:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
}
