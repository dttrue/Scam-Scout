import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    console.log("GET method triggered");

    try {
      const users = await prisma.user.findMany();
      console.log("Fetched users:", users);

      return res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error.message, error);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  if (req.method === "POST") {
    const signature = req.headers["clerk-signature"];
    const rawBody = JSON.stringify(req.body);

    // Verify Clerk signature
    const hash = crypto
      .createHmac("sha256", process.env.CLERK_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("base64");

    if (hash !== signature) {
      return res.status(401).send("Invalid signature.");
    }

    const { id, email_addresses, first_name, last_name, profile_image_url } =
      req.body;

    try {
      // Update Clerk metadata
      await fetch(`https://api.clerk.dev/v1/users/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.CLERK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_metadata: {
            tier: "basic", // Default tier for all new users
          },
        }),
      });

      // Save the user to your database
      const email = email_addresses[0]?.email_address || null;

      if (!email) {
        console.error("Email is missing in Clerk webhook payload.");
        return res.status(400).send("Email is required.");
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        console.log("User already exists in database:", existingUser);
        return res.status(200).send("User already exists in the database.");
      }

      const newUser = await prisma.user.create({
        data: {
          id, // Clerk user ID
          email,
          name: `${first_name || ""} ${last_name || ""}`.trim(),
          image: profile_image_url || null,
          tier: "basic", // Default tier
        },
      });

      console.log("User created in database:", newUser);
      return res.status(201).send("User created successfully in the database.");
    } catch (error) {
      console.error("Error in webhook handler:", error.message);
      return res.status(500).send("Failed to handle webhook.");
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
