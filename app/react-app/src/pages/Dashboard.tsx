import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

interface Props { apiBase: string; }

// ── Fake trend data (replace with real API calls as needed) ──
const prTrend = [
  { month: 'Nov', count: 28, value: 142 },
  { month: 'Dec', count: 35, value: 198 },
  { month: 'Jan', count: 22, value: 110 },
  { month: 'Feb', count: 41, value: 230 },
  { month: 'Mar', count: 38, value: 205 },
  { month: 'Apr', count: 50, value: 290 },
  { month: 'May', count: 44, value: 265 },
];

const statusDist = [
  { name: 'Released', value: 50, color: '#10b981' },
  { name: 'Pending',  value: 12, color: '#f59e0b' },
  { name: 'Rejected', value: 4,  color: '#ef4444' },
];

const topMaterials = [
  { material: 'MAT001', qty: 48 },
  { material: 'MAT005', qty: 36 },
  { material: 'MAT012', qty: 29 },
  { material: 'MAT003', qty: 22 },
  { material: 'MAT018', qty: 17 },
];

const APPS = [
  {
    path: '/material',
    label: 'Material Master',
    desc: 'Manage raw materials, finished goods, and master data attributes.',
    accent: '#3b82f6',
    bg: '#eff6ff',
    border: '#bfdbfe',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:26,height:26}}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    path: '/plant',
    label: 'Plant',
    desc: 'Configure plants, storage locations, and geographic assignments.',
    accent: '#10b981',
    bg: '#f0fdf4',
    border: '#a7f3d0',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:26,height:26}}>
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
  },
  {
    path: '/purchase',
    label: 'Purchase Requisitions',
    desc: 'Create and track purchase requisitions across all procurement groups.',
    accent: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:26,height:26}}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
];

// ── Custom tooltip ────────────────────────────────────────────
const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={S.tip}>
      <p style={S.tipLabel}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ ...S.tipVal, color: p.color }}>{p.name}: <b>{p.value}</b></p>
      ))}
    </div>
  );
};

