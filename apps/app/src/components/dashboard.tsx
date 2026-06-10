import type { CSSProperties, ReactNode } from "react";

import { SidebarInset, SidebarProvider } from "@juan/ui/components/ui/sidebar";

import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";

interface DashboardProps {
  title: string;
  children: ReactNode;
}

export function Dashboard({ title, children }: DashboardProps) {
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
        <SiteHeader title={title} />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
