// src/app/ClientProviders.tsx  (*반드시 첫 줄에*)
"use client";

import { ReactNode } from "react";
import RecoilRootProvider from "./recoilRootProvider";
import { AuthProvider } from "@/context/AuthContext";
import { SWRConfig } from "swr";
import { fetcher } from "@/utils/fetcher";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher, // 전역 기본 fetcher
        shouldRetryOnError: false,
        revalidateOnFocus: false, // 필요 시 조정
      }}
    >
      <RecoilRootProvider>
        <AuthProvider>{children}</AuthProvider>
      </RecoilRootProvider>
    </SWRConfig>
  );
}
