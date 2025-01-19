import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    // Fetch a specific user by ID
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch user" });
    }
  }

  if (req.method === "PUT") {
    // Update a specific user by ID
    const { email, tier } = req.body;

    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { email, tier },
      });
      return res
        .status(200)
        .json({ message: "User updated successfully!", user: updatedUser });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to update user" });
    }
  }

  if (req.method === "DELETE") {
    // Delete a specific user by ID
    try {
      await prisma.user.delete({ where: { id } });
      return res.status(200).json({ message: "User deleted successfully!" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to delete user" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
