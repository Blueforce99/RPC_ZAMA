/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  env: {
    NEXT_PUBLIC_RPS_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_RPS_CONTRACT_ADDRESS || "",
    NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS || "",
    NEXT_PUBLIC_NETWORK_ID: process.env.NEXT_PUBLIC_NETWORK_ID || "84532", // FHEVM Testnet
  },
};

module.exports = nextConfig;
