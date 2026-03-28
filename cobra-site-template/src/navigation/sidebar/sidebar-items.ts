import {
  ChartBar,
  LayoutDashboard,
  type LucideIcon,
  Search,
  Target,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        title: "Overview",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        url: "/dashboard/crm",
        icon: ChartBar,
      },
    ],
  },
  {
    id: 2,
    label: "Outreach",
    items: [
      {
        title: "Leads",
        url: "/dashboard/leads",
        icon: Target,
      },
      {
        title: "Scrape",
        url: "/dashboard/scrape",
        icon: Search,
        isNew: true,
      },
    ],
  },
];
