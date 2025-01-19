// generateSignature.js
const crypto = require("crypto");

function generateSvixSignature(secret, payload, timestamp) {
  const payloadToSign = `${timestamp}.${payload}`;
  const hmac = crypto.createHmac("sha256", Buffer.from(secret, "base64"));
  hmac.update(payloadToSign);
  return hmac.digest("base64");
}

module.exports = { generateSvixSignature };

