import {
  BarbellIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  GearIcon,
  ListChecksIcon,
  SquaresFourIcon,
  WavesIcon,
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
  ],
  productivity: [
    {
      title: "To-dos",
      to: "/to-dos",
      icon: <ListChecksIcon />,
    },
    {
      title: "Books",
      to: "/books",
      icon: <BookOpenIcon />,
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
    {
      title: "Surf cameras",
      to: "/surf-cameras",
      icon: <WavesIcon />,
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
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={
                <Link to="/" className="flex items-center gap-3">
                  <div className="size-5 rounded-full bg-black" />
                  <span className="text-base font-semibold">app.juan.md</span>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavMain items={data.productivity} label="Productivity" />
        <NavSports items={data.sports} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
