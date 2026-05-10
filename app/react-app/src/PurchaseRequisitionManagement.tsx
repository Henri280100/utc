import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FlexBox,
  FlexBoxDirection,
  FlexBoxAlignItems,
  FlexBoxJustifyContent,
  FlexBoxWrap,
  Title,
  Input,
  Button,
  DatePicker,
  MessageStrip,
  Card,
  Icon,
  BusyIndicator,
  Label,
} from "@ui5/webcomponents-react";

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  REL: { color: "#1a7f5a", bg: "#e6f9f2", label: "Released" },
  PENDING: { color: "#b45309", bg: "#fef9ec", label: "Pending" },
  CLOSED: { color: "#374151", bg: "#f3f4f6", label: "Closed" },
  REJECT: { color: "#b91c1c", bg: "#fef2f2", label: "Rejected" },
};

const FIELD_CONFIGS = [
  {
    key: "material_material",
    label: "Material No.",
    placeholder: "e.g. MAT001",
    required: true,
    icon: "product",
    type: "text",
  },
  {
    key: "plant_plant",
    label: "Plant",
    placeholder: "e.g. 1000",
    required: true,
    icon: "factory",
    type: "text",
  },
  {
    key: "PurchasingGroup_purchasingGroup",
    label: "Purchasing Group",
    placeholder: "e.g. P01",
    required: true,
    icon: "group",
    type: "text",
  },
  {
    key: "quantity",
    label: "Quantity",
    placeholder: "e.g. 10",
    required: true,
    icon: "cart",
    type: "number",
  },
  {
    key: "baseUnit",
    label: "Base Unit",
    placeholder: "EA / KG / PC",
    required: false,
    icon: "measure",
    type: "text",
  },
  {
    key: "requisitioner",
    label: "Requisitioner",
    placeholder: "User ID",
    required: false,
    icon: "employee",
    type: "text",
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
    materialDescriptions?: { materialDescription: string }[];
  };
  plant?: { plant: string; plantName?: string };
  quantity: number;
  deliveryDate: string;
  releaseStatus?: string;
  PurchasingGroup?: { purchasingGroup: string };
  requisitioner?: string;
}

interface Props {
  apiUrl: string;
}

