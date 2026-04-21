"use client";

import { useUserStore } from "@/store/useUserStore";
import { LayoutDashboard, GitBranch, Settings, FileText, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Repositories", href: "/repositories", icon: GitBranch },
  { name: "Analysis Reports", href: "/history", icon: FileText },
  { name: "Public", href: "/public", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const { isAuthenticated } = useUserStore();
  const pathname = usePathname();

  if (!isAuthenticated) return null;

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background hidden md:block">
      <div className="h-full px-3 py-4 overflow-y-auto">
        <ul className="space-y-2 font-medium">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center p-2 rounded-lg hover:bg-accent transition-colors group ${
                  pathname === item.href ? "bg-accent text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon
                  size={20}
                  className={`transition duration-75 group-hover:text-primary ${
                    pathname === item.href ? "text-primary" : ""
                  }`}
                />
                <span className="ms-3">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
