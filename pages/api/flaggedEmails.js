import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "flaggedEmails.json");

export default function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Read flagged emails from file
      const data = fs.readFileSync(filePath, "utf8");
      const flaggedEmails = JSON.parse(data);
      res.status(200).json(flaggedEmails);
    } catch (err) {
      console.error("Error reading flagged emails:", err);
      res.status(500).json({ error: "Failed to read flagged emails" });
    }
  } else if (req.method === "POST") {
    try {
      console.log("Received POST request body:", req.body);

      // Add a new flagged email
      const newEmail = req.body;
      const data = fs.readFileSync(filePath, "utf8");
      const flaggedEmails = JSON.parse(data);

      flaggedEmails.push(newEmail);

      fs.writeFileSync(filePath, JSON.stringify(flaggedEmails, null, 2));
      console.log("New flagged email saved:", newEmail);

      res.status(200).json({ message: "Flagged email saved successfully" });
    } catch (err) {
      console.error("Error in POST request:", err);
      res.status(500).json({ error: "Failed to save flagged email" });
    }
  } else if (req.method === "DELETE") {
    try {
      const indexToDelete = parseInt(req.query.index, 10); // Parse index from query
      if (isNaN(indexToDelete)) {
        res.status(400).json({ error: "Invalid index" });
        return;
      }

      const data = fs.readFileSync(filePath, "utf8");
      const flaggedEmails = JSON.parse(data);

      if (indexToDelete < 0 || indexToDelete >= flaggedEmails.length) {
        res.status(400).json({ error: "Index out of range" });
        return;
      }

      flaggedEmails.splice(indexToDelete, 1); // Remove the email at the given index

      fs.writeFileSync(filePath, JSON.stringify(flaggedEmails, null, 2));
      res.status(200).json({ message: "Email deleted successfully" });
    } catch (err) {
      console.error("Error deleting email:", err);
      res.status(500).json({ error: "Failed to delete flagged email" });
    }
} else if (req.method === "PUT") {
    // Handle PUT requests for updating flagged emails
    try {
      const indexToUpdate = parseInt(req.query.index, 10); // Parse index from query
      if (isNaN(indexToUpdate)) {
        res.status(400).json({ error: "Invalid index" });
        return;
      }

      const data = fs.readFileSync(filePath, "utf8");
      const flaggedEmails = JSON.parse(data);

      if (indexToUpdate < 0 || indexToUpdate >= flaggedEmails.length) {
        res.status(400).json({ error: "Index out of range" });
        return;
      }

      const updatedEmail = req.body; // Updated email data
      flaggedEmails[indexToUpdate] = updatedEmail; // Replace the email at the given index

      fs.writeFileSync(filePath, JSON.stringify(flaggedEmails, null, 2));
      res.status(200).json({ message: "Email updated successfully" });
    } catch (err) {
      console.error("Error updating email:", err);
      res.status(500).json({ error: "Failed to update flagged email" });
    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
