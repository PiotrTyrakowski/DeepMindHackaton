import type { ChartConfig } from "@/components/ui/chart";

// --- Lead acquisition trend (last 6 weeks, proportional to 82 total leads) ---
export const leadsChartData = [
  { date: "W1", newLeads: 8, called: 3 },
  { date: "W2", newLeads: 14, called: 5 },
  { date: "W3", newLeads: 11, called: 4 },
  { date: "W4", newLeads: 18, called: 7 },
  { date: "W5", newLeads: 16, called: 6 },
  { date: "W6", newLeads: 15, called: 3 },
];

export const leadsChartConfig = {
  newLeads: { label: "Scraped", color: "var(--chart-1)" },
  called: { label: "Called", color: "var(--chart-3)" },
  background: { color: "var(--primary)" },
} as ChartConfig;

// --- Calls initiated trend ---
export const proposalsChartData = [
  { date: "W1", callsSent: 3 },
  { date: "W2", callsSent: 7 },
  { date: "W3", callsSent: 9 },
  { date: "W4", callsSent: 10 },
  { date: "W5", callsSent: 11 },
  { date: "W6", callsSent: 8 },
];

export const proposalsChartConfig = {
  callsSent: { label: "Calls Sent", color: "var(--chart-1)" },
} as ChartConfig;

// --- Leads acquired per month (trend) ---
export const revenueChartData = [
  { month: "Oct 2025", revenue: 0 },
  { month: "Nov 2025", revenue: 0 },
  { month: "Dec 2025", revenue: 0 },
  { month: "Jan 2026", revenue: 0 },
  { month: "Feb 2026", revenue: 12 },
  { month: "Mar 2026", revenue: 82 },
];

export const revenueChartConfig = {
  revenue: { label: "Leads", color: "var(--chart-1)" },
} as ChartConfig;

// --- Leads by category (real DB data) ---
export const leadsBySourceChartData = [
  { source: "homeservices", leads: 55, fill: "var(--color-homeservices)" },
  { source: "beauty", leads: 10, fill: "var(--color-beauty)" },
  { source: "automotive", leads: 9, fill: "var(--color-automotive)" },
  { source: "other", leads: 8, fill: "var(--color-other)" },
];

export const leadsBySourceChartConfig = {
  leads: { label: "Leads" },
  homeservices: { label: "Home Services", color: "var(--chart-1)" },
  beauty: { label: "Beauty & Care", color: "var(--chart-2)" },
  automotive: { label: "Automotive", color: "var(--chart-3)" },
  other: { label: "Other", color: "var(--chart-4)" },
} as ChartConfig;

// --- "Project revenue" repurposed as outreach breakdown ---
export const projectRevenueChartData = [
  { name: "Home Services", actual: 55, target: 55 },
  { name: "Beauty & Care", actual: 10, target: 15 },
  { name: "Automotive", actual: 9, target: 15 },
  { name: "Other", actual: 8, target: 15 },
].map((row) => ({
  ...row,
  remaining: Math.max(0, row.target - row.actual),
}));

export const projectRevenueChartConfig = {
  actual: { label: "Scraped", color: "var(--chart-1)" },
  remaining: { label: "Target Gap", color: "var(--chart-2)" },
  label: { color: "var(--primary-foreground)" },
} as ChartConfig;

// --- Sales pipeline (real status counts from DB) ---
export const salesPipelineChartData = [
  { stage: "Waiting for Call", value: 34, fill: "var(--chart-1)" },
  { stage: "Called", value: 28, fill: "var(--chart-2)" },
  { stage: "Bought", value: 20, fill: "var(--chart-5)" },
];

export const salesPipelineChartConfig = {
  value: { label: "Leads", color: "var(--chart-1)" },
  stage: { label: "Stage" },
} as ChartConfig;

// --- Category breakdown with growth indicators ---
export const regionSalesData = [
  { region: "Home Services", sales: 55, percentage: 67, growth: "+67%", isPositive: true },
  { region: "Beauty & Personal Care", sales: 10, percentage: 12, growth: "+12%", isPositive: true },
  { region: "Automotive", sales: 9, percentage: 11, growth: "+11%", isPositive: true },
  { region: "Other", sales: 8, percentage: 10, growth: "+10%", isPositive: true },
];

// --- Action items relevant to lead outreach ---
export const actionItems = [
  {
    id: 1,
    title: "Call waiting leads",
    desc: "34 businesses are waiting to be called",
    due: "Due today",
    priority: "High",
    priorityColor: "bg-red-100 text-red-700",
    checked: false,
  },
  {
    id: 2,
    title: "Follow up with interested",
    desc: "20 businesses expressed buying intent",
    due: "Due this week",
    priority: "Medium",
    priorityColor: "bg-yellow-100 text-yellow-700",
    checked: false,
  },
  {
    id: 3,
    title: "Expand to new locations",
    desc: "Run scraper on new targets",
    due: "Due this week",
    priority: "Low",
    priorityColor: "bg-green-100 text-green-700",
    checked: false,
  },
];

export const recentLeadsData = [
  { id: "L-1", name: "Roto-Rooter", company: "Gallup, NM", status: "Waiting for Call", source: "Home Services", lastActivity: "2h ago" },
  { id: "L-2", name: "Horizon Plumbing", company: "Gallup, NM", status: "Waiting for Call", source: "Home Services", lastActivity: "2h ago" },
  { id: "L-3", name: "Dallago Corporation", company: "Gallup, NM", status: "Bought", source: "Home Services", lastActivity: "2h ago" },
  { id: "L-4", name: "Williams Plumbing", company: "Gallup, NM", status: "Waiting for Call", source: "Home Services", lastActivity: "2h ago" },
  { id: "L-5", name: "Vargas Drain Cleaning", company: "Gallup, NM", status: "Called", source: "Home Services", lastActivity: "2h ago" },
];
