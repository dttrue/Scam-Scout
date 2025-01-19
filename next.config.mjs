/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    COHERE_API_KEY: process.env.COHERE_API_KEY,
    SIGNING_SECRET: process.env.SIGNING_SECRET,
  },
};

export default nextConfig;

