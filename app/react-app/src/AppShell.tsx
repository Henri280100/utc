import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

const NAV = [
  {
    path: '/',
    label: 'Dashboard',
    sublabel: 'Overview',
    accent: '#6366f1',
    glow: '#6366f115',
    grad: 'linear-gradient(135deg,#3730a3,#6366f1)',
    dot: '#a5b4fc',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    path: '/material',
    label: 'Material Master',
    sublabel: 'Master Data',
    accent: '#3b82f6',
    glow: '#3b82f615',
    grad: 'linear-gradient(135deg,#1e3a8a,#3b82f6)',
    dot: '#93c5fd',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    path: '/plant',
    label: 'Plant',
    sublabel: 'Master Data',
    accent: '#10b981',
    glow: '#10b98115',
    grad: 'linear-gradient(135deg,#064e3b,#10b981)',
    dot: '#6ee7b7',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
  },
  {
    path: '/purchase',
    label: 'Purchase Req.',
    sublabel: 'Procurement',
    accent: '#f59e0b',
    glow: '#f59e0b15',
    grad: 'linear-gradient(135deg,#78350f,#f59e0b)',
    dot: '#fcd34d',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
];

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const active = NAV.slice(1).find(n => location.pathname.startsWith(n.path)) ?? NAV[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; overflow: hidden; }
        body { font-family: 'DM Sans', sans-serif; background: #08090d; }
        .shell { display: flex; height: 100vh; overflow: hidden; }
        .sidebar {
          width: ${collapsed ? '64px' : '210px'};
          flex-shrink: 0; background: #0b0d16; border-right: 1px solid #1a1d2e;
          display: flex; flex-direction: column;
          transition: width .28s cubic-bezier(.4,0,.2,1);
          overflow: hidden; z-index: 20;
        }
        .sb-top {
          padding: 18px 14px; border-bottom: 1px solid #1a1d2e;
          display: flex; align-items: center; gap: 10px;
        }
        .logo-mark {
          width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg,#312e81,#6366f1);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 18px #6366f130;
        }
        .logo-mark svg { width: 16px; height: 16px; color:#fff; }
        .logo-text { overflow:hidden; white-space:nowrap; opacity:${collapsed?0:1}; transition:opacity .18s; flex:1; }
        .logo-text h2 { font-family:'Syne',sans-serif; font-size:14px; font-weight:800; color:#f1f5f9; letter-spacing:-.02em; }
        .logo-text p  { font-size:9px; color:#475569; text-transform:uppercase; letter-spacing:.1em; margin-top:1px; }
        .sb-toggle {
          flex-shrink:0; width:22px; height:22px; border-radius:6px;
          border:1px solid #1a1d2e; background:#10121e; color:#3f4a65; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:color .15s,background .15s;
        }
        .sb-toggle:hover { color:#94a3b8; background:#1a1d2e; }
        .sb-nav { padding:14px 10px; flex:1; }
        .sb-lbl {
          font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.12em;
          color:#2d3348; padding:0 8px; margin-bottom:4px;
          opacity:${collapsed?0:1}; transition:opacity .15s; white-space:nowrap;
        }
        a.nav-link { text-decoration:none; display:block; margin-bottom:2px; }
        .nav-item {
          display:flex; align-items:center; gap:10px;
          padding:9px 10px; border-radius:10px; cursor:pointer;
          border:1px solid transparent; white-space:nowrap; overflow:hidden;
          transition:background .15s,border-color .15s;
        }
        .nav-item:hover { background:#10121e; }
        .nav-item.active { background:var(--ng); border-color:var(--nd); }
        .nav-icon {
          width:32px; height:32px; border-radius:8px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          transition:background .2s,box-shadow .2s;
        }
        .nav-icon svg { width:15px; height:15px; }
        .nav-item.active  .nav-icon { background:var(--ngr); box-shadow:0 0 12px var(--ng); color:#fff; }
        .nav-item:not(.active) .nav-icon { background:#10121e; color:#3f4a65; }
        .nav-item:not(.active):hover .nav-icon { color:#64748b; }
        .nav-txt { flex:1; overflow:hidden; opacity:${collapsed?0:1}; transition:opacity .15s; }
        .nav-lbl { font-size:12px; font-weight:600; color:#64748b; display:block; }
        .nav-item.active .nav-lbl { color:#f1f5f9; }
        .nav-sub { font-size:9px; color:#2d3348; display:block; }
        .nav-dot {
          width:5px; height:5px; border-radius:50%; background:var(--ndot); flex-shrink:0;
          box-shadow:0 0 5px var(--ndot); opacity:${collapsed?0:1}; transition:opacity .15s;
        }
        .sb-footer { padding:14px 14px; border-top:1px solid #1a1d2e; }
        .user-row { display:flex; align-items:center; gap:10px; }
        .avatar {
          width:30px; height:30px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,#312e81,#6366f1);
          display:flex; align-items:center; justify-content:center;
          font-family:'Syne',sans-serif; font-size:11px; font-weight:700; color:#fff;
        }
        .user-info { overflow:hidden; opacity:${collapsed?0:1}; transition:opacity .15s; }
        .u-name { font-size:11px; font-weight:600; color:#cbd5e1; display:block; white-space:nowrap; }
        .u-role { font-size:9px; color:#3f4a65; display:block; white-space:nowrap; }
        .main { flex:1; display:flex; flex-direction:column; overflow:hidden; background:#f1f5f9; }
        .topbar {
          height:48px; background:#fff; border-bottom:1px solid #e2e8f0;
          display:flex; align-items:center; padding:0 20px; gap:14px; flex-shrink:0;
        }
        .breadcrumb { display:flex; align-items:center; gap:6px; font-size:11px; }
        .bc-root { color:#94a3b8; font-weight:500; cursor:pointer; }
        .bc-root:hover { color:#64748b; }
        .bc-sep { color:#cbd5e1; }
        .bc-section { color:#64748b; }
        .bc-active { color:#0f172a; font-weight:600; }
        .tb-spacer { flex:1; }
        .tb-pill {
          display:flex; align-items:center; gap:5px; padding:4px 10px;
          border-radius:999px; border:1px solid var(--pb); background:var(--pbg);
          font-size:10px; font-weight:600; color:var(--pc);
        }
        .tb-dot { width:5px; height:5px; border-radius:50%; background:var(--pc); box-shadow:0 0 4px var(--pc); }
        .content { flex:1; overflow-y:auto; }
      `}</style>

      <div className="shell">
        <aside className="sidebar">
          <div className="sb-top">
            <div className="logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="logo-text"><h2>SAP Nexus</h2><p>Procurement Suite</p></div>
            <button className="sb-toggle" onClick={() => setCollapsed(c => !c)}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8">
                {collapsed ? <path d="M3 1l4 4-4 4"/> : <path d="M7 1L3 5l4 4"/>}
              </svg>
            </button>
          </div>

          <nav className="sb-nav">
            {!collapsed && <p className="sb-lbl">Navigation</p>}
            {NAV.map(n => (
              <NavLink key={n.path} to={n.path} end={n.path==='/'} className="nav-link" title={collapsed ? n.label : undefined}>
                {({ isActive }) => (
                  <div className={`nav-item${isActive?' active':''}`}
                    style={{'--ng':n.glow,'--ngr':n.grad,'--ndot':n.dot,'--nd':n.accent+'30'} as any}>
                    <div className="nav-icon">{n.icon}</div>
                    <div className="nav-txt">
                      <span className="nav-lbl">{n.label}</span>
                      <span className="nav-sub">{n.sublabel}</span>
                    </div>
                    {isActive && <div className="nav-dot"/>}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="sb-footer">
            <div className="user-row">
              <div className="avatar">JD</div>
              <div className="user-info">
                <span className="u-name">Jane Doe</span>
                <span className="u-role">Procurement Officer</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="main">
          <header className="topbar" style={{'--pb':active.accent+'40','--pbg':active.glow,'--pc':active.accent} as any}>
            <nav className="breadcrumb">
              <span className="bc-root" onClick={()=>navigate('/')}>SAP Nexus</span>
              <span className="bc-sep">›</span>
              <span className="bc-section">{active.sublabel}</span>
              <span className="bc-sep">›</span>
              <span className="bc-active">{active.label}</span>
            </nav>
            <div className="tb-spacer"/>
            <div className="tb-pill"><div className="tb-dot"/>{active.label}</div>
          </header>
          <div className="content"><Outlet/></div>
        </div>
      </div>
    </>
  );
}