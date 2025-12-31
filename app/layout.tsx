import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import TenantSwitcher from "@/components/TenantSwitcher";

export const metadata: Metadata = {
  title: "ZeroBitOne Dashboard",
  description: "Multi-tenant dashboard for project management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <h1 className="text-2xl font-bold text-gray-900">ZeroBitOne</h1>
                <TenantSwitcher />
              </div>
            </div>
          </header>
          <div className="flex">
            <Navigation />
            <main className="flex-1 p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
