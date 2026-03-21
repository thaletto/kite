import { headers } from "next/headers";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { SessionProvider } from "@/components/providers/session-provider";
import { Provider } from "@ai-sdk-tools/store";
import { Suspense } from "react";

async function SessionLoader({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <SessionProvider session={session ?? null}>
      {children}
    </SessionProvider>
  );
}

export default function ChatLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar variant="sidebar" />
        <SidebarInset>
          <Provider initialMessages={[]}>
            <SessionLoader>
              {children}
            </SessionLoader>
          </Provider>
        </SidebarInset>
      </SidebarProvider>
    </Suspense>
  );
}
