import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats, getConsultations } from '../utils/api';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  scheduled: { bg: '#dbeafe', color: '#1d4ed8' },
  'in-progress': { bg: '#fef9c3', color: '#a16207' },
  completed: { bg: '#dcfce7', color: '#15803d' },
  cancelled: { bg: '#fee2e2', color: '#b91c1c' },
  'no-show': { bg: '#f3e8ff', color: '#7c3aed' },
};

const StatCard = ({ label, value, icon, color }) => (
  <div style={{ background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', display:'flex', alignItems:'center', gap:16 }}>
    <div style={{ width:48, height:48, borderRadius:10, background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>{icon}</div>
    <div>
      <div style={{ fontSize:'1.6rem', fontWeight:700, color:'#1e293b' }}>{value}</div>
      <div style={{ fontSize:'0.8rem', color:'#64748b', fontWeight:500 }}>{label}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getConsultations({ limit: 5 })])
      .then(([statsRes, consultRes]) => {
        setStats(statsRes.data.stats);
        setRecent(consultRes.data.consultations);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign:'center', padding:40, color:'#6366f1' }}>Loading dashboard...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:700, color:'#1e1b4b' }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color:'#64748b', marginTop:4 }}>Here's your consultation overview</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:28 }}>
        <StatCard label="Total Consultations" value={stats?.total || 0} icon="📋" color="#ede9fe" />
        <StatCard label="Completed" value={stats?.completed || 0} icon="✅" color="#dcfce7" />
        <StatCard label="Upcoming" value={stats?.scheduled || 0} icon="📅" color="#dbeafe" />
        <StatCard label="This Month" value={stats?.thisMonth || 0} icon="📈" color="#fef9c3" />
      </div>

      {/* Recent Consultations */}
      <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', overflow:'hidden' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h2 style={{ fontSize:'1rem', fontWeight:600, color:'#1e293b' }}>Recent Consultations</h2>
          <Link to="/consultations" style={{ color:'#6366f1', textDecoration:'none', fontSize:'0.85rem', fontWeight:500 }}>View all →</Link>
        </div>

        {recent.length === 0 ? (
          <div style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>
            <div style={{ fontSize:'2rem', marginBottom:8 }}>🗂️</div>
            <p>No consultations yet.</p>
            <Link to="/consultations/new" style={{ color:'#6366f1', textDecoration:'none', fontWeight:500 }}>Create your first →</Link>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc' }}>
                {['Title', 'Client', 'Date', 'Status', ''].map(h => (
                  <th key={h} style={{ padding:'10px 20px', textAlign:'left', fontSize:'0.78rem', fontWeight:600, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((c, i) => (
                <tr key={c._id} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding:'14px 20px', fontWeight:500, color:'#1e293b', fontSize:'0.9rem' }}>{c.title}</td>
                  <td style={{ padding:'14px 20px', color:'#475569', fontSize:'0.85rem' }}>{c.client?.name || '—'}</td>
                  <td style={{ padding:'14px 20px', color:'#64748b', fontSize:'0.85rem' }}>
                    {format(new Date(c.scheduledAt), 'MMM d, yyyy')}
                  </td>
                  <td style={{ padding:'14px 20px' }}>
                    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'0.75rem', fontWeight:600, ...STATUS_COLORS[c.status] }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding:'14px 20px' }}>
                    <Link to={`/consultations/${c._id}`} style={{ color:'#6366f1', textDecoration:'none', fontSize:'0.85rem' }}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