export default function PurchaseRequisitionManagement({ apiUrl }: Props) {
  const queryClient = useQueryClient();
  const [newPR, setNewPR] = useState(EMPTY_FORM);
  const [message, setMessage] = useState<{
    text: string;
    type: "positive" | "negative" | "warning";
  } | null>(null);
  const [formOpen, setFormOpen] = useState(true);

  // ── GET purchase requisitions ──
  const {
    data: prsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["purchaseRequisitions"],
    queryFn: async () => {
      const res = await fetch(
        `${apiUrl}/PurchaseRequisition?$expand=material,plant,PurchasingGroup&$orderby=purchaseRequisition desc`,
      );
      if (!res.ok) throw new Error("Failed to fetch purchase requisitions");
      const json = await res.json();
      return (json.value ?? json) as PR[];
    },
  });

  const prs = prsData ?? [];

  const totalQty = prs.reduce((s, p) => s + (p.quantity || 0), 0);
  const released = prs.filter((p) => p.releaseStatus === "REL").length;
  const pending = prs.filter(
    (p) => !p.releaseStatus || p.releaseStatus === "PENDING",
  ).length;

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
    },
    onError: (err: any) => {
      const detail =
        err?.error?.message || err?.message || "An error occurred.";
      setMessage({ text: detail, type: "negative" });
    },
  });

  const field = (key: keyof typeof EMPTY_FORM) => ({
    value: newPR[key],
    onChange: (e: any) =>
      setNewPR((prev) => ({ ...prev, [key]: e.target.value })),
  });

  const statusCfg = (status?: string) =>
    STATUS_CONFIG[status || "PENDING"] ?? STATUS_CONFIG["PENDING"];

  if (isLoading)
    return (
      <div style={styles.loadingWrap}>
        <BusyIndicator active size="L" />
        <p style={styles.loadingText}>Loading Purchase Requisitions…</p>
      </div>
    );

  if (isError)
    return (
      <div style={styles.loadingWrap}>
        <Icon name="error" style={{ fontSize: "40px", color: "#dc2626" }} />
        <p style={styles.loadingText}>
          Failed to load data. Check your API connection.
        </p>
      </div>
    );

  return (
    <div style={styles.page}>
      {/* ── Page header ── */}
      <div style={styles.pageHeader}>
        <div style={styles.pageHeaderLeft}>
          <div style={styles.headerIcon}>
            <Icon
              name="document-text"
              style={{ fontSize: "22px", color: "#fff" }}
            />
          </div>
          <div>
            <p style={styles.headerSub}>SAP • Procurement Module</p>
            <h1 style={styles.headerTitle}>Purchase Requisitions</h1>
          </div>
        </div>
        <div style={styles.headerBadge}>{prs.length} Records</div>
      </div>

      {/* ── KPI strip ── */}
      <div style={styles.kpiStrip}>
        {[
          {
            label: "Total PRs",
            value: prs.length,
            accent: "#2563eb",
            icon: "document",
          },
          {
            label: "Released",
            value: released,
            accent: "#16a34a",
            icon: "accept",
          },
          {
            label: "Pending Review",
            value: pending,
            accent: "#d97706",
            icon: "pending",
          },
          {
            label: "Total Quantity",
            value: totalQty,
            accent: "#7c3aed",
            icon: "cart",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{ ...styles.kpiCard, borderTop: `3px solid ${kpi.accent}` }}
          >
            <div
              style={{
                ...styles.kpiIcon,
                background: kpi.accent + "18",
                color: kpi.accent,
              }}
            >
              <Icon name={kpi.icon} style={{ fontSize: "18px" }} />
            </div>
            <div>
              <p style={styles.kpiValue}>{kpi.value}</p>
              <p style={styles.kpiLabel}>{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Message ── */}
      {message && (
        <div style={styles.messageWrap}>
          <MessageStrip
            design={
              message.type === "positive"
                ? "Positive"
                : message.type === "warning"
                  ? "Warning"
                  : "Negative"
            }
            onClose={() => setMessage(null)}
          >
            {message.text}
          </MessageStrip>
        </div>
      )}

      <div style={styles.contentGrid}>
        {/* ── LEFT: Create form ── */}
        <div style={styles.formPanel}>
          <div style={styles.panelHeader}>
            <div style={styles.panelHeaderLeft}>
              <div style={styles.panelDot} />
              <span style={styles.panelTitle}>New Requisition</span>
            </div>
            <button
              style={styles.collapseBtn}
              onClick={() => setFormOpen((o) => !o)}
            >
              {formOpen ? "−" : "+"}
            </button>
          </div>

          {formOpen && (
            <div style={styles.formBody}>
              <div style={styles.formTypeTag}>Type: NB — Standard PR</div>

              {FIELD_CONFIGS.map((cfg) => (
                <div key={cfg.key} style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>
                    {cfg.label}
                    {cfg.required && <span style={styles.required}> *</span>}
                  </label>
                  <div style={styles.inputWrap}>
                    <Icon name={cfg.icon} style={styles.inputIcon} />
                    <Input
                      {...field(cfg.key as keyof typeof EMPTY_FORM)}
                      placeholder={cfg.placeholder}
                      style={styles.input}
                    />
                  </div>
                </div>
              ))}

              {/* Delivery Date */}
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>
                  Delivery Date <span style={styles.required}>*</span>
                </label>
                <div style={styles.inputWrap}>
                  <Icon name="appointment-2" style={styles.inputIcon} />
                  <DatePicker
                    value={newPR.deliveryDate}
                    onChange={(e) =>
                      setNewPR((p) => ({ ...p, deliveryDate: e.detail.value }))
                    }
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
              </div>

              <div style={styles.formDivider} />

              <Button
                style={styles.submitBtn}
                onClick={() => createMutation.mutate(newPR)}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <FlexBox
                    alignItems={FlexBoxAlignItems.Center}
                    style={{ gap: "8px" }}
                  >
                    <BusyIndicator active size="S" />
                    <span>Submitting…</span>
                  </FlexBox>
                ) : (
                  <FlexBox
                    alignItems={FlexBoxAlignItems.Center}
                    style={{ gap: "8px" }}
                  >
                    <Icon name="add" />
                    <span>Create Purchase Requisition</span>
                  </FlexBox>
                )}
              </Button>

              <p style={styles.formHint}>
                Fields marked <span style={styles.required}>*</span> are
                mandatory.
              </p>
            </div>
          )}
        </div>

        {/* ── RIGHT: Table ── */}
        <div style={styles.tablePanel}>
          <div style={styles.panelHeader}>
            <div style={styles.panelHeaderLeft}>
              <div style={{ ...styles.panelDot, background: "#2563eb" }} />
              <span style={styles.panelTitle}>Requisition Records</span>
            </div>
            <span style={styles.tableCount}>{prs.length} items</span>
          </div>

          <div style={styles.tableWrap}>
            {prs.length === 0 ? (
              <div style={styles.emptyState}>
                <Icon
                  name="document"
                  style={{ fontSize: "48px", color: "#d1d5db" }}
                />
                <p style={styles.emptyTitle}>No Records Found</p>
                <p style={styles.emptySubtitle}>
                  Create your first purchase requisition using the form.
                </p>
              </div>
            ) : (
              <table style={styles.htmlTable}>
                <thead>
                  <tr>
                    {[
                      "PR Number",
                      "Item",
                      "Material",
                      "Plant",
                      "Qty",
                      "Delivery Date",
                      "Purch. Group",
                      "Requisitioner",
                      "Status",
                    ].map((h) => (
                      <th key={h} style={styles.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {prs.map((pr, i) => {
                    const cfg = statusCfg(pr.releaseStatus);
                    return (
                      <tr
                        key={`${pr.purchaseRequisition}-${pr.purchaseReqnItem}`}
                        style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}
                      >
                        <td style={styles.td}>
                          <span style={styles.prNumber}>
                            {pr.purchaseRequisition}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.itemBadge}>
                            {pr.purchaseReqnItem}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <p style={styles.cellPrimary}>
                            {pr.material?.material ?? "—"}
                          </p>
                          <p style={styles.cellSecondary}>
                            {pr.material?.materialDescriptions?.[0]
                              ?.materialDescription ?? ""}
                          </p>
                        </td>
                        <td style={styles.td}>
                          <p style={styles.cellPrimary}>
                            {pr.plant?.plant ?? "—"}
                          </p>
                          <p style={styles.cellSecondary}>
                            {pr.plant?.plantName ?? ""}
                          </p>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.qtyBadge}>{pr.quantity}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.cellDate}>{pr.deliveryDate}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.cellSecondary}>
                            {pr.PurchasingGroup?.purchasingGroup ?? "—"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.cellSecondary}>
                            {pr.requisitioner ?? "—"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusPill,
                              color: cfg.color,
                              background: cfg.bg,
                              border: `1px solid ${cfg.color}30`,
                            }}
                          >
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── styles ───────────────────────────
const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#f1f5f9",
    minHeight: "100vh",
    padding: "24px 32px",
    boxSizing: "border-box",
  },

  // Header
  pageHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  pageHeaderLeft: { display: "flex", alignItems: "center", gap: "14px" },
  headerIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #1e40af, #3b82f6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px #3b82f640",
  },
  headerSub: {
    margin: 0,
    fontSize: "11px",
    color: "#64748b",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  headerTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    color: "#0f172a",
    lineHeight: 1.2,
  },
  headerBadge: {
    padding: "6px 14px",
    background: "#e0e7ff",
    color: "#3730a3",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
  },

  // KPI
  kpiStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
    marginBottom: "20px",
  },
  kpiCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 1px 4px #0001",
  },
  kpiIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  kpiValue: { margin: 0, fontSize: "22px", fontWeight: 700, color: "#0f172a" },
  kpiLabel: { margin: 0, fontSize: "11px", color: "#64748b", marginTop: "2px" },

  // Message
  messageWrap: { marginBottom: "16px" },

  // Layout
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: "20px",
    alignItems: "start",
  },

  // Panels shared
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px",
    borderBottom: "1px solid #e2e8f0",
  },
  panelHeaderLeft: { display: "flex", alignItems: "center", gap: "10px" },
  panelDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#16a34a",
  },
  panelTitle: { fontSize: "14px", fontWeight: 600, color: "#0f172a" },

  // Form panel
  formPanel: {
    background: "#fff",
    borderRadius: "14px",
    boxShadow: "0 2px 8px #0001",
    overflow: "hidden",
    position: "sticky",
    top: "24px",
  },
  collapseBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    cursor: "pointer",
    fontSize: "18px",
    lineHeight: 1,
    color: "#475569",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  formBody: { padding: "18px" },
  formTypeTag: {
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "11px",
    fontWeight: 600,
    padding: "5px 10px",
    borderRadius: "6px",
    marginBottom: "16px",
    display: "inline-block",
    letterSpacing: "0.04em",
  },
  fieldGroup: { marginBottom: "13px" },
  fieldLabel: {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    color: "#475569",
    marginBottom: "5px",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  required: { color: "#dc2626" },
  inputWrap: { position: "relative" },
  inputIcon: {
    position: "absolute",
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "14px",
    color: "#94a3b8",
    zIndex: 1,
  } as any,
  input: { width: "100%", paddingLeft: "32px", boxSizing: "border-box" } as any,
  formDivider: { height: "1px", background: "#e2e8f0", margin: "16px 0" },
  submitBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #1e40af, #3b82f6)",
    color: "#fff",
    fontWeight: 600,
    borderRadius: "8px",
    height: "40px",
  } as any,
  formHint: {
    margin: "10px 0 0",
    fontSize: "11px",
    color: "#94a3b8",
    textAlign: "center",
  },

  // Table panel
  tablePanel: {
    background: "#fff",
    borderRadius: "14px",
    boxShadow: "0 2px 8px #0001",
    overflow: "hidden",
  },
  tableCount: { fontSize: "12px", color: "#64748b", fontWeight: 500 },
  tableWrap: { overflowX: "auto" },
  htmlTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  } as any,
  th: {
    padding: "10px 14px",
    fontSize: "10px",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    background: "#f8fafc",
    borderBottom: "2px solid #e2e8f0",
    whiteSpace: "nowrap",
    textAlign: "left",
  } as any,
  td: {
    padding: "12px 14px",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "middle",
  } as any,

  // Empty state
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    gap: "10px",
  },
  emptyTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 600,
    color: "#374151",
  },
  emptySubtitle: {
    margin: 0,
    fontSize: "13px",
    color: "#9ca3af",
    textAlign: "center",
  },

  // Table cells
  prNumber: {
    fontFamily: "monospace",
    fontWeight: 700,
    fontSize: "13px",
    color: "#1e40af",
  },
  itemBadge: {
    background: "#f1f5f9",
    color: "#475569",
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
  },
  cellPrimary: {
    margin: 0,
    fontWeight: 600,
    fontSize: "13px",
    color: "#0f172a",
  },
  cellSecondary: {
    margin: 0,
    fontSize: "11px",
    color: "#64748b",
    marginTop: "2px",
  },
  cellDate: { fontSize: "12px", color: "#374151", fontFamily: "monospace" },
  qtyBadge: {
    background: "#ede9fe",
    color: "#6d28d9",
    padding: "2px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  statusPill: {
    padding: "3px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  } as any,
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "60vh",
    gap: "16px",
  },
  loadingText: { margin: 0, fontSize: "14px", color: "#64748b" },
};
