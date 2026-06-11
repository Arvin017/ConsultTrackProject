import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getClient, updateClient, getConsultations } from '../utils/api';
import { format } from 'date-fns';

const inputStyle = { width:'100%', padding:'9px 13px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:'0.875rem', outline:'none' };

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getClient(id), getConsultations({ client: id, limit:20 })])
      .then(([cRes, consRes]) => {
        setClient(cRes.data.client);
        setForm(cRes.data.client);
        setConsultations(consRes.data.consultations);
      })
      .catch(() => { toast.error('Not found'); navigate('/clients'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateClient(id, form);
      setClient(res.data.client);
      setEditing(false);
      toast.success('Saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ textAlign:'center', padding:60, color:'#6366f1' }}>Loading...</div>;

  return (
    <div style={{ maxWidth:800 }}>
      <button onClick={() => navigate('/clients')} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:'0.875rem', padding:0, marginBottom:16 }}>← Back to Clients</button>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:'1.3rem' }}>
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize:'1.4rem', fontWeight:700, color:'#1e1b4b' }}>{client.name}</h1>
            <div style={{ color:'#64748b', fontSize:'0.85rem' }}>{client.email}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} style={{ padding:'8px 16px', background:'#f1f5f9', border:'none', borderRadius:8, cursor:'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ padding:'8px 16px', background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, opacity:saving?0.7:1 }}>Save</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} style={{ padding:'8px 16px', background:'#f1f5f9', border:'none', borderRadius:8, cursor:'pointer', fontWeight:500 }}>Edit</button>
          )}
        </div>
      </div>

      {/* Info */}
      <div style={{ background:'#fff', borderRadius:12, padding:22, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', marginBottom:16 }}>
        <h3 style={{ fontSize:'0.85rem', fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:14 }}>Client Info</h3>
        {editing ? (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[{k:'name',l:'Name'},{k:'email',l:'Email'},{k:'phone',l:'Phone'},{k:'address',l:'Address'}].map(({k,l}) => (
              <div key={k}><label style={{ display:'block', fontSize:'0.78rem', fontWeight:500, marginBottom:4 }}>{l}</label>
                <input style={inputStyle} value={form[k]||''} onChange={e => setForm({...form,[k]:e.target.value})} /></div>
            ))}
            <div style={{ gridColumn:'1/-1' }}><label style={{ display:'block', fontSize:'0.78rem', fontWeight:500, marginBottom:4 }}>Notes</label>
              <textarea style={{ ...inputStyle, minHeight:70, resize:'vertical' }} value={form.notes||''} onChange={e => setForm({...form,notes:e.target.value})} /></div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {[['Phone', client.phone], ['Email', client.email], ['Address', client.address],
              ['DOB', client.dateOfBirth ? format(new Date(client.dateOfBirth), 'MMM d, yyyy') : null],
              ['Client Since', format(new Date(client.createdAt), 'MMM d, yyyy')],
              ['Total Consultations', client.totalConsultations]].map(([label, value]) =>
              value ? <div key={label}><div style={{ fontSize:'0.72rem', fontWeight:500, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>{label}</div>
                <div style={{ fontSize:'0.9rem', color:'#1e293b' }}>{value}</div></div> : null
            )}
            {client.notes && <div style={{ gridColumn:'1/-1' }}><div style={{ fontSize:'0.72rem', fontWeight:500, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>Notes</div>
              <div style={{ fontSize:'0.9rem', color:'#1e293b' }}>{client.notes}</div></div>}
          </div>
        )}
      </div>

      {/* Consultations */}
      <div style={{ background:'#fff', borderRadius:12, padding:22, boxShadow:'0 1px 4px rgba(0,0,0,0.07)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <h3 style={{ fontSize:'0.85rem', fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em' }}>Consultation History</h3>
          <button onClick={() => navigate('/consultations/new')} style={{ color:'#6366f1', background:'none', border:'none', cursor:'pointer', fontWeight:500, fontSize:'0.85rem' }}>+ New</button>
        </div>
        {consultations.length === 0 ? (
          <div style={{ textAlign:'center', padding:20, color:'#94a3b8' }}>No consultations yet.</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {consultations.map(c => (
              <Link key={c._id} to={`/consultations/${c._id}`} style={{ textDecoration:'none', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'#f8fafc', borderRadius:8 }}>
                <div>
                  <div style={{ fontWeight:500, color:'#1e293b', fontSize:'0.875rem' }}>{c.title}</div>
                  <div style={{ color:'#94a3b8', fontSize:'0.75rem' }}>{format(new Date(c.scheduledAt), 'MMM d, yyyy · h:mm a')}</div>
                </div>
                <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'0.72rem', fontWeight:600, background:'#dcfce7', color:'#15803d' }}>{c.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
