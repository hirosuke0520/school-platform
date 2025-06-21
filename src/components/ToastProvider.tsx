"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#363636",
          color: "#fff",
          minWidth: "320px",
          width: "fit-content",
          whiteSpace: "nowrap",
        },
        success: {
          duration: 3000,
          style: {
            background: "#10b981",
            whiteSpace: "nowrap",
          },
        },
        error: {
          duration: 5000,
          style: {
            background: "#ef4444",
            whiteSpace: "nowrap",
          },
        },
      }}
    />
  );
}
