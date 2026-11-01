"use client";

import { createContext, useContext } from "react";
import type { Settings } from "@/lib/types";

export const SettingsCtx = createContext<Settings | null>(null);
export function useSettings() {
  const s = useContext(SettingsCtx);
  if (!s) throw new Error("SettingsCtx missing");
  return s;
}
