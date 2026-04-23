'use client'

import { Provider } from "@/components/ui/provider";
import { AuthProvider } from "@/components/AuthProvider";
import { RepositoryProvider } from "@/components/RepositoryProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <AuthProvider>
        <RepositoryProvider>{children}</RepositoryProvider>
      </AuthProvider>
    </Provider>
  );
}
