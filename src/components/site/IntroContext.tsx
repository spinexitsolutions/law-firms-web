"use client";

import { createContext, useContext } from "react";

export const IntroCtx = createContext<{ done: boolean }>({ done: true });
export const useIntro = () => useContext(IntroCtx);
