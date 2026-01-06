import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Envelope Wall - Secret Valentine & Birthday Messages',
  description: 'Create a secret mailbox for your friends to leave messages that unlock on your special day!',
  openGraph: {
    title: 'Envelope Wall',
    description: 'Leave me a secret message! 🤫',
    images: ['/og-image.png'], // You can add a nice heart image in your public folder
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body  suppressHydrationWarning 
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
