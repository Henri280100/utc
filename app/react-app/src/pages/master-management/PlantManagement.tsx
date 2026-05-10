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
} from "@ui5/webcomponents-react";

// ── Types ────────────────────────────────────────────────────
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

// ── Component ────────────────────────────────────────────────
export default function PlantManagement({ apiUrl }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [panel, setPanel] = useState<"list" | "form">("list");
  const [expandedPlant, setExpandedPlant] = useState<string | null>(null);

  const set = (k: keyof typeof EMPTY) => (e: any) =>
    setForm((p) => ({ ...p, [k]: e.target?.value ?? e.detail?.value ?? e }));

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
    },
    onError: (e: any) =>
      setMsg({ text: e?.error?.message || "Create failed.", ok: false }),
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
    },
    onError: (e: any) =>
      setMsg({ text: e?.error?.message || "Update failed.", ok: false }),
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

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.headerIcon}>
            <Icon name="factory" style={{ fontSize: "20px", color: "#fff" }} />
          </div>
          <div>
            <p style={S.headerSub}>Master Data</p>
            <h1 style={S.headerTitle}>Plant Management</h1>
          </div>
        </div>
        <div style={S.headerRight}>
          <div style={S.statChip}>
            <span style={S.statNum}>{plants.length}</span>
            <span style={S.statLbl}>Plants</span>
          </div>
          <div style={{ ...S.statChip, borderColor: "#d1fae5" }}>
            <span style={{ ...S.statNum, color: "#059669" }}>
              {plants.reduce(
                (s, p) => s + (p.storageLocations?.length ?? 0),
                0,
              )}
            </span>
            <span style={S.statLbl}>Storage Locs</span>
          </div>
          <Button onClick={startCreate} style={S.newBtn}>
            <Icon name="add" /> &nbsp;New Plant
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
                {editing ? `Edit — ${editing}` : "New Plant"}
              </span>
            </div>
            <div style={S.formBody}>
              {[
                {
                  key: "plant",
                  label: "Plant Code *",
                  placeholder: "e.g. 1000",
                  disabled: !!editing,
                },
                {
                  key: "plantName",
                  label: "Plant Name *",
                  placeholder: "e.g. Sydney Branch",
                },
                { key: "city", label: "City *", placeholder: "e.g. Sydney" },
              ].map((f) => (
                <div key={f.key} style={S.field}>
                  <label style={S.label}>{f.label}</label>
                  <Input
                    value={(form as any)[f.key]}
                    onInput={set(f.key as keyof typeof EMPTY)}
                    placeholder={f.placeholder}
                    disabled={f.disabled}
                    style={S.input}
                  />
                </div>
              ))}

              <div style={S.field}>
                <label style={S.label}>Country *</label>
                <Select
                  style={S.input}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      country_code: (e.detail.selectedOption as any).value,
                    }))
                  }
                >
                  <Option value="">— Select Country —</Option>
                  {COUNTRIES.map((c) => (
                    <Option
                      key={c.code}
                      value={c.code}
                      selected={form.country_code === c.code}
                    >
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </div>

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
                      ? "Update Plant"
                      : "Create Plant"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── LIST PANEL ── */}
        <div style={{ ...S.listCard, flex: "1" }}>
          <div style={S.listHeader}>
            <div style={S.searchWrap}>
              <Icon name="search" style={S.searchIcon} />
              <input
                style={S.searchInput}
                placeholder="Search by plant, name, city…"
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
                      "",
                      "Plant",
                      "Name",
                      "City",
                      "Country",
                      "Storage Locs",
                      "Actions",
                    ].map((h, i) => (
                      <th key={i} style={S.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const expanded = expandedPlant === p.plant;
                    const slCount = p.storageLocations?.length ?? 0;
                    return (
                      <>
                        <tr
                          key={p.plant}
                          style={{
                            background: i % 2 === 0 ? "#fff" : "#f8fafc",
                          }}
                        >
                          <td style={{ ...S.td, width: 32 }}>
                            {slCount > 0 && (
                              <button
                                style={S.expandBtn}
                                onClick={() =>
                                  setExpandedPlant(expanded ? null : p.plant)
                                }
                              >
                                {expanded ? "▾" : "▸"}
                              </button>
                            )}
                          </td>
                          <td style={S.td}>
                            <span style={S.plantCode}>{p.plant}</span>
                          </td>
                          <td style={S.td}>
                            <span style={S.cellPrimary}>{p.plantName}</span>
                          </td>
                          <td style={S.td}>
                            <span style={S.cellMuted}>{p.city}</span>
                          </td>
                          <td style={S.td}>
                            <span style={S.countryBadge}>
                              {p.country_code} — {countryName(p.country_code)}
                            </span>
                          </td>
                          <td style={S.td}>
                            <span
                              style={{
                                ...S.slBadge,
                                background: slCount > 0 ? "#f0fdf4" : "#f8fafc",
                                color: slCount > 0 ? "#166534" : "#94a3b8",
                              }}
                            >
                              {slCount} loc{slCount !== 1 ? "s" : ""}
                            </span>
                          </td>
                          <td style={S.td}>
                            <button
                              style={S.editBtn}
                              onClick={() => startEdit(p)}
                            >
                              <Icon name="edit" style={{ fontSize: "13px" }} />{" "}
                              Edit
                            </button>
                          </td>
                        </tr>
                        {expanded &&
                          p.storageLocations?.map((sl) => (
                            <tr
                              key={sl.storageLocation}
                              style={{ background: "#eff6ff" }}
                            >
                              <td style={S.td} />
                              <td
                                style={{ ...S.td, paddingLeft: 28 }}
                                colSpan={2}
                              >
                                <span style={S.slCode}>
                                  ⬡ {sl.storageLocation}
                                </span>
                              </td>
                              <td style={S.td} colSpan={4}>
                                <span style={S.cellMuted}>
                                  {sl.storageLocationName ?? "—"}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={S.empty}>
                  <Icon
                    name="factory"
                    style={{ fontSize: "40px", color: "#d1d5db" }}
                  />
                  <p style={S.emptyTxt}>No plants found</p>
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
    background: "#f0fdf4",
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
    background: "linear-gradient(135deg,#065f46,#059669)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px #05966940",
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
    background: "linear-gradient(135deg,#065f46,#059669)",
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
    background: "#059669",
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
    background: "linear-gradient(135deg,#065f46,#059669)",
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
    background: "#f0fdf4",
    borderBottom: "2px solid #d1fae5",
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
  plantCode: {
    fontFamily: "monospace",
    fontWeight: 700,
    fontSize: 13,
    color: "#065f46",
  },
  cellPrimary: { fontWeight: 500, color: "#0f172a" },
  cellMuted: { color: "#64748b", fontSize: 12 },
  countryBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "2px 8px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
  },
  slBadge: {
    padding: "2px 8px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
  },
  slCode: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#1e40af",
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
  expandBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#64748b",
    fontSize: 14,
    padding: "2px 4px",
    borderRadius: 4,
  },
};
