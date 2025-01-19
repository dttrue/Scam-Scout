import { calculateFraudScore } from "@/utils/fraudScore";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { factors, userId } = req.body;

  if (!factors) {
    return res.status(400).json({ error: "Factors are required." });
  }

  try {
    // Calculate fraud score
    const score = calculateFraudScore(factors);

    // Optional: Track scan count for free-tier users
    if (userId) {
      // Implement user-specific scan count tracking here
    }

    res.status(200).json({ score });
  } catch (error) {
    console.error("Error calculating fraud score:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}
