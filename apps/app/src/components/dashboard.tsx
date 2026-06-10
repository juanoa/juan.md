import type { CSSProperties } from "react";

import { AppSidebar } from "@juan/ui/components/app-sidebar";
import { ChartAreaInteractive } from "@juan/ui/components/chart-area-interactive";
import { DataTable } from "@juan/ui/components/data-table";
import { SectionCards } from "@juan/ui/components/section-cards";
import { SiteHeader } from "@juan/ui/components/site-header";
import { SidebarInset, SidebarProvider } from "@juan/ui/components/ui/sidebar";

import { dashboardData } from "./dashboard-data";

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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={dashboardData} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
