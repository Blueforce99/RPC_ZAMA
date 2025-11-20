import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Encrypted RPS Tournament",
  description: "Play Rock-Paper-Scissors with encrypted moves on Zama FHEVM",
  openGraph: {
    title: "Encrypted RPS Tournament",
    description: "Play privately. Win publicly.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
