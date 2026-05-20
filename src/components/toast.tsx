"use client";

import { useEffect } from "react";

export type ToastState = { message: string; type: "success" | "error" };

export function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium ${
        toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      <span>{toast.message}</span>
      <button onClick={onDismiss} className="opacity-75 hover:opacity-100 ml-1 text-base leading-none">
        ×
      </button>
    </div>
  );
}
