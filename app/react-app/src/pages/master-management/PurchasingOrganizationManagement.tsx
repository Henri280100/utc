"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Plus,
  Search,
  Edit3,
  X,
  Loader2,
  Hash,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PurchasingOrgRecord {
  purchasingOrganization: string;
  purchasingInfoRecord: string;
  netPrice: number;
  priceUnit: number;
}

interface Props {
  apiUrl: string;
}

const EMPTY: PurchasingOrgRecord = {
  purchasingOrganization: "",
  purchasingInfoRecord: "",
  netPrice: 0,
  priceUnit: 0,
};

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

export default function PurchasingOrganizationManagement({ apiUrl }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState<PurchasingOrgRecord>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [panel, setPanel] = useState<"list" | "form">("list");

  const set = (k: keyof PurchasingOrgRecord, value: string | number) =>
    setForm((p) => ({ ...p, [k]: value }));

  // GET
  const { data: records = [], isLoading } = useQuery<PurchasingOrgRecord[]>({
    queryKey: ["purchasing-org"],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/PurchasingOrganizationData`);
      if (!res.ok) throw new Error("Failed to fetch");
      const j = await res.json();
      return j.value ?? j;
    },
  });

  const filtered = records.filter(
    (r) =>
      r.purchasingOrganization
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      r.purchasingInfoRecord.toLowerCase().includes(search.toLowerCase()),
  );

  // CREATE
  const createMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${apiUrl}/PurchasingOrganizationData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const e = await res.json();
        throw e;
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchasing-org"] });
      setMsg({ text: "Record created successfully.", ok: true });
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
    mutationFn: async (data: { id: string }) => {
      const { purchasingOrganization, purchasingInfoRecord } = form;
      const url = `${apiUrl}/PurchasingOrganizationData(purchasingOrganization='${purchasingOrganization}',purchasingInfoRecord='${purchasingInfoRecord}')`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          netPrice: form.netPrice,
          priceUnit: form.priceUnit,
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw e;
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchasing-org"] });
      setMsg({ text: "Record updated successfully.", ok: true });
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

  const startEdit = (r: PurchasingOrgRecord) => {
    setForm({
      purchasingOrganization: r.purchasingOrganization,
      purchasingInfoRecord: r.purchasingInfoRecord,
      netPrice: r.netPrice,
      priceUnit: r.priceUnit,
    });
    setEditing(`${r.purchasingOrganization}/${r.purchasingInfoRecord}`);
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
    editing ? updateMut.mutate({ id: editing }) : createMut.mutate();

  const isPending = createMut.isPending || updateMut.isPending;

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
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <DollarSign className="h-7 w-7 text-white" />
          </motion.div>
          <div>
            <p className="text-sm text-muted-foreground">Master Data</p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Purchasing Organization
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 rounded-full px-4 py-2">
            <DollarSign className="h-4 w-4" />
            {records.length} Records
          </Badge>
          <Button
            onClick={startCreate}
            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
          >
            <Plus className="h-4 w-4" />
            New Record
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
                    <div className="h-2 w-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
                    <CardTitle className="text-base font-semibold">
                      {editing ? `Edit — ${editing}` : "New Record"}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Purchasing Organization *
                    </label>
                    <Input
                      value={form.purchasingOrganization}
                      onChange={(e) =>
                        set("purchasingOrganization", e.target.value)
                      }
                      placeholder="e.g. 1000"
                      disabled={!!editing}
                      className="border-border/50 bg-secondary/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Purchasing Info Record *
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={form.purchasingInfoRecord}
                        onChange={(e) =>
                          set("purchasingInfoRecord", e.target.value)
                        }
                        placeholder="e.g. INFO001"
                        disabled={!!editing}
                        className="border-border/50 bg-secondary/30 pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Net Price *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.netPrice}
                      onChange={(e) =>
                        set("netPrice", parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.00"
                      className="border-border/50 bg-secondary/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Price Unit *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.priceUnit}
                      onChange={(e) =>
                        set("priceUnit", parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.00"
                      className="border-border/50 bg-secondary/30"
                    />
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
                      className="flex-[2] bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : editing ? (
                        "Update Record"
                      ) : (
                        "Create Record"
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
                    placeholder="Search by org, info record..."
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
                  <DollarSign className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">No records found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Purchasing Org</TableHead>
                      <TableHead>Info Record</TableHead>
                      <TableHead>Net Price</TableHead>
                      <TableHead>Price Unit</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => (
                      <TableRow
                        key={`${r.purchasingOrganization}/${r.purchasingInfoRecord}`}
                        className="group"
                      >
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="font-mono font-bold"
                          >
                            {r.purchasingOrganization}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">
                            {r.purchasingInfoRecord}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${r.netPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {r.priceUnit.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(r)}
                            className="gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
