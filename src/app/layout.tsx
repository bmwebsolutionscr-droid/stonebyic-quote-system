import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stone Landscaping Quotes",
  description: "Manage materials and generate quotes for stone landscaping projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <nav style={{ background: 'white', borderBottom: '1px solid #eef2f7' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <a href="/" style={{ fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>Stone Quotes</a>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="/materials" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Materials</a>
              <a href="/quotes/new" style={{ color: 'var(--muted)', textDecoration: 'none' }}>New Quote</a>
            </div>
          </div>
        </nav>
        <main>
          <div className="container" style={{ paddingTop: 28, paddingBottom: 48 }}>
            {children}
          </div>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
