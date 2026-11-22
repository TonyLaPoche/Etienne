"use client";

import { useEffect } from "react";
import { basePath } from "@/lib/base-path";

export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(`${basePath}/sw.js`).catch(() => undefined);
  }, []);
  return null;
}
