"use client";

import { useUserStore } from "@/store/useUserStore";
import { Moon, Sun, GitBranch } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useUserStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Git-Mate
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md hover:bg-accent transition-colors"
            title="Toggle theme"
          >
            {mounted && (theme === "dark" ? <Sun size={20} /> : <Moon size={20} />)}
            {!mounted && <div className="w-5 h-5" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium hidden sm:inline-block">
                {user?.username}
              </span>
              <button
                onClick={logout}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/github`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium"
            >
              <GitBranch size={18} />
              <span>Login with GitHub</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
