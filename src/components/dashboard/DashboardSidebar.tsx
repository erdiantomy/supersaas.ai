import {
  LayoutDashboard, Users, FolderKanban, Milestone, LogOut, Home,
  Inbox, FileText, DollarSign, Send, Bot, Sparkles, Cpu, Network
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const adminItems = [
  { title: "Command Center", url: "/dashboard", icon: LayoutDashboard },
  { title: "Inquiries", url: "/dashboard/inquiries", icon: Inbox },
  { title: "Submissions", url: "/dashboard/submissions", icon: FileText },
  { title: "Clients", url: "/dashboard/clients", icon: Users },
  { title: "Projects", url: "/dashboard/projects", icon: FolderKanban },
  { title: "Milestones", url: "/dashboard/milestones", icon: Milestone },
  { title: "Payments", url: "/dashboard/payments", icon: DollarSign },
  { title: "Managed Agents", url: "/dashboard/managed-agents", icon: Cpu },
  { title: "Agent-Native", url: "/dashboard/agent-native", icon: Network },
];

const clientItems = [
  { title: "My Projects", url: "/portal", icon: FolderKanban },
  { title: "New Project (AI)", url: "/portal/new", icon: Sparkles },
  { title: "Submit Project", url: "/portal/submit", icon: Send },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role, profile, signOut } = useAuth();

  const items = role === "admin" ? adminItems : clientItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && (
              <span className="font-display font-bold text-sm">
                Super<span className="text-primary">SaaS</span>
                <span className="text-xs text-muted-foreground font-normal ml-1">.ai</span>
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/" className="hover:bg-muted/50">
                    <Home className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Website</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={signOut} className="hover:bg-muted/50 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  {!collapsed && <span>Sign Out</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
