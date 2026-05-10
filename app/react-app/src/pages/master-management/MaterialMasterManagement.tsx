import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Input,
  Button,
  Icon,
  BusyIndicator,
  MessageStrip,
  Select,
  Option,
  DatePicker,
} from "@ui5/webcomponents-react";

// ── Types ────────────────────────────────────────────────────
interface MaterialDescription {
  language: string;
  materialDescription: string;
}

interface Material {
  material: string;
  materialType: string;
  industrySector: string;
  baseUnit: string;
  materialGroup_materialGroup?: string;
  creationDate?: string;
  materialDescriptions?: MaterialDescription[];
}

interface Props {
  apiUrl: string;
}

const EMPTY: Omit<Material, "creationDate"> = {
  material: "",
  materialType: "",
  industrySector: "",
  baseUnit: "EA",
  materialGroup_materialGroup: "",
};

const MATERIAL_TYPES = [
  "FERT",
  "HALB",
  "ROH",
  "HIBE",
  "NLAG",
  "DIEN",
  "LEER",
  "VERP",
  "USED",
];
const INDUSTRY_SECTORS = [
  { key: "A", label: "A — Automotive" },
  { key: "M", label: "M — Mechanical Engineering" },
  { key: "P", label: "P — Plant Engineering" },
  { key: "C", label: "C — Chemical" },
  { key: "F", label: "F — Food & Beverage" },
];
const BASE_UNITS = ["EA", "KG", "L", "M", "PC", "SET", "BOX", "PAL"];
type AssociationData = {
  purchasingInfoRecord?: string;
  supplier_supplier?: string;
  materialDocNumber?: string;
  materialDocYear?: string;
  materialDocItem?: string;
  supplierInvoice_supplierInvoice?: string;
  supplierInvoice_fiscalYear?: string;
  material_material?: string;
  plant_plant?: string;
  storageLocation?: string;
  quantity?: number;
  baseUnit?: string;
  purchaseOrderItem_purchaseOrder?: string;
  purchaseOrderItem_purchaseOrderItem?: string;
  movementType?: string;
};
// ── Component ────────────────────────────────────────────────
export default function MaterialMasterManagement({ apiUrl }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [panel, setPanel] = useState<"list" | "form">("list");
  const [associationData, setAssociationData] = useState<AssociationData[]>([]);

  const set = (k: keyof typeof EMPTY) => (e: any) =>
    setForm((p) => ({ ...p, [k]: e.target?.value ?? e.detail?.value ?? e }));

  // GET
  const { data: materials = [], isLoading } = useQuery<Material[]>({
    queryKey: ["materials"],
    queryFn: async () => {
      const res = await fetch(
        `${apiUrl}/MaterialMaster?$expand=materialDescriptions`,
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const j = await res.json();
      return j.value ?? j;
    },
  });

  const filtered = materials.filter(
    (m) =>
      m.material.toLowerCase().includes(search.toLowerCase()) ||
      m.materialType?.toLowerCase().includes(search.toLowerCase()) ||
      m.materialDescriptions?.[0]?.materialDescription
        ?.toLowerCase()
        .includes(search.toLowerCase()),
  );

  // CREATE
  const createMut = useMutation({
    mutationFn: async (data: typeof EMPTY) => {
      const res = await fetch(`${apiUrl}/MaterialMaster`, {
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
      qc.invalidateQueries({ queryKey: ["materials"] });
      setMsg({ text: "Material created successfully.", ok: true });
      setForm(EMPTY);
      setPanel("list");
    },
    onError: (e: any) =>
      setMsg({ text: e?.error?.message || "Create failed.", ok: false }),
  });

  // UPDATE
  const updateMut = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof EMPTY }) => {
      const res = await fetch(`${apiUrl}/MaterialMaster('${id}')`, {
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
      qc.invalidateQueries({ queryKey: ["materials"] });
      setMsg({ text: "Material updated successfully.", ok: true });
      setEditing(null);
      setForm(EMPTY);
      setPanel("list");
    },
    onError: (e: any) =>
      setMsg({ text: e?.error?.message || "Update failed.", ok: false }),
  });

  const startEdit = (m: Material) => {
    setForm({
      material: m.material,
      materialType: m.materialType,
      industrySector: m.industrySector,
      baseUnit: m.baseUnit,
      materialGroup_materialGroup: m.materialGroup_materialGroup ?? "",
    });
    setEditing(m.material);
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

  const addAssociation = () => {
    setAssociationData([...associationData, {}]);
  };

  const removeAssociation = (index: number) => {
    setAssociationData(associationData.filter((_, i) => i !== index));
  };

  const submitAssociationData = async () => {
    try {
      const res = await fetch(`${apiUrl}/MaterialMaster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          infoRecords: associationData
            .filter((a) => a.purchasingInfoRecord)
            .map((a) => ({
              purchasingInfoRecord: a.purchasingInfoRecord,
              material_material: form.material,
              supplier_supplier: a.supplier_supplier,
            })),
          materialDoc: associationData
            .filter((a) => a.materialDocNumber)
            .map((a) => ({
              materialDocNumber: a.materialDocNumber,
              materialDocYear: a.materialDocYear,
              materialDocItem: a.materialDocItem,
              supplierInvoice_supplierInvoice:
                a.supplierInvoice_supplierInvoice,
              supplierInvoice_fiscalYear: a.supplierInvoice_fiscalYear,
              material_material: form.material,
              plant_plant: a.plant_plant,
              storageLocation: a.storageLocation,
              quantity: a.quantity,
              baseUnit: a.baseUnit,
              purchaseOrderItem_purchaseOrder:
                a.purchaseOrderItem_purchaseOrder,
              purchaseOrderItem_purchaseOrderItem:
                a.purchaseOrderItem_purchaseOrderItem,
              movementType: a.movementType,
            })),
        }),
      });
      if (!res.ok) throw await res.json();
      setMsg({ text: "Material master created successfully", ok: true });
      setAssociationData([]);
      setForm(EMPTY);
      qc.invalidateQueries({ queryKey: ["materials"] });
    } catch (e: Error | any) {
      setMsg({ text: e.message, ok: false });
    }
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <div
            style={{
              ...S.headerIcon,
              background: "linear-gradient(135deg,#0f4c75,#1b6ca8)",
            }}
          >
            <Icon name="product" style={{ fontSize: "20px", color: "#fff" }} />
          </div>
          <div>
            <p style={S.headerSub}>Master Data</p>
            <h1 style={S.headerTitle}>Material Master</h1>
          </div>
        </div>
        <div style={S.headerRight}>
          <div style={S.statChip}>
            <span style={S.statNum}>{materials.length}</span>
            <span style={S.statLbl}>Materials</span>
          </div>
          <Button onClick={startCreate} style={S.newBtn}>
            <Icon name="add" /> &nbsp;New Material
          </Button>
        </div>
      </div>

      {/* Message */}
      {msg && (
        <div style={{ marginBottom: 14 }}>
          <MessageStrip
            design={msg.ok ? "Positive" : "Negative"}
            onClose={() => setMsg(null)}
          >
            {msg.text}
          </MessageStrip>
        </div>
      )}

      <div style={S.body}>
        {/* ── FORM PANEL ── */}
        {panel === "form" && (
          <div style={S.formCard}>
            <div style={S.formHeader}>
              <div style={S.formHeaderDot} />
              <span style={S.formHeaderTitle}>
                {editing ? `Edit — ${editing}` : "New Material"}
              </span>
            </div>
            <div style={S.formBody}>
              {[
                {
                  key: "material",
                  label: "Material No. *",
                  placeholder: "e.g. MAT001",
                  disabled: !!editing,
                },
                {
                  key: "materialGroup_materialGroup",
                  label: "Material Group",
                  placeholder: "e.g. USED_CARS",
                },
              ].map((f) => (
                <div key={f.key} style={S.field}>
                  <label style={S.label}>{f.label}</label>
                  <Input
                    value={(form as any)[f.key]}
                    onInput={set(f.key as any)}
                    placeholder={f.placeholder}
                    disabled={f.disabled}
                    style={S.input}
                  />
                </div>
              ))}

              <div style={S.field}>
                <label style={S.label}>Material Type *</label>
                <Select
                  style={S.input}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      materialType: (e.detail.selectedOption as any).value,
                    }))
                  }
                >
                  <Option value="">— Select —</Option>
                  {MATERIAL_TYPES.map((t) => (
                    <Option
                      key={t}
                      value={t}
                      selected={form.materialType === t}
                    >
                      {t}
                    </Option>
                  ))}
                </Select>
              </div>

              <div style={S.field}>
                <label style={S.label}>Industry Sector *</label>
                <Select
                  style={S.input}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      industrySector: (e.detail.selectedOption as any).value,
                    }))
                  }
                >
                  <Option value="">— Select —</Option>
                  {INDUSTRY_SECTORS.map((s) => (
                    <Option
                      key={s.key}
                      value={s.key}
                      selected={form.industrySector === s.key}
                    >
                      {s.label}
                    </Option>
                  ))}
                </Select>
              </div>

              <div style={S.field}>
                <label style={S.label}>Base Unit *</label>
                <Select
                  style={S.input}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      baseUnit: (e.detail.selectedOption as any).value,
                    }))
                  }
                >
                  {BASE_UNITS.map((u) => (
                    <Option key={u} value={u} selected={form.baseUnit === u}>
                      {u}
                    </Option>
                  ))}
                </Select>
              </div>
              {associationData.map((a, index) => (
                <div key={index}>
                  <Input
                    type="text"
                    value={a.purchasingInfoRecord}
                    onChange={(e) =>
                      setAssociationData((p) =>
                        p.map((_, i) =>
                          i === index
                            ? { ...a, purchasingInfoRecord: e.target.value }
                            : _,
                        ),
                      )
                    }
                    placeholder="Purchasing Info Record"
                  />
                  <Input
                    type="text"
                    value={a.supplier_supplier}
                    onChange={(e) =>
                      setAssociationData((p) =>
                        p.map((_, i) =>
                          i === index
                            ? { ...a, supplier_supplier: e.target.value }
                            : _,
                        ),
                      )
                    }
                    placeholder="Supplier"
                  />
                  {/* ... other association fields ... */}
                  <Button onClick={() => removeAssociation(index)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button onClick={addAssociation}>Add Association</Button>
              <div style={S.formActions}>
                <button style={S.cancelBtn} onClick={cancel}>
                  Cancel
                </button>
                <button
                  style={S.submitBtn}
                  onClick={submit}
                  disabled={isPending}
                >
                  {isPending
                    ? "Saving…"
                    : editing
                      ? "Update Material"
                      : "Create Material"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── LIST PANEL ── */}
        <div
          style={{ ...S.listCard, flex: panel === "form" ? "1" : "1 1 100%" }}
        >
          <div style={S.listHeader}>
            <div style={S.searchWrap}>
              <Icon name="search" style={S.searchIcon} />
              <input
                style={S.searchInput}
                placeholder="Search by material, type, description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span style={S.listCount}>{filtered.length} records</span>
          </div>

          {isLoading ? (
            <div style={S.center}>
              <BusyIndicator active size="L" />
            </div>
          ) : (
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {[
                      "Material",
                      "Description",
                      "Type",
                      "Sector",
                      "Base Unit",
                      "Group",
                      "Actions",
                    ].map((h) => (
                      <th key={h} style={S.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, i) => (
                    <tr
                      key={m.material}
                      style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}
                    >
                      <td style={S.td}>
                        <span style={S.matCode}>{m.material}</span>
                      </td>
                      <td style={S.td}>
                        <span style={S.cellPrimary}>
                          {m.materialDescriptions?.[0]?.materialDescription ??
                            "—"}
                        </span>
                      </td>
                      <td style={S.td}>
                        <span style={S.typeBadge}>{m.materialType}</span>
                      </td>
                      <td style={S.td}>
                        <span style={S.cellMuted}>{m.industrySector}</span>
                      </td>
                      <td style={S.td}>
                        <span style={S.unitBadge}>{m.baseUnit}</span>
                      </td>
                      <td style={S.td}>
                        <span style={S.cellMuted}>
                          {m.materialGroup_materialGroup ?? "—"}
                        </span>
                      </td>
                      <td style={S.td}>
                        <button style={S.editBtn} onClick={() => startEdit(m)}>
                          <Icon name="edit" style={{ fontSize: "13px" }} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={S.empty}>
                  <Icon
                    name="product"
                    style={{ fontSize: "40px", color: "#d1d5db" }}
                  />
                  <p style={S.emptyTxt}>No materials found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
    background: "#f1f5f9",
    minHeight: "100vh",
    padding: "24px 32px",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 14 },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px #1b6ca840",
  },
  headerSub: {
    margin: 0,
    fontSize: 11,
    color: "#64748b",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
  },
  headerTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },
  statChip: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "6px 16px",
  },
  statNum: { fontSize: 18, fontWeight: 700, color: "#0f172a" },
  statLbl: {
    fontSize: 10,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  newBtn: {
    background: "linear-gradient(135deg,#0f4c75,#1b6ca8)",
    color: "#fff",
    fontWeight: 600,
    borderRadius: 8,
  } as any,
  body: { display: "flex", gap: 20, alignItems: "flex-start" },

  // Form
  formCard: {
    width: 340,
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 2px 8px #0001",
    overflow: "hidden",
    flexShrink: 0,
  },
  formHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 18px",
    borderBottom: "1px solid #e2e8f0",
  },
  formHeaderDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#0f4c75",
  },
  formHeaderTitle: { fontSize: 14, fontWeight: 600, color: "#0f172a" },
  formBody: { padding: 18 },
  field: { marginBottom: 14 },
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: "#475569",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  input: { width: "100%" } as any,
  formActions: { display: "flex", gap: 10, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    padding: "9px 0",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13,
  },
  submitBtn: {
    flex: 2,
    padding: "9px 0",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg,#0f4c75,#1b6ca8)",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13,
  },

  // List
  listCard: {
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 2px 8px #0001",
    overflow: "hidden",
  },
  listHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid #e2e8f0",
  },
  searchWrap: { position: "relative", flex: 1, maxWidth: 360 },
  searchIcon: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 14,
    color: "#94a3b8",
  } as any,
  searchInput: {
    width: "100%",
    padding: "8px 12px 8px 34px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: 13,
    outline: "none",
    background: "#f8fafc",
    boxSizing: "border-box",
  },
  listCount: { fontSize: 12, color: "#64748b", fontWeight: 500 },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 } as any,
  th: {
    padding: "10px 14px",
    fontSize: 10,
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
    padding: "11px 14px",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "middle",
  } as any,
  center: { display: "flex", justifyContent: "center", padding: 60 },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "50px 20px",
    gap: 10,
  },
  emptyTxt: { margin: 0, color: "#9ca3af", fontSize: 14 },

  // Cell styles
  matCode: {
    fontFamily: "monospace",
    fontWeight: 700,
    fontSize: 13,
    color: "#0f4c75",
  },
  cellPrimary: { fontWeight: 500, color: "#0f172a" },
  cellMuted: { color: "#64748b", fontSize: 12 },
  typeBadge: {
    background: "#dbeafe",
    color: "#1e40af",
    padding: "2px 8px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
  },
  unitBadge: {
    background: "#f0fdf4",
    color: "#166534",
    padding: "2px 8px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
  },
  editBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 12px",
    borderRadius: 7,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#374151",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 12,
  },
};
