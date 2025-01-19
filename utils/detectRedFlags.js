const detectRedFlags = (emailContent, tier) => {
  const redFlags = [];

  // Rule 1: Check for suspicious keywords
  const suspiciousKeywords = ["urgent", "wire transfer", "work from home"];
  suspiciousKeywords.forEach((keyword) => {
    if (emailContent.toLowerCase().includes(keyword)) {
      redFlags.push(`Contains suspicious keyword: "${keyword}"`);
    }
  });

  // Rule 2: Check for suspicious domains
  const freeEmailDomains = ["gmail.com", "yahoo.com", "hotmail.com"];
  const emailDomainMatch = emailContent.match(/@([\w.-]+)/);
  if (emailDomainMatch && freeEmailDomains.includes(emailDomainMatch[1])) {
    redFlags.push(`Uses a free email domain: "${emailDomainMatch[1]}"`);
  }

  // Rule 3: Check for grammatical errors (basic)
  const commonGrammarErrors = ["your hired", "their job", "its a offer"];
  commonGrammarErrors.forEach((phrase) => {
    if (emailContent.toLowerCase().includes(phrase)) {
      redFlags.push(`Possible grammatical error: "${phrase}"`);
    }
  });

  // Rule 4: Check for mismatched sender info
  if (emailContent.includes("Reply-To") && !emailContent.includes("From")) {
    redFlags.push(`Sender and reply-to information mismatch.`);
  }

  // Paid Tier: Additional rules
  if (tier === "paid") {
    // Rule 5: Detect suspicious links
    const suspiciousLinkRegex = /http[s]?:\/\/[^\s]+/g;
    const links = emailContent.match(suspiciousLinkRegex);
    if (links) {
      links.forEach((link) => {
        redFlags.push(`Suspicious link detected: ${link}`);
      });
    }

    // Rule 6: Detect risky attachments
    const riskyAttachments = [".exe", ".zip", ".js"];
    riskyAttachments.forEach((ext) => {
      if (emailContent.toLowerCase().includes(ext)) {
        redFlags.push("Email contains potentially risky attachment types.");
      }
    });
  }

  // Calculate Risk Level
  const riskLevel =
    redFlags.length >= 4
      ? "High"
      : redFlags.length >= 3
      ? "Medium"
      : redFlags.length > 0
      ? "Low"
      : "None";

  return { redFlags, riskLevel };
};

export default detectRedFlags;
