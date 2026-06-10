import { Link } from "@tanstack/react-router";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@juan/ui/components/ui/sidebar";

interface NavMainItem {
  title: string;
  to: string;
  icon?: React.ReactNode;
}

export function NavMain({ items }: { items: NavMainItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link
                  to={item.to}
                  activeProps={{ "data-active": "true" }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
