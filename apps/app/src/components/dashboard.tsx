import type { CSSProperties } from "react";

import { SidebarInset, SidebarProvider } from "@juan/ui/components/ui/sidebar";

import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";

export function Dashboard() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
      </SidebarInset>
    </SidebarProvider>
  );
}
