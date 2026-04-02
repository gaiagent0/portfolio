import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI & IT Services | Modern Solutions for Individuals & SMBs",
  description: "We help individuals and SMBs implement cutting-edge AI and IT solutions. Custom development, automation, cybersecurity, and more.",
  keywords: ["AI services", "IT solutions", "automation", "cybersecurity", "custom development", "SMB IT"],
  authors: [{ name: "AI & IT Services" }],
  openGraph: {
    title: "AI & IT Services | Modern Solutions for Individuals & SMBs",
    description: "Cutting-edge AI and IT solutions made simple and accessible.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#0b0f1a] text-[#e2e8f0]">{children}</body>
    </html>
  );
}