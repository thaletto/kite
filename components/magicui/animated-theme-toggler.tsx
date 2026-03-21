"use client";

import { Moon, SunDim } from "lucide-react";
import { useRef } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useIsMounted } from "@/hooks/use-mounted";

type props = {
  className?: string;
};

export const AnimatedThemeToggler = ({ className }: props) => {
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const changeTheme = async () => {
    if (!buttonRef.current) return;

    const newTheme = theme === "dark" ? "light" : "dark";

    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
      });
    }).ready;

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const y = top + height / 2;
    const x = left + width / 2;

    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRad}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  };
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Toggle theme"
          ref={buttonRef}
          onClick={changeTheme}
          className={cn(className)}
        >
          {mounted && (theme === "dark" ? <SunDim /> : <Moon />)}
          {mounted && <span>Toggle Theme</span>}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
};
