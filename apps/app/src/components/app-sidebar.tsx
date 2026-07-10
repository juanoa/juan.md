import {
  BarbellIcon,
  CommandIcon,
  CurrencyDollarIcon,
  GearIcon,
  ListChecksIcon,
  SquaresFourIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@juan/ui/components/ui/sidebar";

import { useAuthContext } from "./auth/AuthContext";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { NavSports } from "./nav-sports";

const data = {
  navMain: [
    {
      title: "Dashboard",
      to: "/",
      icon: <SquaresFourIcon />,
    },
    {
      title: "To-dos",
      to: "/to-dos",
      icon: <ListChecksIcon />,
    },
    {
      title: "Net worth",
      to: "/net-worth",
      icon: <CurrencyDollarIcon />,
    },
  ],
  sports: [
    {
      title: "Gym",
      to: "/gym",
      icon: <BarbellIcon />,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: <GearIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthContext();
  const metadata = (user?.user_metadata ?? {}) as {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
  const navUser = {
    name: metadata.full_name ?? metadata.name ?? user?.email ?? "",
    email: user?.email ?? "",
    avatar: metadata.avatar_url ?? metadata.picture ?? "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Link to="/">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">J.O.A.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSports items={data.sports} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
