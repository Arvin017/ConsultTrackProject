import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getClients, createClient, deleteClient } from '../utils/api';

const inputStyle = { width:'100%', padding:'9px 13px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:'0.875rem', outline:'none' };

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', phone:'', dateOfBirth:'', address:'', notes:'' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getClients({ search, limit:50 });
      setClients(res.data.clients);
    } catch { toast.error('Failed to load clients'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Name is required');
    setSaving(true);
    try {
      await createClient(form);
      toast.success('Client added!');
      setShowAdd(false);
      setForm({ name:'', email:'', phone:'', dateOfBirth:'', address:'', notes:'' });
      fetchData();
    } catch { toast.error('Failed to add'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this client?')) return;
    await deleteClient(id);
    toast.success('Deleted');
    fetchData();
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:700, color:'#1e1b4b' }}>Clients</h1>
          <p style={{ color:'#64748b', fontSize:'0.85rem', marginTop:2 }}>{clients.length} clients</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff',
          border:'none', borderRadius:8, padding:'10px 20px', cursor:'pointer', fontWeight:600, fontSize:'0.9rem',
        }}>+ Add Client</button>
      </div>

      {/* Search */}
      <input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ ...inputStyle, marginBottom:20, maxWidth:380 }} />

      {/* Add Modal */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
          <div style={{ background:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto' }}>
            <h2 style={{ fontSize:'1.1rem', fontWeight:700, marginBottom:20 }}>Add New Client</h2>
            <form onSubmit={handleAdd}>
              {[
                { key:'name', label:'Full Name *', type:'text' },
                { key:'email', label:'Email', type:'email' },
                { key:'phone', label:'Phone', type:'tel' },
                { key:'dateOfBirth', label:'Date of Birth', type:'date' },
                { key:'address', label:'Address', type:'text' },
              ].map(({ key, label, type }) => (
                <div key={key} style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:'0.8rem', fontWeight:500, marginBottom:5 }}>{label}</label>
                  <input type={type} style={inputStyle} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} />
                </div>
              ))}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:'0.8rem', fontWeight:500, marginBottom:5 }}>Notes</label>
                <textarea style={{ ...inputStyle, minHeight:70, resize:'vertical' }} value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} />
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ padding:'9px 18px', background:'#f1f5f9', border:'none', borderRadius:8, cursor:'pointer', fontWeight:500 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding:'9px 20px', background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, opacity:saving?0.7:1 }}>
                  {saving ? 'Saving...' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign:'center', padding:40, color:'#6366f1' }}>Loading...</div>
      ) : clients.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color:'#94a3b8' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:8 }}>👥</div>
          <p>No clients yet.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
          {clients.map(c => (
            <div key={c._id} onClick={() => navigate(`/clients/${c._id}`)}
              style={{ background:'#fff', borderRadius:12, padding:18, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', cursor:'pointer', transition:'all 0.15s', border:'1.5px solid transparent' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='#6366f1'}
              onMouseLeave={e => e.currentTarget.style.borderColor='transparent'}
            >
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:'1rem' }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <button onClick={e => handleDelete(c._id, e)} style={{ color:'#ef4444', background:'none', border:'none', cursor:'pointer', fontSize:'1rem' }}>🗑</button>
              </div>
              <div style={{ marginTop:12 }}>
                <div style={{ fontWeight:600, color:'#1e293b', fontSize:'0.95rem' }}>{c.name}</div>
                {c.email && <div style={{ color:'#64748b', fontSize:'0.8rem', marginTop:2 }}>{c.email}</div>}
                {c.phone && <div style={{ color:'#64748b', fontSize:'0.8rem' }}>{c.phone}</div>}
                <div style={{ marginTop:10, padding:'4px 10px', background:'#ede9fe', borderRadius:20, display:'inline-block', fontSize:'0.75rem', fontWeight:500, color:'#6d28d9' }}>
                  {c.totalConsultations} consultation{c.totalConsultations !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
