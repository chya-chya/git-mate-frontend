"use client";

import { GitBranch, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background/50 backdrop-blur-sm py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Branding Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Git-Mate
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            LLM 기반의 정밀한 GitHub 소통 및 성능 분석 도구입니다. 
            당신의 개발 여정을 데이터로 증명하세요.
          </p>
        </div>

        {/* Links Section */}
        <div className="space-y-4">
          <h4 className="font-semibold">Resources</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="https://github.com/chasuyeon" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                <GitBranch size={14} /> GitHub Repository
              </a>
            </li>
          </ul>
        </div>

        {/* Developer Info Section */}
        <div className="space-y-4">
          <h4 className="font-semibold">Developer</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2 font-medium text-foreground">
              © 2026 chaya-chaya
            </p>
            <p className="flex items-center gap-2">
              <Mail size={14} /> cktndus32@naver.com
            </p>
            <p className="text-xs pt-2 text-muted-foreground/60">
              Built with Next.js, Tailwind CSS & Recharts
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t text-center text-xs text-muted-foreground/50">
        <p>© 2026 Git-Mate. All rights reserved by chasuyeon.</p>
      </div>
    </footer>
  );
}
