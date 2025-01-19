// apiClient.js
import { CohereClientV2 } from "cohere-ai";

// Check if the API key is set
if (!process.env.COHERE_API_KEY) {
  console.error(
    "Cohere API Key is missing! Please set COHERE_API_KEY in your environment variables."
  );
  throw new Error("COHERE_API_KEY is not set.");
}

// Initialize Cohere
const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY,
});

export default cohere;



