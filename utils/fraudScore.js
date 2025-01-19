export function calculateFraudScore(factors) {
  console.log("Fraud Score Factors:", factors);  
  let score = 0;

  // Keywords factor (35%)
  if (factors.suspiciousKeywords?.length > 0) {
    score += 35;
  }

  // Domain validity (25%)
  if (factors.domainValidity === "Invalid") {
    score += 25;
  }

  // Urgency factor (20%)
  if (factors.urgency) {
    score += 20;
  }

  // Formatting issues (20%)
  if (factors.formattingIssues) {
    score += 20;
  }

  return Math.min(score, 100); // Cap the score at 100
}
