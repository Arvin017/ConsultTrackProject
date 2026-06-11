import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getConsultations, deleteConsultation } from '../utils/api';
import { format } from 'date-fns';

const STATUS_COLORS = {
  scheduled: { bg: '#dbeafe', color: '#1d4ed8' },
  'in-progress': { bg: '#fef9c3', color: '#a16207' },
  completed: { bg: '#dcfce7', color: '#15803d' },
  cancelled: { bg: '#fee2e2', color: '#b91c1c' },
  'no-show': { bg: '#f3e8ff', color: '#7c3aed' },
};

const TYPE_LABELS = { initial:'Initial', 'follow-up':'Follow-up', emergency:'Emergency', group:'Group', online:'Online' };

export default function Consultations() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', type: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getConsultations({ ...filters, page, limit: 10 });
      setConsultations(res.data.consultations);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Failed to load consultations');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this consultation?')) return;
    try {
      await deleteConsultation(id);
      toast.success('Deleted');
      fetchData();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:700, color:'#1e1b4b' }}>Consultations</h1>
          <p style={{ color:'#64748b', fontSize:'0.85rem', marginTop:2 }}>{total} total records</p>
        </div>
        <button onClick={() => navigate('/consultations/new')} style={{
          background:'linear-gradient(135deg, #6366f1, #4f46e5)', color:'#fff',
          border:'none', borderRadius:8, padding:'10px 20px', cursor:'pointer', fontWeight:600, fontSize:'0.9rem',
        }}>+ New</button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <input
          placeholder="Search consultations..."
          value={filters.search}
          onChange={e => { setFilters({...filters, search: e.target.value}); setPage(1); }}
          style={{ flex:1, minWidth:200, padding:'9px 14px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:'0.875rem', outline:'none' }}
        />
        <select value={filters.status} onChange={e => { setFilters({...filters, status: e.target.value}); setPage(1); }}
          style={{ padding:'9px 14px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:'0.875rem', outline:'none', background:'#fff' }}>
          <option value="">All Statuses</option>
          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.type} onChange={e => { setFilters({...filters, type: e.target.value}); setPage(1); }}
          style={{ padding:'9px 14px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:'0.875rem', outline:'none', background:'#fff' }}>
          <option value="">All Types</option>
          {Object.keys(TYPE_LABELS).map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:40, textAlign:'center', color:'#6366f1' }}>Loading...</div>
        ) : consultations.length === 0 ? (
          <div style={{ padding:50, textAlign:'center', color:'#94a3b8' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:8 }}>🗂️</div>
            <p style={{ marginBottom:12 }}>No consultations found</p>
            <button onClick={() => navigate('/consultations/new')} style={{ color:'#6366f1', background:'none', border:'none', cursor:'pointer', fontWeight:500 }}>
              Create your first consultation →
            </button>
          </div>
        ) : (
          <>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f8fafc' }}>
                  {['Title', 'Client', 'Date & Time', 'Type', 'Status', 'Recordings', 'Actions'].map(h => (
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:'0.75rem', fontWeight:600, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {consultations.map((c, i) => (
                  <tr key={c._id} onClick={() => navigate(`/consultations/${c._id}`)}
                    style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none', cursor:'pointer', transition:'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <td style={{ padding:'13px 16px', fontWeight:500, color:'#1e293b', fontSize:'0.875rem' }}>{c.title}</td>
                    <td style={{ padding:'13px 16px', color:'#475569', fontSize:'0.85rem' }}>{c.client?.name || '—'}</td>
                    <td style={{ padding:'13px 16px', color:'#64748b', fontSize:'0.82rem' }}>
                      <div>{format(new Date(c.scheduledAt), 'MMM d, yyyy')}</div>
                      <div style={{ fontSize:'0.75rem', color:'#94a3b8' }}>{format(new Date(c.scheduledAt), 'h:mm a')}</div>
                    </td>
                    <td style={{ padding:'13px 16px', color:'#64748b', fontSize:'0.82rem' }}>{TYPE_LABELS[c.type]}</td>
                    <td style={{ padding:'13px 16px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'0.73rem', fontWeight:600, ...STATUS_COLORS[c.status] }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding:'13px 16px', color:'#64748b', fontSize:'0.85rem' }}>
                      {c.recordings?.length > 0 ? `🎙️ ${c.recordings.length}` : '—'}
                    </td>
                    <td style={{ padding:'13px 16px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display:'flex', gap:8 }}>
                        <Link to={`/consultations/${c._id}`} style={{ color:'#6366f1', textDecoration:'none', fontSize:'0.8rem', fontWeight:500 }}>View</Link>
                        <button onClick={e => handleDelete(c._id, e)} style={{ color:'#ef4444', background:'none', border:'none', cursor:'pointer', fontSize:'0.8rem', fontWeight:500, padding:0 }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding:'16px 20px', display:'flex', gap:8, justifyContent:'center', borderTop:'1px solid #f1f5f9' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} style={{
                    width:32, height:32, borderRadius:6, border:'1.5px solid',
                    borderColor: p === page ? '#6366f1' : '#e2e8f0',
                    background: p === page ? '#6366f1' : '#fff',
                    color: p === page ? '#fff' : '#475569',
                    cursor:'pointer', fontSize:'0.85rem', fontWeight: p === page ? 600 : 400,
                  }}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
