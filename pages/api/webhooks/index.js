import { Webhook } from "svix";
import getRawBody from "raw-body";
import crypto from "crypto"; // Ensure you import crypto for manual signature debugging

export const config = {
  api: {
    bodyParser: false, // Disable default body parser
  },
};

export default async function handler(req, res) {
  console.log("Incoming webhook request...");

  const SIGNING_SECRET = process.env.SIGNING_SECRET;
  console.log("SIGNING_SECRET loaded:", SIGNING_SECRET ? "YES" : "NO");

  if (!SIGNING_SECRET) {
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawBody = await getRawBody(req);
    console.log("Raw body received:", rawBody.toString());

    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];
    console.log("Headers:", { svix_id, svix_timestamp, svix_signature });

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Missing required headers for signature verification.");
      return res.status(400).json({ error: "Missing required headers" });
    }

    const wh = new Webhook(SIGNING_SECRET);

    // Debug: Log the expected signature for manual verification
    const payloadToSign = `${svix_timestamp}.${rawBody.toString()}`;
    const hmac = crypto.createHmac(
      "sha256",
      Buffer.from(SIGNING_SECRET, "base64")
    );
    hmac.update(payloadToSign);
    const expectedSignature = `v1,${hmac.digest("base64")}`;
    console.log("Expected signature:", expectedSignature);

    // Verify webhook signature
    const evt = wh.verify(rawBody.toString(), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });

    console.log("Webhook verified successfully:", evt);

    // Handle specific events
    if (evt.type === "user.created") {
      console.log("Processing user.created event:", evt.data);
      return res.status(200).json({ message: "User created event processed" });
    }

    console.warn("Unhandled event type:", evt.type);
    return res.status(400).json({ error: "Unhandled event type" });
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    console.error("Detailed error:", err);
    return res.status(401).json({ error: "Invalid signature" });
  }
}
