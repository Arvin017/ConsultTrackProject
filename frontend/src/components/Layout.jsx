import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/consultations', label: 'Consultations', icon: '🗂️' },
  { to: '/clients', label: 'Clients', icon: '👥' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
        color: '#fff', display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, left: 0, height: '100vh', zIndex: 100,
        transform: sidebarOpen ? 'translateX(0)' : window.innerWidth < 768 ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.3s'
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
            🎙️ ConsultTrack
          </div>
          <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: 4 }}>Recording Manager</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: 8, textDecoration: 'none', marginBottom: 4,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
              background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
              fontWeight: isActive ? 600 : 400, fontSize: '0.9rem',
              transition: 'all 0.2s',
            })}>
              <span>{icon}</span> {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{user?.name}</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.6, marginBottom: 12 }}>{user?.email}</div>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '8px', background: 'rgba(255,255,255,0.1)',
            color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer',
            fontSize: '0.8rem', transition: 'background 0.2s',
          }}>Sign Out</button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <header style={{
          height: 60, background: '#fff', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', padding: '0 24px',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ flex: 1 }} />
          <button onClick={() => navigate('/consultations/new')} style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff',
            border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            + New Consultation
          </button>
        </header>

        <div style={{ flex: 1, padding: '24px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
