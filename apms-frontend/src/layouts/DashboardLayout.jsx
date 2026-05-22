import React, { useState, useContext, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/* ─── SVG Icons ─── */
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const Icons = {
  dashboard:   ['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
  people:      ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  project:     ['M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z', 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'],
  student:     ['M22 10v6M2 10l10-5 10 5-10 5z', 'M6 12v5c3 3 9 3 12 0v-5'],
  meeting:     ['M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'],
  certificate: ['M12 15l-2 5L8 18l-3 2 1-3L1 12l5-1 2-5 2 5 5 1-4 5z'],
  analytics:   ['M18 20V10', 'M12 20V4', 'M6 20v-6'],
  bell:        ['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 0 1-3.46 0'],
  logout:      ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  menu:        ['M3 12h18', 'M3 6h18', 'M3 18h18'],
  close:       ['M18 6L6 18', 'M6 6l12 12'],
  chevron:     'M6 9l6 6 6-6',
  user:        ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  submissions: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M16 13H8M16 17H8M10 9H8'],
};

const NavIcon = ({ name }) => <Icon d={Icons[name] || Icons.dashboard} size={17} />;

/* ─── Role menu config ─── */
const getMenuItems = (role) => {
  const common = [{ text: 'Dashboard', icon: 'dashboard', path: '/dashboard' }];
  switch (role) {
    case 'ADMIN':
      return [...common, { text: 'User Management', icon: 'people', path: '/faculty' },

      ];
    case 'HOD':
      return [...common, { text: 'Department Faculty', icon: 'people', path: '/department/faculty' }];
    case 'PRINCIPAL':
      return [...common, { text: 'College Analytics', icon: 'analytics', path: '/analytics' }];
    case 'FACULTY':
      return [
        ...common,
        { text: 'My Projects',  icon: 'project',     path: '/projects'     },
        { text: 'My Students',  icon: 'student',     path: '/students'     },
        { text: 'Submissions',  icon: 'submissions', path: '/submissions'  },
        { text: 'Meetings',     icon: 'meeting',     path: '/meetings'     },
        { text: 'Create Students',     icon: 'people',     path: '/create-students'     },
      ];
    case 'STUDENT':
      return [
        ...common,
        { text: 'My Project',   icon: 'project',     path: '/my-project'  },
        { text: 'Meetings',     icon: 'meeting',     path: '/meetings'    },
        { text: 'Certificates', icon: 'certificate', path: '/certificates'},
      ];
    default:
      return common;
  }
};

const roleColors = {
  ADMIN:     { bg: '#fdf5f5', text: '#8b1a1a' },
  HOD:       { bg: '#fdf5f5', text: '#8b1a1a' },
  PRINCIPAL: { bg: '#fdf5f5', text: '#8b1a1a' },
  FACULTY:   { bg: '#fdf5f5', text: '#8b1a1a' },
  STUDENT:   { bg: '#fdf5f5', text: '#8b1a1a' },
};

/* ─── Component ─── */
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = getMenuItems(user?.role);
  const activeItem = menuItems.find(item => location.pathname.startsWith(item.path));
  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'U';

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; font-family: 'DM Sans', sans-serif; }

        .dl-root {
          display: flex;
          height: 100vh;
          background: #f5f0eb;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── SIDEBAR ── */
        .dl-sidebar {
          width: 248px;
          flex-shrink: 0;
          background: #8b1a1a;
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: relative;
          z-index: 100;
          transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
        }

        .dl-sidebar-dots {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .dl-sidebar-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.06);
          pointer-events: none;
        }

        .dl-sr1 { width: 320px; height: 320px; top: -120px; right: -120px; }
        .dl-sr2 { width: 180px; height: 180px; bottom: 40px; left: -80px; }

        /* Brand */
        .dl-brand {
          padding: 1.5rem 1.25rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 2;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 0.5rem;
        }

        .dl-brand-logo {
          width: 40px; height: 40px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 13px; font-weight: 700; color: #fff;
          flex-shrink: 0;
        }

        .dl-brand-text { flex: 1; min-width: 0; }

        .dl-brand-name {
          font-size: 13px; font-weight: 600; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          line-height: 1.3;
        }

        .dl-brand-sub {
          font-size: 10px; color: rgba(255,255,255,0.4);
          letter-spacing: 1.5px; text-transform: uppercase;
          margin-top: 2px;
        }

        /* Nav section label */
        .dl-nav-label {
          font-size: 9.5px; font-weight: 600;
          color: rgba(255,255,255,0.3);
          letter-spacing: 1.8px; text-transform: uppercase;
          padding: 0.75rem 1.25rem 0.4rem;
          position: relative; z-index: 2;
        }

        /* Nav */
        .dl-nav {
          flex: 1;
          padding: 0.25rem 0.75rem;
          overflow-y: auto;
          position: relative; z-index: 2;
        }

        .dl-nav::-webkit-scrollbar { width: 0; }

        .dl-nav-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 14px;
          border-radius: 10px;
          cursor: pointer;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.55);
          font-size: 13.5px;
          font-weight: 400;
          font-family: 'DM Sans', sans-serif;
          width: 100%;
          text-align: left;
          transition: all 0.18s;
          margin-bottom: 2px;
          position: relative;
        }

        .dl-nav-item:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        .dl-nav-item.active {
          background: rgba(255,255,255,0.15);
          color: #fff;
          font-weight: 500;
        }

        .dl-nav-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 3px;
          background: #d4a017;
          border-radius: 0 3px 3px 0;
        }

        .dl-nav-icon {
          flex-shrink: 0;
          display: flex; align-items: center;
          opacity: 0.8;
        }

        .dl-nav-item.active .dl-nav-icon,
        .dl-nav-item:hover .dl-nav-icon { opacity: 1; }

        /* Sidebar user card */
        .dl-sidebar-user {
          margin: 0.75rem;
          padding: 12px 14px;
          background: rgba(255,255,255,0.08);
          border: 0.5px solid rgba(255,255,255,0.13);
          border-radius: 12px;
          display: flex; align-items: center; gap: 10px;
          position: relative; z-index: 2;
        }

        .dl-sidebar-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: #d4a017;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 600; color: #fff;
          flex-shrink: 0;
        }

        .dl-sidebar-uname {
          font-size: 13px; font-weight: 500; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          line-height: 1.3;
        }

        .dl-sidebar-urole {
          font-size: 10px; color: rgba(255,255,255,0.4);
          text-transform: uppercase; letter-spacing: 0.8px;
        }

        .dl-sidebar-logout {
          margin-left: auto;
          background: none; border: none;
          color: rgba(255,255,255,0.4);
          cursor: pointer; padding: 4px;
          display: flex; align-items: center;
          border-radius: 6px;
          transition: all 0.15s;
          flex-shrink: 0;
        }

        .dl-sidebar-logout:hover {
          color: #fff;
          background: rgba(255,255,255,0.1);
        }

        /* ── MAIN AREA ── */
        .dl-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
        }

        /* TOPBAR */
        .dl-topbar {
          height: 62px;
          background: #fff;
          border-bottom: 0.5px solid #ede8e0;
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          gap: 1rem;
          flex-shrink: 0;
          position: relative;
          z-index: 10;
        }

        .dl-hamburger {
          display: none;
          background: none; border: none;
          cursor: pointer; color: #666;
          padding: 6px; border-radius: 8px;
          transition: background 0.15s;
        }

        .dl-hamburger:hover { background: #f5f0eb; }

        .dl-page-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700;
          color: #1a0a0a; flex: 1;
        }

        .dl-topbar-right {
          display: flex; align-items: center; gap: 8px;
        }

        /* Breadcrumb */
        .dl-breadcrumb {
          font-size: 12px; color: #bbb;
          display: flex; align-items: center; gap: 5px;
        }

        .dl-breadcrumb span { color: #8b1a1a; font-weight: 500; }

        /* Notification bell */
        .dl-notif-btn {
          width: 36px; height: 36px;
          background: #faf8f5;
          border: 1px solid #ede8e0;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #888;
          transition: all 0.15s;
          position: relative;
        }

        .dl-notif-btn:hover { background: #f5f0eb; color: #8b1a1a; }

        .dl-notif-dot {
          position: absolute; top: 7px; right: 8px;
          width: 6px; height: 6px;
          background: #8b1a1a; border-radius: 50%;
          border: 1.5px solid #fff;
        }

        /* Profile dropdown */
        .dl-profile-wrap {
          position: relative;
        }

        .dl-profile-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 5px 10px 5px 6px;
          background: #faf8f5;
          border: 1px solid #ede8e0;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .dl-profile-btn:hover { background: #f5f0eb; border-color: #d8cfc5; }

        .dl-profile-avatar {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: #8b1a1a;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 600; color: #fff;
        }

        .dl-profile-name {
          font-size: 13px; font-weight: 500; color: #1a0a0a;
          white-space: nowrap;
        }

        .dl-profile-role-badge {
          font-size: 10px;
          background: #fdf5f5;
          color: #8b1a1a;
          border: 0.5px solid rgba(139,26,26,0.2);
          border-radius: 5px;
          padding: 2px 7px;
          font-weight: 500;
        }

        .dl-chevron {
          color: #bbb;
          transition: transform 0.2s;
          display: flex; align-items: center;
        }

        .dl-chevron.open { transform: rotate(180deg); }

        /* Dropdown menu */
        .dl-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #fff;
          border: 0.5px solid #ede8e0;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.1);
          min-width: 200px;
          overflow: hidden;
          z-index: 999;
          animation: dropIn 0.15s ease;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .dl-dropdown-header {
          padding: 14px 16px 12px;
          border-bottom: 0.5px solid #f0ebe3;
        }

        .dl-dd-name {
          font-size: 14px; font-weight: 500; color: #1a0a0a;
        }

        .dl-dd-email {
          font-size: 12px; color: #bbb; margin-top: 2px;
        }

        .dl-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 16px;
          font-size: 13.5px; color: #444;
          cursor: pointer;
          background: none; border: none;
          width: 100%; text-align: left;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
        }

        .dl-dropdown-item:hover { background: #faf8f5; color: #1a0a0a; }

        .dl-dropdown-item.danger { color: #c0392b; }
        .dl-dropdown-item.danger:hover { background: #fdf0f0; }

        .dl-dropdown-divider {
          height: 0.5px; background: #f0ebe3;
          margin: 2px 0;
        }

        /* ── CONTENT ── */
        .dl-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 1.75rem 2rem;
          background: #f5f0eb;
        }

        .dl-content::-webkit-scrollbar { width: 5px; }
        .dl-content::-webkit-scrollbar-track { background: transparent; }
        .dl-content::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }

        /* Mobile overlay */
        .dl-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 90;
          backdrop-filter: blur(2px);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .dl-sidebar {
            position: fixed;
            left: 0; top: 0; bottom: 0;
            transform: translateX(-100%);
            z-index: 200;
          }

          .dl-sidebar.open {
            transform: translateX(0);
          }

          .dl-overlay.open { display: block; }

          .dl-hamburger { display: flex; }

          .dl-profile-name,
          .dl-profile-role-badge { display: none; }

          .dl-content { padding: 1.25rem 1rem; }
        }
      `}</style>

      <div className="dl-root">

        {/* ── SIDEBAR ── */}
        <aside className={`dl-sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="dl-sidebar-dots" />
          <div className="dl-sidebar-ring dl-sr1" />
          <div className="dl-sidebar-ring dl-sr2" />

          <div className="dl-brand">
            <div className="dl-brand-logo">PEC</div>
            <div className="dl-brand-text">
              <div className="dl-brand-name">Prathyusha EC</div>
              <div className="dl-brand-sub">APMS Portal</div>
            </div>
          </div>

          <div className="dl-nav-label">Navigation</div>

          <nav className="dl-nav">
            {menuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.text}
                  className={`dl-nav-item${isActive ? ' active' : ''}`}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                >
                  <span className="dl-nav-icon">
                    <NavIcon name={item.icon} />
                  </span>
                  {item.text}
                </button>
              );
            })}
          </nav>

          <div className="dl-sidebar-user">
            <div className="dl-sidebar-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="dl-sidebar-uname">{user?.name || 'User'}</div>
              <div className="dl-sidebar-urole">{user?.role?.toLowerCase() || 'user'}</div>
            </div>
            <button className="dl-sidebar-logout" onClick={handleLogout} title="Logout">
              <NavIcon name="logout" />
            </button>
          </div>
        </aside>

        {/* Mobile overlay */}
        <div
          className={`dl-overlay${sidebarOpen ? ' open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* ── MAIN ── */}
        <div className="dl-main">

          {/* TOPBAR */}
          <header className="dl-topbar">
            <button className="dl-hamburger" onClick={() => setSidebarOpen(s => !s)} aria-label="Toggle menu">
              {sidebarOpen ? <NavIcon name="close" /> : <NavIcon name="menu" />}
            </button>

            <div style={{ flex: 1 }}>
              <div className="dl-page-title">
                {activeItem?.text || 'Dashboard'}
              </div>
              <div className="dl-breadcrumb">
                APMS &rsaquo; <span>{activeItem?.text || 'Dashboard'}</span>
              </div>
            </div>

            <div className="dl-topbar-right">
              {/* Notification */}
              <div className="dl-notif-btn" title="Notifications">
                <NavIcon name="bell" />
                <div className="dl-notif-dot" />
              </div>

              {/* Profile */}
              <div className="dl-profile-wrap" ref={profileRef}>
                <button
                  className="dl-profile-btn"
                  onClick={() => setProfileOpen(p => !p)}
                >
                  <div className="dl-profile-avatar">{initials}</div>
                  <span className="dl-profile-name">{user?.name || 'User'}</span>
                  <span className="dl-profile-role-badge">{user?.role || 'USER'}</span>
                  <span className={`dl-chevron${profileOpen ? ' open' : ''}`}>
                    <NavIcon name="chevron" />
                  </span>
                </button>

                {profileOpen && (
                  <div className="dl-dropdown">
                    <div className="dl-dropdown-header">
                      <div className="dl-dd-name">{user?.name || 'User'}</div>
                      <div className="dl-dd-email">{user?.email || ''}</div>
                    </div>
                    <button
                      className="dl-dropdown-item"
                      onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                    >
                      <NavIcon name="user" /> My Profile
                    </button>
                    <div className="dl-dropdown-divider" />
                    <button className="dl-dropdown-item danger" onClick={handleLogout}>
                      <NavIcon name="logout" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="dl-content">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;