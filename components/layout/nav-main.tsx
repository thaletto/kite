"use client";
import { Plus, Search } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { AnimatedThemeToggler } from "../magicui/animated-theme-toggler";

export function NavMain() {
  return (
    <>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="New Chat"
              onClick={() => {
                window.dispatchEvent(new Event("new-chat"));
              }}
            >
              <Plus /> <span>New Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Search" onClick={() => {}}>
              <Search /> <span>Search</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <AnimatedThemeToggler />
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
