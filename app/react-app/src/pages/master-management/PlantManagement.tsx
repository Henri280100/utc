"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Factory,
  Plus,
  Search,
  Edit3,
  ChevronDown,
  ChevronRight,
  MapPin,
  Warehouse,
  X,
  Loader2,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StorageLocation {
  storageLocation: string;
  storageLocationName?: string;
}

interface Plant {
  plant: string;
  plantName: string;
  city: string;
  country_code?: string;
  storageLocations?: StorageLocation[];
}

interface Props {
  apiUrl: string;
}

const EMPTY: Omit<Plant, "storageLocations"> = {
  plant: "",
  plantName: "",
  city: "",
  country_code: "",
};

const COUNTRIES = [
  { code: "AU", name: "Australia" },
  { code: "US", name: "United States" },
  { code: "DE", name: "Germany" },
  { code: "GB", name: "United Kingdom" },
  { code: "SG", name: "Singapore" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "VN", name: "Vietnam" },
  { code: "MY", name: "Malaysia" },
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

export default function PlantManagement({ apiUrl }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [panel, setPanel] = useState<"list" | "form">("list");
  const [expandedPlant, setExpandedPlant] = useState<string | null>(null);

  const set = (k: keyof typeof EMPTY, value: string) =>
    setForm((p) => ({ ...p, [k]: value }));

  // GET
  const { data: plants = [], isLoading } = useQuery<Plant[]>({
    queryKey: ["plants"],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/Plant?$expand=storageLocations`);
      if (!res.ok) throw new Error("Failed to fetch plants");
      const j = await res.json();
      return j.value ?? j;
    },
  });

  const filtered = plants.filter(
    (p) =>
      p.plant.toLowerCase().includes(search.toLowerCase()) ||
      p.plantName?.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase()),
  );

  // CREATE
  const createMut = useMutation({
    mutationFn: async (data: typeof EMPTY) => {
      const res = await fetch(`${apiUrl}/Plant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const e = await res.json();
        throw e;
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plants"] });
      setMsg({ text: "Plant created successfully.", ok: true });
      setForm(EMPTY);
      setPanel("list");
      setTimeout(() => setMsg(null), 4000);
    },
    onError: (e: any) => {
      setMsg({ text: e?.error?.message || "Create failed.", ok: false });
      setTimeout(() => setMsg(null), 4000);
    },
  });

  // UPDATE
  const updateMut = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof EMPTY }) => {
      const res = await fetch(`${apiUrl}/Plant('${id}')`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const e = await res.json();
        throw e;
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plants"] });
      setMsg({ text: "Plant updated successfully.", ok: true });
      setEditing(null);
      setForm(EMPTY);
      setPanel("list");
      setTimeout(() => setMsg(null), 4000);
    },
    onError: (e: any) => {
      setMsg({ text: e?.error?.message || "Update failed.", ok: false });
      setTimeout(() => setMsg(null), 4000);
    },
  });

  const startEdit = (p: Plant) => {
    setForm({
      plant: p.plant,
      plantName: p.plantName,
      city: p.city,
      country_code: p.country_code ?? "",
    });
    setEditing(p.plant);
    setPanel("form");
  };

  const startCreate = () => {
    setForm(EMPTY);
    setEditing(null);
    setPanel("form");
  };

  const cancel = () => {
    setForm(EMPTY);
    setEditing(null);
    setPanel("list");
  };

  const submit = () =>
    editing
      ? updateMut.mutate({ id: editing, data: form })
      : createMut.mutate(form);

  const isPending = createMut.isPending || updateMut.isPending;
  const countryName = (code?: string) =>
    COUNTRIES.find((c) => c.code === code)?.name ?? code ?? "—";
  const totalSL = plants.reduce(
    (s, p) => s + (p.storageLocations?.length ?? 0),
    0,
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Factory className="h-7 w-7 text-white" />
          </motion.div>
          <div>
            <p className="text-sm text-muted-foreground">Master Data</p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Plant Management
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 rounded-full px-4 py-2">
            <Factory className="h-4 w-4" />
            {plants.length} Plants
          </Badge>
          <Badge variant="outline" className="gap-2 rounded-full px-4 py-2">
            <Warehouse className="h-4 w-4" />
            {totalSL} Storage Locs
          </Badge>
          <Button
            onClick={startCreate}
            className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
          >
            <Plus className="h-4 w-4" />
            New Plant
          </Button>
        </div>
      </motion.div>

      {/* Message Toast */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`flex items-center justify-between rounded-lg border p-4 ${
              msg.ok
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            <span className="font-medium">{msg.text}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMsg(null)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Form Panel */}
        <AnimatePresence mode="wait">
          {panel === "form" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                    <CardTitle className="text-base font-semibold">
                      {editing ? `Edit — ${editing}` : "New Plant"}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Plant Code *
                    </label>
                    <Input
                      value={form.plant}
                      onChange={(e) => set("plant", e.target.value)}
                      placeholder="e.g. 1000"
                      disabled={!!editing}
                      className="border-border/50 bg-secondary/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Plant Name *
                    </label>
                    <Input
                      value={form.plantName}
                      onChange={(e) => set("plantName", e.target.value)}
                      placeholder="e.g. Sydney Branch"
                      className="border-border/50 bg-secondary/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      City *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={form.city}
                        onChange={(e) => set("city", e.target.value)}
                        placeholder="e.g. Sydney"
                        className="border-border/50 bg-secondary/30 pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Country *
                    </label>
                    <Select
                      value={form.country_code}
                      onValueChange={(val) => set("country_code", val)}
                    >
                      <SelectTrigger className="border-border/50 bg-secondary/30">
                        <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={cancel}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={submit}
                      disabled={isPending}
                      className="flex-[2] bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : editing ? (
                        "Update Plant"
                      ) : (
                        "Create Plant"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List Panel */}
        <motion.div
          variants={itemVariants}
          className={panel === "list" ? "lg:col-span-2" : ""}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by plant, name, city..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-border/50 bg-secondary/30 pl-9"
                  />
                </div>
                <Badge variant="secondary" className="rounded-full">
                  {filtered.length} records
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Factory className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">No plants found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Plant</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Storage Locs</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((p, i) => {
                      const expanded = expandedPlant === p.plant;
                      const slCount = p.storageLocations?.length ?? 0;
                      return (
                        <>
                          <TableRow key={p.plant} className="group">
                            <TableCell>
                              {slCount > 0 && (
                                <button
                                  onClick={() =>
                                    setExpandedPlant(expanded ? null : p.plant)
                                  }
                                  className="rounded p-1 hover:bg-secondary"
                                >
                                  {expanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="font-mono font-bold"
                              >
                                {p.plant}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {p.plantName}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {p.city}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="gap-1">
                                <Globe className="h-3 w-3" />
                                {p.country_code} — {countryName(p.country_code)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={slCount > 0 ? "default" : "secondary"}
                                className={
                                  slCount > 0
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : ""
                                }
                              >
                                {slCount} loc{slCount !== 1 ? "s" : ""}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEdit(p)}
                                className="gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <Edit3 className="h-4 w-4" />
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                          <AnimatePresence>
                            {expanded &&
                              p.storageLocations?.map((sl) => (
                                <motion.tr
                                  key={sl.storageLocation}
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="bg-primary/5"
                                >
                                  <TableCell></TableCell>
                                  <TableCell colSpan={2} className="pl-8">
                                    <div className="flex items-center gap-2">
                                      <Warehouse className="h-4 w-4 text-primary" />
                                      <span className="font-mono text-sm font-semibold text-primary">
                                        {sl.storageLocation}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell
                                    colSpan={4}
                                    className="text-muted-foreground"
                                  >
                                    {sl.storageLocationName ?? "—"}
                                  </TableCell>
                                </motion.tr>
                              ))}
                          </AnimatePresence>
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