export default function Dashboard({ apiBase }: Props) {
  const navigate = useNavigate();

  const { data: materials = [] } = useQuery<any[]>({
    queryKey: ['dash-materials'],
    queryFn: async () => {
      const r = await fetch(`${apiBase}/master-data/MaterialMaster`);
      const j = await r.json(); return j.value ?? j;
    },
  });

  const { data: plants = [] } = useQuery<any[]>({
    queryKey: ['dash-plants'],
    queryFn: async () => {
      const r = await fetch(`${apiBase}/master-data/Plant?$expand=storageLocations`);
      const j = await r.json(); return j.value ?? j;
    },
  });

  const { data: prs = [] } = useQuery<any[]>({
    queryKey: ['dash-prs'],
    queryFn: async () => {
      const r = await fetch(`${apiBase}/purchase-requisitions/PurchaseRequisition`);
      const j = await r.json(); return j.value ?? j;
    },
  });

  const totalSL   = plants.reduce((s: number, p: any) => s + (p.storageLocations?.length ?? 0), 0);
  const released  = prs.filter((p: any) => p.releaseStatus === 'REL').length;
  const pending   = prs.filter((p: any) => p.releaseStatus !== 'REL').length;
  const totalQty  = prs.reduce((s: number, p: any) => s + (p.quantity ?? 0), 0);

  const KPIS = [
    { label: 'Materials',     value: materials.length, sub: 'Active records',        accent: '#3b82f6', bg: '#eff6ff', icon: '📦' },
    { label: 'Plants',        value: plants.length,    sub: `${totalSL} storage locs`, accent: '#10b981', bg: '#f0fdf4', icon: '🏭' },
    { label: 'Total PRs',     value: prs.length,       sub: `${released} released`,  accent: '#6366f1', bg: '#eef2ff', icon: '📋' },
    { label: 'Pending PRs',   value: pending,          sub: 'Awaiting approval',     accent: '#f59e0b', bg: '#fffbeb', icon: '⏳' },
    { label: 'Total Qty',     value: totalQty,         sub: 'Units requested',       accent: '#8b5cf6', bg: '#f5f3ff', icon: '📊' },
    { label: 'Release Rate',  value: prs.length ? `${Math.round(released/prs.length*100)}%` : '—', sub: 'PRs released', accent: '#ec4899', bg: '#fdf2f8', icon: '✅' },
  ];

  return (
    <div style={S.page}>

      {/* ── Hero ── */}
      <div style={S.hero}>
        <div style={S.heroLeft}>
          <p style={S.heroEye}>Good morning, Jane 👋</p>
          <h1 style={S.heroTitle}>Procurement Dashboard</h1>
          <p style={S.heroSub}>
            Here's what's happening across your procurement operations today.
          </p>
        </div>
        <div style={S.heroDate}>
          <p style={S.heroDateDay}>{new Date().toLocaleDateString('en-AU',{weekday:'long'})}</p>
          <p style={S.heroDateFull}>{new Date().toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'})}</p>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div style={S.kpiGrid}>
        {KPIS.map(k => (
          <div key={k.label} style={{ ...S.kpiCard, borderTop: `3px solid ${k.accent}` }}>
            <div style={{ ...S.kpiIcon, background: k.bg, color: k.accent }}>
              <span style={{ fontSize: 20 }}>{k.icon}</span>
            </div>
            <div>
              <p style={{ ...S.kpiVal, color: k.accent }}>{k.value}</p>
              <p style={S.kpiLbl}>{k.label}</p>
              <p style={S.kpiSub}>{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div style={S.chartsRow}>

        {/* PR trend area chart */}
        <div style={{ ...S.card, flex: 2 }}>
          <div style={S.cardHead}>
            <div>
              <p style={S.cardTitle}>Purchase Requisition Trend</p>
              <p style={S.cardSub}>Monthly PR count over last 7 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={prTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="prGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTip/>}/>
              <Area type="monotone" dataKey="count" name="PRs" stroke="#6366f1" strokeWidth={2} fill="url(#prGrad)" dot={{ r: 3, fill: '#6366f1' }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status pie */}
        <div style={{ ...S.card, flex: 1, minWidth: 200 }}>
          <div style={S.cardHead}>
            <div>
              <p style={S.cardTitle}>PR Status</p>
              <p style={S.cardSub}>Distribution by release status</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <PieChart width={120} height={120}>
              <Pie data={statusDist} cx={55} cy={55} innerRadius={34} outerRadius={52} dataKey="value" paddingAngle={3}>
                {statusDist.map((d, i) => <Cell key={i} fill={d.color}/>)}
              </Pie>
            </PieChart>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {statusDist.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, boxShadow: `0 0 5px ${d.color}` }}/>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{d.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginLeft: 'auto' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top materials bar chart */}
        <div style={{ ...S.card, flex: 1.2, minWidth: 220 }}>
          <div style={S.cardHead}>
            <div>
              <p style={S.cardTitle}>Top Materials</p>
              <p style={S.cardSub}>By requisition quantity</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={topMaterials} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="material" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={48}/>
              <Tooltip content={<ChartTip/>}/>
              <Bar dataKey="qty" name="Qty" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── App launchers ── */}
      <div style={S.sectionHead}>
        <p style={S.sectionTitle}>Applications</p>
        <p style={S.sectionSub}>Navigate to a module to manage records</p>
      </div>
      <div style={S.appGrid}>
        {APPS.map(a => (
          <div
            key={a.path}
            style={{ ...S.appCard, borderColor: a.border }}
            onClick={() => navigate(a.path)}
          >
            <div style={{ ...S.appIconWrap, background: a.bg, color: a.accent }}>
              {a.icon}
            </div>
            <div style={S.appInfo}>
              <p style={{ ...S.appLabel, color: a.accent }}>{a.label}</p>
              <p style={S.appDesc}>{a.desc}</p>
            </div>
            <div style={{ ...S.appArrow, color: a.accent }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10M9 4l4 4-4 4"/>
              </svg>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  page:      { padding: '24px 28px', fontFamily: "'DM Sans','Segoe UI',sans-serif", maxWidth: '100%' },

  // Hero
  hero:      { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 },
  heroLeft:  {},
  heroEye:   { fontSize: 13, color: '#64748b', marginBottom: 4 },
  heroTitle: { fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 6 },
  heroSub:   { fontSize: 13, color: '#94a3b8', maxWidth: 440 },
  heroDate:  { textAlign: 'right' as const },
  heroDateDay:  { fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' },
  heroDateFull: { fontSize: 15, fontWeight: 600, color: '#475569' },

  // KPIs
  kpiGrid:   { display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12, marginBottom: 20 },
  kpiCard:   { background: '#fff', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 4px #0001' },
  kpiIcon:   { width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  kpiVal:    { fontSize: 22, fontWeight: 800, fontFamily: "'Syne',sans-serif", lineHeight: 1 },
  kpiLbl:    { fontSize: 11, fontWeight: 600, color: '#374151', marginTop: 2 },
  kpiSub:    { fontSize: 10, color: '#94a3b8', marginTop: 2 },

  // Charts
  chartsRow: { display: 'flex', gap: 14, marginBottom: 24, alignItems: 'flex-start' },
  card:      { background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px #0001' },
  cardHead:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  cardTitle: { fontSize: 13, fontWeight: 700, color: '#0f172a' },
  cardSub:   { fontSize: 10, color: '#94a3b8', marginTop: 2 },

  // Tooltip
  tip:      { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 12px' },
  tipLabel: { fontSize: 11, color: '#94a3b8', marginBottom: 4 },
  tipVal:   { fontSize: 12, fontWeight: 600 },

  // Section
  sectionHead:  { marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#0f172a', fontFamily: "'Syne',sans-serif" },
  sectionSub:   { fontSize: 11, color: '#94a3b8', marginTop: 2 },

  // App launchers
  appGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 },
  appCard: {
    background: '#fff', borderRadius: 14, padding: '18px 20px',
    border: '1.5px solid', display: 'flex', alignItems: 'center', gap: 16,
    cursor: 'pointer', transition: 'transform .15s, box-shadow .15s',
    boxShadow: '0 1px 4px #0001',
  },
  appIconWrap: { width: 52, height: 52, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  appInfo:     { flex: 1 },
  appLabel:    { fontSize: 14, fontWeight: 700, fontFamily: "'Syne',sans-serif" },
  appDesc:     { fontSize: 11, color: '#64748b', marginTop: 4, lineHeight: 1.5 },
  appArrow:    { flexShrink: 0, opacity: 0.6 },
};