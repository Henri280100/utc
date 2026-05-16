"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TextArea } from "@ui5/webcomponents-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Boxes,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Factory,
  FileText,
  Hash,
  Loader2,
  Package,
  Plus,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  REL: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    label: "Released",
  },
  PENDING: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    label: "Pending",
  },
  CLOSED: {
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-500/10",
    label: "Closed",
  },
  REJECT: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    label: "Rejected",
  },
};

const FIELD_CONFIGS = [
  {
    key: "material_material",
    label: "Material No.",
    placeholder: "e.g. MAT001",
    required: true,
    icon: Boxes,
  },
  {
    key: "plant_plant",
    label: "Plant",
    placeholder: "e.g. 1000",
    required: true,
    icon: Factory,
  },
  {
    key: "PurchasingGroup_purchasingGroup",
    label: "Purchasing Group",
    placeholder: "e.g. P01",
    required: true,
    icon: Users,
  },
  {
    key: "quantity",
    label: "Quantity",
    placeholder: "e.g. 10",
    required: true,
    icon: Hash,
  },
  {
    key: "baseUnit",
    label: "Base Unit",
    placeholder: "EA / KG / PC",
    required: false,
    icon: Package,
  },
  {
    key: "requisitioner",
    label: "Requisitioner",
    placeholder: "User ID",
    required: false,
    icon: User,
  },
];

const EMPTY_FORM = {
  material_material: "",
  plant_plant: "",
  PurchasingGroup_purchasingGroup: "",
  quantity: "",
  baseUnit: "EA",
  deliveryDate: "",
  requisitioner: "",
};

interface PR {
  purchaseRequisition: string;
  purchaseReqnItem: string;

  material?: {
    material: string;
    materialDescriptions?: {
      materialDescription: string;
    }[];
  };

  plant?: {
    plant: string;
    plantName?: string;
  };

  quantity: number;
  deliveryDate: string;

  releaseStatus?: string;

  rejectReason?: string;

  createdByUser?: string;

  PurchasingGroup?: {
    purchasingGroup: string;
  };

  requisitioner?: string;
}

interface Props {
  apiUrl: string;
}

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

