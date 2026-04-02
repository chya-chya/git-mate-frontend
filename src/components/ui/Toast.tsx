"use client";

import { useState, createContext, useContext, useRef } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

const ToastContext = createContext<{
  addToast: (message: string, type: Toast["type"]) => void;
} | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idCounter = useRef(0);

  const addToast = (message: string, type: Toast["type"]) => {
    const id = ++idCounter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg animate-in slide-in-from-right-full duration-300 ${
              toast.type === "success" 
                ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-500" 
                : toast.type === "error"
                ? "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-500"
                : "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-500"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <p className="text-sm font-medium">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="ml-2 hover:opacity-70">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
