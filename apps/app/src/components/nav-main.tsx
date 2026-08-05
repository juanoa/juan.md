import { Link } from "@tanstack/react-router";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@juan/ui/components/ui/sidebar";

interface NavMainItem {
  title: string;
  to: string;
  icon?: React.ReactNode;
}

export function NavMain({
  items,
  label,
}: {
  items: NavMainItem[];
  label?: string;
}) {
  return (
    <SidebarGroup
      className={label ? "group-data-[collapsible=icon]:hidden" : undefined}>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                render={
                  <Link
                    to={item.to}
                    activeProps={{ "data-active": "true" }}
                    activeOptions={{ exact: item.to === "/" }}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                }
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
