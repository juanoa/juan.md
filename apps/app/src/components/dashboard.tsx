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
      }>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={title} />
        <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

interface DashboardGridProps {
  children: ReactNode;
}

export function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
  );
}

interface DashboardCellProps {
  title: string;
  link: ReactNode;
  children: ReactNode;
}

export function DashboardCell({ title, link, children }: DashboardCellProps) {
  return (
    <section className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">{title}</h2>
        {link}
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  );
}
