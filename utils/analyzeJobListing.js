import cohere from "@/utils/apiClient";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function analyzeJobListingWithCohereAI(text) {
  try {
    const prompt = `
You are an expert at analyzing job listings for potential scams. Analyze the following job listing and answer the following questions:
1. Is the job listing likely a scam? Why or why not?
2. List any keywords or phrases that indicate it might be a scam.
3. Provide a detailed explanation for your analysis.

Job listing to analyze: "${text}"
`;

    console.log("Sending prompt to Cohere AI:", prompt);

    const response = await cohere.chat({
      model: "command-r-plus",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    console.log("Cohere AI Raw Response:", JSON.stringify(response, null, 2));

    const responseText =
      response?.message?.content[0]?.text || "No response generated.";

    // Parse risky patterns (example: extract keywords from the text if necessary)
    const riskyPatterns = [];
    if (
      responseText.includes("no experience required") ||
      responseText.includes("unrealistic pay")
    ) {
      riskyPatterns.push("no experience required", "unrealistic pay");
    }

    return {
      isScam: riskyPatterns.length > 0,
      riskyPatterns,
      message: responseText,
    };
  } catch (error) {
    console.error("Error during Cohere AI analysis:", error.message);
    return {
      isScam: false,
      riskyPatterns: [],
      message: "Failed to perform AI analysis. Please try again later.",
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
    let dailyLimit = 3; // Default for no sign-up
    let scanCount = 0;

    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ error: "User not found." });

      dailyLimit = user.tier === "free" ? 5 : 30;
      scanCount = user.scanCount;

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

    const result = await analyzeJobListingWithCohereAI(text);

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Error in /api/analyze-job-listing:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
}
