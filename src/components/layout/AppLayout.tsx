"use client";

import { useUserStore } from "@/store/useUserStore";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUserStore();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className={`flex-1 flex flex-col transition-all duration-300 ${isAuthenticated ? "md:pl-64" : ""}`}>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
