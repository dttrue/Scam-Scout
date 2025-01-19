import { PrismaClient } from "@prisma/client";
import cohere from "@/utils/apiClient";
import { calculateFraudScore } from "@/utils/fraudScore"; // Import the reusable fraud score utility

const prisma = new PrismaClient();

async function verifyAddressAndDomainWithCohereAI(address, domain) {
  try {
    const prompt = `
You are an expert in validating US based and international addresses and domains for legitimacy. Analyze the following inputs and provide a detailed assessment in this exact format:

1. Address Validity: [Answer "Valid," "Incomplete," or "Invalid." Briefly explain why, focusing on formatting issues, fake patterns, or missing details. Avoid penalizing realistic details.]
2. Domain Status: [Answer "Domain exists," "Unavailable," or "Invalid input." Briefly explain why.]
3. Detailed Analysis: [Provide specific red flags or patterns for both the address and domain separately. Mention any unusual formatting, suspicious details, or signs of legitimacy.]

Address to analyze: "${address}"
Domain to analyze: "${domain || "None provided"}"`;

    console.log("Sending refined prompt to Cohere AI:", prompt);

    const response = await cohere.chat({
      model: "command-r",
      messages: [{ role: "user", content: prompt }],
    });

    const responseText =
      response?.message?.content[0]?.text || "No response generated.";

    const addressValidityMatch = responseText.match(
      /1\.\s*Address Validity:\s*(.+?)(?=\n|$)/i
    );
    const domainStatusMatch = responseText.match(
      /2\.\s*Domain Status:\s*(.+?)(?=\n|$)/i
    );
    const detailedAnalysisMatch = responseText.match(
      /3\.\s*Detailed Analysis:\s*(.+)/i
    );

    const addressValidity =
      addressValidityMatch?.[1]?.trim() || "Unable to determine.";
    const domainStatus = domainStatusMatch?.[1]?.trim() || "None provided.";
    const detailedAnalysis =
      detailedAnalysisMatch?.[1]?.trim() || "No detailed analysis provided.";

    // Calculate fraud score based on analysis results
    const fraudScore = calculateFraudScore({
      suspiciousKeywords: [],
      domainValidity: domainStatus.includes("Invalid") ? "Invalid" : "Valid",
      addressFormat: addressValidity.includes("Invalid") ? "Invalid" : "Valid",
    });

    return {
      addressValidity,
      domainStatus,
      detailedAnalysis,
      fraudScore,
      message: responseText,
    };
  } catch (error) {
    console.error("Error during Cohere AI analysis:", error.message);
    return {
      addressValidity: "Unable to validate address.",
      domainStatus: "Unable to check domain.",
      detailedAnalysis: "Failed to perform detailed analysis.",
      fraudScore: "N/A",
      message: "Failed to perform AI analysis. Please try again later.",
    };
  }
}


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, address, domain } = req.body;

  if (!address) {
    return res.status(400).json({ error: "Address is required." });
  }

  try {
    let dailyLimit = 1; // Default for non-signed-up users
    let scanCount = 0;

    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ error: "User not found." });

      dailyLimit = user.tier === "paid" ? 30 : 3;
      scanCount = user.addressScanCount;

      const now = new Date();
      if (now > new Date(user.resetAt)) {
        scanCount = 0;
        await prisma.user.update({
          where: { id: userId },
          data: {
            addressScanCount: 0,
            resetAt: new Date(now.setUTCHours(24, 0, 0, 0)),
          },
        });
      }
    }

    // Check if the user has exceeded the daily limit
    if (scanCount >= dailyLimit) {
      return res.status(403).json({
        error: `You have reached your daily limit of ${dailyLimit} scans.`,
      });
    }

    // Increment scan count reliably
   if (userId) {
     await prisma.user.update({
       where: { id: userId },
       data: { addressScanCount: { increment: 1 } }, // Increment the scan count
     });
   } else {
     // For non-signed-up users, store scan data locally (or fallback to another method)
     // Example: Local storage-based tracking for unsigned users
     if (!global.scanData) {
       global.scanData = {};
     }

     if (!global.scanData[address]) {
       global.scanData[address] = 0;
     }

     global.scanData[address] += 1;
   }


    const result = await verifyAddressAndDomainWithCohereAI(address, domain);

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Error in /api/verify-address-domain:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
}
