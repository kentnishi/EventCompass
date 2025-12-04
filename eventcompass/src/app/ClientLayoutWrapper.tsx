// src/app/ClientLayoutWrapper.tsx
"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import NavBar from "../components/NavBar";

const theme = createTheme();

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <ThemeProvider theme={theme}>
        <NavBar />
        <main className="main-container">{children}</main>
      </ThemeProvider>
    </SessionContextProvider>
  );
}
