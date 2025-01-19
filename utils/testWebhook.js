const { generateSvixSignature } = require("./generateSignature.js");

const SIGNING_SECRET = "whsec_2ZtxfDXhaWBRwGROg+wSrwcwQuDLCQ11"; // Replace with your Clerk signing secret
const payload = JSON.stringify({
  type: "user.created",
  data: {
    id: "user_123",
    email_addresses: [{ email_address: "test@example.com" }],
    first_name: "John",
    last_name: "Doe",
  },
});
const timestamp = Math.floor(Date.now() / 1000); // Current timestamp

const signature = generateSvixSignature(SIGNING_SECRET, payload, timestamp);

console.log("Generated Headers:");
console.log("svix-id:", "msg_generated_id");
console.log("svix-timestamp:", timestamp);
console.log("svix-signature:", `v1,${signature}`);
