"use client";

import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Boxes,
  Factory,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Package,
  BarChart3,
  Users,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardProps {
  apiBase: string;
}

// Trend data
const prTrend = [
  { month: "Nov", count: 28, value: 142 },
  { month: "Dec", count: 35, value: 198 },
  { month: "Jan", count: 22, value: 110 },
  { month: "Feb", count: 41, value: 230 },
  { month: "Mar", count: 38, value: 205 },
  { month: "Apr", count: 50, value: 290 },
  { month: "May", count: 44, value: 265 },
];

const statusDist = [
  { name: "Released", value: 50, color: "#10b981" },
  { name: "Pending", value: 12, color: "#f59e0b" },
  { name: "Rejected", value: 4, color: "#ef4444" },
];

const topMaterials = [
  { material: "MAT001", qty: 48 },
  { material: "MAT005", qty: 36 },
  { material: "MAT012", qty: 29 },
  { material: "MAT003", qty: 22 },
  { material: "MAT018", qty: 17 },
];

const APPS = [
  {
    path: "/material",
    label: "Material Master",
    desc: "Manage raw materials, finished goods, and master data attributes.",
    icon: Boxes,
    gradient: "from-cyan-500 to-blue-500",
    bgLight: "bg-cyan-50 dark:bg-cyan-950/30",
    borderLight: "border-cyan-200 dark:border-cyan-800",
  },
  {
    path: "/plant",
    label: "Plant Management",
    desc: "Configure plants, storage locations, and geographic assignments.",
    icon: Factory,
    gradient: "from-emerald-500 to-teal-500",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30",
    borderLight: "border-emerald-200 dark:border-emerald-800",
  },
  {
    path: "/vendor",
    label: "Vendor Master",
    desc: "Manage supplier data, contact information, and vendor details.",
    icon: Users,
    gradient: "from-purple-500 to-pink-500",
    bgLight: "bg-purple-50 dark:bg-purple-950/30",
    borderLight: "border-purple-200 dark:border-purple-800",
  },
  {
    path: "/purchasing-org",
    label: "Purchasing Organization",
    desc: "Configure purchasing organizations, pricing, and info records.",
    icon: DollarSign,
    gradient: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50 dark:bg-amber-950/30",
    borderLight: "border-amber-200 dark:border-amber-800",
  },
  {
    path: "/purchase",
    label: "Purchase Requisitions",
    desc: "Create and track purchase requisitions across all procurement groups.",
    icon: FileText,
    gradient: "from-indigo-500 to-blue-500",
    bgLight: "bg-indigo-50 dark:bg-indigo-950/30",
    borderLight: "border-indigo-200 dark:border-indigo-800",
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard({ apiBase }: DashboardProps) {
  const navigate = useNavigate();

  const { data: materials = [] } = useQuery<any[]>({
    queryKey: ["dash-materials"],
    queryFn: async () => {
      const r = await fetch(`${apiBase}/material-masters/MaterialMaster`);
      const j = await r.json();
      return j.value ?? j;
    },
  });

  const { data: plants = [] } = useQuery<any[]>({
    queryKey: ["dash-plants"],
    queryFn: async () => {
      const r = await fetch(
        `${apiBase}/plant-masters/Plant?$expand=storageLocations`,
      );
      const j = await r.json();
      return j.value ?? j;
    },
  });

  const { data: prs = [] } = useQuery<any[]>({
    queryKey: ["dash-prs"],
    queryFn: async () => {
      const r = await fetch(
        `${apiBase}/purchase-requisitions/PurchaseRequisition`,
      );
      const j = await r.json();
      return j.value ?? j;
    },
  });

  const totalSL = plants.reduce(
    (s: number, p: any) => s + (p.storageLocations?.length ?? 0),
    0,
  );
  const released = prs.filter((p: any) => p.releaseStatus === "REL").length;
  const pending = prs.filter((p: any) => p.releaseStatus !== "REL").length;
  const totalQty = prs.reduce((s: number, p: any) => s + (p.quantity ?? 0), 0);

  const KPIS = [
    {
      label: "Materials",
      value: materials.length,
      sub: "Active records",
      icon: Boxes,
      gradient: "from-blue-500 to-cyan-500",
      bgGlow: "bg-blue-500/10",
    },
    {
      label: "Plants",
      value: plants.length,
      sub: `${totalSL} storage locs`,
      icon: Factory,
      gradient: "from-emerald-500 to-teal-500",
      bgGlow: "bg-emerald-500/10",
    },
    {
      label: "Total PRs",
      value: prs.length,
      sub: `${released} released`,
      icon: FileText,
      gradient: "from-indigo-500 to-purple-500",
      bgGlow: "bg-indigo-500/10",
    },
    {
      label: "Pending PRs",
      value: pending,
      sub: "Awaiting approval",
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      bgGlow: "bg-amber-500/10",
    },
    {
      label: "Total Qty",
      value: totalQty,
      sub: "Units requested",
      icon: Package,
      gradient: "from-violet-500 to-purple-500",
      bgGlow: "bg-violet-500/10",
    },
    {
      label: "Release Rate",
      value: prs.length ? `${Math.round((released / prs.length) * 100)}%` : "—",
      sub: "PRs released",
      icon: CheckCircle2,
      gradient: "from-pink-500 to-rose-500",
      bgGlow: "bg-pink-500/10",
    },
  ];

  const currentDate = new Date();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Hero */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <BarChart3 className="h-7 w-7 text-primary-foreground" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">Good morning, Jane</p>
              <motion.div
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
              </motion.div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Procurement Dashboard
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </Badge>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {currentDate.toLocaleDateString("en-AU", { weekday: "long" })}
            </p>
            <p className="font-semibold text-foreground">
              {currentDate.toLocaleDateString("en-AU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6"
      >
        {KPIS.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="group"
          >
            <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
              <div
                className={`absolute inset-0 ${kpi.bgGlow} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
              />
              <CardContent className="relative p-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ rotate: 5 }}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${kpi.gradient} shadow-md`}
                  >
                    <kpi.icon className="h-5 w-5 text-white" />
                  </motion.div>
                  <div className="min-w-0">
                    <motion.p
                      className="truncate text-xl font-bold tabular-nums"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                    >
                      {kpi.value}
                    </motion.p>
                    <p className="truncate text-xs text-muted-foreground">
                      {kpi.label}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{kpi.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid gap-4 lg:grid-cols-3">
        {/* PR Trend Chart */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Purchase Requisition Trend
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Monthly PR count over last 7 months
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={prTrend}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="prGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="PRs"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#prGrad)"
                  dot={{ r: 3, fill: "hsl(var(--primary))" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Pie Chart */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">PR Status</CardTitle>
            <p className="text-xs text-muted-foreground">
              Distribution by release status
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <PieChart width={120} height={120}>
                <Pie
                  data={statusDist}
                  cx={55}
                  cy={55}
                  innerRadius={34}
                  outerRadius={52}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {statusDist.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="flex flex-col gap-2">
                {statusDist.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <motion.div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: d.color }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {d.name}
                    </span>
                    <span className="ml-auto text-sm font-bold">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Materials Bar Chart */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Top Materials
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              By requisition quantity
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={topMaterials}
                layout="vertical"
                margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="material"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="qty"
                  name="Qty"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                  barSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* App Launchers */}
      <motion.div variants={itemVariants}>
        <div className="mb-4">
          <h2 className="text-lg font-bold">Applications</h2>
          <p className="text-sm text-muted-foreground">
            Navigate to a module to manage records
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {APPS.map((app, index) => (
            <motion.div
              key={app.path}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(app.path)}
              className="cursor-pointer"
            >
              <Card
                className={`group relative overflow-hidden border-2 ${app.borderLight} ${app.bgLight} transition-all duration-300 hover:shadow-lg`}
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <motion.div
                    whileHover={{ rotate: 5 }}
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${app.gradient} shadow-lg`}
                  >
                    <app.icon className="h-7 w-7 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-semibold">{app.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {app.desc}
                    </p>
                  </div>
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    whileHover={{ x: 0, opacity: 1 }}
                    className="text-muted-foreground transition-all group-hover:text-foreground"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