export default function PurchaseRequisitionManagement({ apiUrl }: Props) {
  const queryClient = useQueryClient();
  const [newPR, setNewPR] = useState(EMPTY_FORM);
  const [message, setMessage] = useState<{
    text: string;
    type: "positive" | "negative" | "warning";
  } | null>(null);
  const [formOpen, setFormOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [selectedPR, setSelectedPR] = useState<PR | null>(null);
  
  
  // GET purchase requisitions
  const {
    data: prsData = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["purchaseRequisitions"],
    queryFn: async () => {
      const res = await fetch(
        `${apiUrl}/PurchaseRequisition?$expand=material,plant,PurchasingGroup&$orderby=purchaseRequisition desc`,
      );
      console.log("Fetching from:", res);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed: ${res.status} - ${errorText}`);
      }

      const json = await res.json();
      return json.value as PR[];
    },
  });

  const prs = prsData ?? [];
  const filtered = prs.filter(
    (p) =>
      p.purchaseRequisition.toLowerCase().includes(search.toLowerCase()) ||
      p.material?.material?.toLowerCase().includes(search.toLowerCase()) ||
      p.plant?.plant?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalQty = prs.reduce((s, p) => s + (p.quantity || 0), 0);
  const released = prs.filter((p) => p.releaseStatus === "REL").length;
  const pending = prs.filter(
    (p) => !p.releaseStatus || p.releaseStatus === "PENDING",
  ).length;

  const kpis = [
    {
      label: "Total PRs",
      value: prs.length,
      icon: FileText,
      gradient: "from-blue-500 to-indigo-500",
      bgGlow: "bg-blue-500/10",
    },
    {
      label: "Released",
      value: released,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-500",
      bgGlow: "bg-emerald-500/10",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      bgGlow: "bg-amber-500/10",
    },
    {
      label: "Total Qty",
      value: totalQty.toLocaleString(),
      icon: Package,
      gradient: "from-violet-500 to-purple-500",
      bgGlow: "bg-violet-500/10",
    },
  ];

  const createMutation = useMutation({
    mutationFn: async (data: typeof EMPTY_FORM) => {
      const payload = [
        {
          purchaseReqnItem: "00010",
          material_material: data.material_material,
          plant_plant: data.plant_plant,
          PurchasingGroup_purchasingGroup: data.PurchasingGroup_purchasingGroup,
          quantity: parseFloat(data.quantity),
          baseUnit: data.baseUnit || "EA",
          deliveryDate: data.deliveryDate,
          requisitioner: data.requisitioner || "SYSTEM",
          PurchaseRequisitionType: "NB",
        },
      ];

      const res = await fetch(`${apiUrl}/createPurchaseRequisition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseRequisitions"] });
      setMessage({
        text: "Purchase Requisition created successfully.",
        type: "positive",
      });
      setNewPR(EMPTY_FORM);
      setTimeout(() => setMessage(null), 4000);
    },
    onError: (err: any) => {
      const detail =
        err?.error?.message || err?.message || "An error occurred.";
      setMessage({ text: detail, type: "negative" });
      setTimeout(() => setMessage(null), 4000);
    },
  });

  const releaseMutation = useMutation({
    mutationFn: async (pr: PR) => {
      const res = await fetch(`${apiUrl}/releasePurchaseRequisition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseRequisition: pr.purchaseRequisition,
          purchaseReqnItem: pr.purchaseReqnItem,
        }),
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseRequisitions"] });
      setMessage({
        text: "Purchase Requisition released successfully.",
        type: "positive",
      });
      setTimeout(() => setMessage(null), 4000);
    },
    onError: (err: any) => {
      const detail =
        err?.error?.message || err?.message || "An error occurred.";
      setMessage({ text: detail, type: "negative" });
      setTimeout(() => setMessage(null), 4000);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ pr, reason }: { pr: PR; reason: string }) => {
      const url =
        `${apiUrl}/PurchaseRequisition(` +
        `purchaseRequisition='${pr.purchaseRequisition}',` +
        `purchaseReqnItem='${pr.purchaseReqnItem}'` +
        `)/PurchaseRequisitionsService.rejectOrder`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rejectReason: reason,
        }),
      });

      if (!res.ok) throw await res.json();
      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseRequisitions"] });
      setMessage({
        text: "Purchase Requisition rejected successfully.",
        type: "positive",
      });
      setTimeout(() => setMessage(null), 4000);
    },
    onError: (err: any) => {
      const detail =
        err?.error?.message || err?.message || "An error occurred.";
      setMessage({ text: detail, type: "negative" });
      setTimeout(() => setMessage(null), 4000);
    },
  });

  const field = (key: keyof typeof EMPTY_FORM) => ({
    value: newPR[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setNewPR((prev) => ({ ...prev, [key]: e.target.value })),
  });

  const statusCfg = (status?: string) =>
    STATUS_CONFIG[status || "PENDING"] ?? STATUS_CONFIG["PENDING"];

  const handleSubmit = () => {
    const requiredFields = FIELD_CONFIGS.filter((f) => f.required).map(
      (f) => f.key,
    );
    const missingField = requiredFields.filter(
      (key) => !newPR[key as keyof typeof EMPTY_FORM],
    );
    if (missingField.length > 0 || !newPR.deliveryDate) {
      setMessage({
        type: "warning",
        text: "Please fill in all required fields.",
      });
      setTimeout(() => setMessage(null), 4000);
      return;
    }
    createMutation.mutate(newPR);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">
            Loading Purchase Requisitions...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <X className="h-10 w-10 text-destructive" />
          <p className="text-muted-foreground">
            Failed to load data. Check your API connection.
          </p>
        </div>
      </div>
    );
  }

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
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <FileText className="h-7 w-7 text-white" />
          </motion.div>
          <div>
            <p className="text-sm text-muted-foreground">
              SAP Procurement Module
            </p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Purchase Requisitions
            </h1>
          </div>
        </div>
        <Badge variant="outline" className="gap-2 rounded-full px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {prs.length} Records
        </Badge>
      </motion.div>

      {/* KPI Strip */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {kpis.map((kpi, index) => (
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
              <CardContent className="relative flex items-center gap-4 p-4">
                <motion.div
                  whileHover={{ rotate: 5 }}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${kpi.gradient} shadow-md`}
                >
                  <kpi.icon className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <motion.p
                    className="text-2xl font-bold tabular-nums"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    {kpi.value}
                  </motion.p>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`flex items-center justify-between rounded-lg border p-4 ${
              message.type === "positive"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : message.type === "warning"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            <span className="font-medium">{message.text}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMessage(null)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Left: Create Form */}
        <motion.div variants={itemVariants}>
          <Collapsible open={formOpen} onOpenChange={setFormOpen}>
            <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer border-b border-border/50 transition-colors hover:bg-secondary/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
                      <CardTitle className="text-base font-semibold">
                        New Requisition
                      </CardTitle>
                    </div>
                    <motion.div
                      animate={{ rotate: formOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="space-y-4 p-6">
                  <Badge
                    variant="secondary"
                    className="mb-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  >
                    Type: NB — Standard PR
                  </Badge>

                  {FIELD_CONFIGS.map((cfg, index) => (
                    <motion.div
                      key={cfg.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="space-y-2"
                    >
                      <label className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                        {cfg.label}
                        {cfg.required && (
                          <span className="text-destructive">*</span>
                        )}
                      </label>
                      <div className="relative">
                        <cfg.icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...field(cfg.key as keyof typeof EMPTY_FORM)}
                          placeholder={cfg.placeholder}
                          className="border-border/50 bg-secondary/30 pl-10"
                        />
                      </div>
                    </motion.div>
                  ))}

                  {/* Delivery Date */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: FIELD_CONFIGS.length * 0.05 }}
                    className="space-y-2"
                  >
                    <label className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                      Delivery Date
                      <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="date"
                        {...field("deliveryDate")}
                        className="border-border/50 bg-secondary/30 pl-10"
                      />
                    </div>
                  </motion.div>

                  <div className="my-4 h-px bg-border/50" />

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button
                      onClick={handleSubmit}
                      disabled={createMutation.isPending}
                      className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
                    >
                      {createMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          <span>Create Purchase Requisition</span>
                        </>
                      )}
                    </Button>
                  </motion.div>

                  <p className="text-center text-xs text-muted-foreground">
                    Fields marked <span className="text-destructive">*</span>{" "}
                    are mandatory.
                  </p>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </motion.div>

        {/* Right: Table */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                  <CardTitle className="text-base font-semibold">
                    Requisition Records
                  </CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-48 border-border/50 bg-secondary/30 pl-9"
                    />
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    {filtered.length} items
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                  </motion.div>
                  <p className="mt-4 font-medium text-muted-foreground">
                    No Records Found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Create your first purchase requisition using the form.
                  </p>
                </div>
              ) : (
                <div className="max-h-[600px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card">
                      <TableRow className="hover:bg-transparent">
                        <TableHead>PR Number</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>Plant</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Delivery Date</TableHead>
                        <TableHead>Purch. Group</TableHead>
                        <TableHead>Requisitioner</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((pr, i) => {
                        const cfg = statusCfg(pr.releaseStatus);
                        return (
                          <motion.tr
                            key={`${pr.purchaseRequisition}-${pr.purchaseReqnItem}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="group hover:bg-secondary/30"
                          >
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="font-mono font-bold"
                              >
                                {pr.purchaseRequisition}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-mono">
                                {pr.purchaseReqnItem}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {pr.material?.material ?? "—"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  {pr.material?.materialDescriptions?.[0]
                                    ?.materialDescription ?? ""}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {pr.plant?.plant ?? "—"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {pr.plant?.plantName ?? ""}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="font-mono font-bold"
                              >
                                {pr.quantity}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {pr.deliveryDate}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {pr.PurchasingGroup?.purchasingGroup ?? "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {pr.requisitioner ?? "—"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${cfg.bg} ${cfg.color} border-0`}
                              >
                                {cfg.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {pr.releaseStatus !== "REL" &&
                                  pr.releaseStatus !== "REJECT" && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          releaseMutation.mutate(pr)
                                        }
                                        className="bg-emerald-500 hover:bg-emerald-600"
                                      >
                                        Release
                                      </Button>

                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                          setSelectedPR(pr);
                                        }}
                                      >
                                        Reject
                                      </Button>
                                    </>
                                  )}
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Dialog
        open={!!selectedPR}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPR(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Reject Purchase Requisition</DialogTitle>

            <DialogDescription>
              Enter rejection reason for PR:
              <span className="ml-1 font-semibold">
                {selectedPR?.purchaseRequisition}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <TextArea
              placeholder="Enter reject reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={5}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedPR(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={() => {
                if (!selectedPR) return;

                rejectMutation.mutate({
                  pr: selectedPR,
                  reason: rejectReason,
                });

                setSelectedPR(null);
                setRejectReason("");
              }}
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject PR"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
