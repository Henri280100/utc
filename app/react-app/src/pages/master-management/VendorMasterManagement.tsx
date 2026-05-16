"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Edit3,
  X,
  Loader2,
  Globe,
  Trash2,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface InfoRecord {
  purchasingInfoRecord: string;
  material_material: string;
  supplier_supplier: string;
}

interface Vendor {
  supplier: string;
  supplierName: string;
  country_code?: string;
  city?: string;
  street?: string;
  materialInfoRecords?: InfoRecord[];
}

interface Props {
  apiUrl: string;
}

const EMPTY: Omit<Vendor, "materialInfoRecords"> = {
  supplier: "",
  supplierName: "",
  country_code: "",
  city: "",
  street: "",
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

type AssocState = {
  materialInfoRecords: InfoRecord[];
};

const emptyAssocState: AssocState = {
  materialInfoRecords: [
    { purchasingInfoRecord: "", material_material: "", supplier_supplier: "" },
  ],
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

export default function VendorManagement({ apiUrl }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [assoc, setAssoc] = useState<AssocState>(emptyAssocState);
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [panel, setPanel] = useState<"list" | "form">("list");

  const set = (k: keyof typeof EMPTY, value: string) =>
    setForm((p) => ({ ...p, [k]: value }));

  const derivedAssoc = useMemo<AssocState>(() => {
    return {
      materialInfoRecords: assoc.materialInfoRecords.map((r) => ({
        ...r,
        supplier_supplier: form.supplier,
      })),
    };
  }, [assoc, form.supplier]);

  // GET
  const { data: vendors = [], isLoading } = useQuery<Vendor[]>({
    queryKey: ["vendors"],
    queryFn: async () => {
      const res = await fetch(
        `${apiUrl}/VendorMaster?$expand=materialInfoRecords`,
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const j = await res.json();
      return j.value ?? j;
    },
  });

  const filtered = vendors.filter(
    (v) =>
      v.supplier.toLowerCase().includes(search.toLowerCase()) ||
      v.supplierName?.toLowerCase().includes(search.toLowerCase()) ||
      v.city?.toLowerCase().includes(search.toLowerCase()),
  );

  const createPayload = () => ({
    ...form,
    materialInfoRecords: derivedAssoc.materialInfoRecords.filter(
      (r) => r.purchasingInfoRecord && r.material_material,
    ),
  });

  // CREATE
  const createMut = useMutation({
    mutationFn: async () => {
      const payload = createPayload();
      const res = await fetch(`${apiUrl}/VendorMaster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const e = await res.json();
        throw e;
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendors"] });
      setMsg({ text: "Vendor created successfully.", ok: true });
      setForm(EMPTY);
      setAssoc(emptyAssocState);
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
      const payload = createPayload();
      const res = await fetch(`${apiUrl}/VendorMaster('${data.id}')`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const e = await res.json();
        throw e;
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendors"] });
      setMsg({ text: "Vendor updated successfully.", ok: true });
      setEditing(null);
      setForm(EMPTY);
      setAssoc(emptyAssocState);
      setPanel("list");
      setTimeout(() => setMsg(null), 4000);
    },
    onError: (e: any) => {
      setMsg({ text: e?.error?.message || "Update failed.", ok: false });
      setTimeout(() => setMsg(null), 4000);
    },
  });

  const startEdit = (v: Vendor) => {
    setForm({
      supplier: v.supplier,
      supplierName: v.supplierName,
      country_code: v.country_code ?? "",
      city: v.city ?? "",
      street: v.street ?? "",
    });
    setAssoc({
      materialInfoRecords: v.materialInfoRecords?.map((r) => ({
        purchasingInfoRecord: r.purchasingInfoRecord,
        material_material: r.material_material,
        supplier_supplier: v.supplier,
      })) ?? [
        {
          purchasingInfoRecord: "",
          material_material: "",
          supplier_supplier: v.supplier,
        },
      ],
    });
    setEditing(v.supplier);
    setPanel("form");
  };

  const startCreate = () => {
    setForm(EMPTY);
    setAssoc(emptyAssocState);
    setEditing(null);
    setPanel("form");
  };

  const cancel = () => {
    setForm(EMPTY);
    setAssoc(emptyAssocState);
    setEditing(null);
    setPanel("list");
  };

  const submit = () => {
    if (editing) updateMut.mutate({ id: editing });
    else createMut.mutate();
  };

  const isPending = createMut.isPending || updateMut.isPending;

  const addInfoRow = () => {
    setAssoc((p) => ({
      materialInfoRecords: [
        ...p.materialInfoRecords,
        {
          purchasingInfoRecord: "",
          material_material: "",
          supplier_supplier: form.supplier,
        },
      ],
    }));
  };

  const removeInfoRow = (index: number) => {
    setAssoc((p) => ({
      materialInfoRecords: p.materialInfoRecords.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const countryName = (code?: string) =>
    COUNTRIES.find((c) => c.code === code)?.name ?? code ?? "—";

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
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Users className="h-7 w-7 text-white" />
          </motion.div>
          <div>
            <p className="text-sm text-muted-foreground">Master Data</p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Vendor Master
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 rounded-full px-4 py-2">
            <Users className="h-4 w-4" />
            {vendors.length} Vendors
          </Badge>
          <Button
            onClick={startCreate}
            className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
          >
            <Plus className="h-4 w-4" />
            New Vendor
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

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* Form Panel */}
        <AnimatePresence mode="wait">
          {panel === "form" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-h-[calc(100vh-200px)] overflow-y-auto"
            >
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader className="border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50" />
                    <CardTitle className="text-base font-semibold">
                      {editing ? `Edit — ${editing}` : "New Vendor"}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Supplier Code *
                    </label>
                    <Input
                      value={form.supplier}
                      onChange={(e) => set("supplier", e.target.value)}
                      placeholder="e.g. SUP001"
                      disabled={!!editing}
                      className="border-border/50 bg-secondary/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Supplier Name *
                    </label>
                    <Input
                      value={form.supplierName}
                      onChange={(e) => set("supplierName", e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="border-border/50 bg-secondary/30"
                    />
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      City
                    </label>
                    <Input
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder="e.g. Berlin"
                      className="border-border/50 bg-secondary/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Street
                    </label>
                    <Input
                      value={form.street}
                      onChange={(e) => set("street", e.target.value)}
                      placeholder="e.g. Main Street 123"
                      className="border-border/50 bg-secondary/30"
                    />
                  </div>

                  {/* Material Info Records */}
                  <Accordion type="multiple" className="w-full">
                    <AccordionItem
                      value="inforecords"
                      className="border-border/50"
                    >
                      <AccordionTrigger className="text-sm font-medium">
                        Material Info Records
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        {assoc.materialInfoRecords.map((r, index) => (
                          <div
                            key={index}
                            className="space-y-2 rounded-lg border border-border/50 p-3"
                          >
                            <div className="flex gap-2">
                              <Input
                                value={r.purchasingInfoRecord}
                                onChange={(e) =>
                                  setAssoc((p) => ({
                                    materialInfoRecords:
                                      p.materialInfoRecords.map((row, i) =>
                                        i === index
                                          ? {
                                              ...row,
                                              purchasingInfoRecord:
                                                e.target.value,
                                            }
                                          : row,
                                      ),
                                  }))
                                }
                                placeholder="Info Record #"
                                className="flex-1 border-border/50 bg-secondary/30"
                              />
                              <Input
                                value={r.material_material}
                                onChange={(e) =>
                                  setAssoc((p) => ({
                                    materialInfoRecords:
                                      p.materialInfoRecords.map((row, i) =>
                                        i === index
                                          ? {
                                              ...row,
                                              material_material: e.target.value,
                                            }
                                          : row,
                                      ),
                                  }))
                                }
                                placeholder="Material"
                                className="flex-1 border-border/50 bg-secondary/30"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeInfoRow(index)}
                                className="h-9 w-9 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addInfoRow}
                          className="w-full gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          Add Info Record
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

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
                      className="flex-[2] bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : editing ? (
                        "Update Vendor"
                      ) : (
                        "Create Vendor"
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
                    placeholder="Search vendors..."
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
                  <Users className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    No vendors found
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Supplier</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Info Records</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((v) => (
                      <TableRow key={v.supplier} className="group">
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="font-mono font-bold"
                          >
                            {v.supplier}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {v.supplierName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1">
                            <Globe className="h-3 w-3" />
                            {v.country_code} — {countryName(v.country_code)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {v.city ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              (v.materialInfoRecords?.length ?? 0) > 0
                                ? "default"
                                : "secondary"
                            }
                            className={
                              (v.materialInfoRecords?.length ?? 0) > 0
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                : ""
                            }
                          >
                            {v.materialInfoRecords?.length ?? 0} records
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(v)}
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
