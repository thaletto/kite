import { ChatConversation } from "@/components/chat/ChatConversation";
import { GithubIcon } from "@/components/icons/githubicon";
import { LogoIpsum } from "@/components/icons/logoipsum";
import { Panel, PanelHeader } from "@/components/layout/panels";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NewChatButton } from "@/components/chat/NewChatButton";
import { Suspense } from "react";

export default async function Page() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  return (
    <>
      <Panel className="flex flex-col items-center flex-1 h-screen max-h-screen overflow-hidden w-full min-h-0">
        <PanelHeader className="h-12 flex flex-row w-full justify-between bg-background">
          <div className="flex flex-row justify-between gap-2 font-semibold">
            <SidebarTrigger size="lg" className="block md:hidden" />
            <div className="hidden md:flex flex-row justify-center items-center gap-2 text-primary">
              <LogoIpsum />
              <span>OpenGPT</span>
            </div>
          </div>

          <div className="flex flex-row items-center gap-1">
            <NewChatButton />

            <Button
              type="button"
              variant="ghost"
              className="cursor-pointer"
              asChild
            >
              <Link
                href="https://www.github.com/thaletto/OpenGPT"
                about="Link to GitHub repository"
                target="_blank"
                aria-label="View the OpenGPT GitHub repository"
                title="OpenGPT GitHub"
              >
                <GithubIcon aria-hidden="true" />
                <span className="sr-only">GitHub</span>
              </Link>
            </Button>

            {!session?.session.token && (
              <Button type="button" variant="outline" asChild>
                <Link href="/login" aria-label="Login to your account">
                  <LogIn aria-hidden="true" />
                  <span className="hidden md:block">Login</span>
                </Link>
              </Button>
            )}
          </div>
        </PanelHeader>
        <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
          <ChatConversation />
        </Suspense>
      </Panel>
    </>
  );
}
