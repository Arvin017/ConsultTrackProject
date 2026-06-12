import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createConsultation, getClients } from '../utils/api';

const inputStyle = { width:'100%', padding:'10px 14px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:'0.875rem', outline:'none', background:'#fff' };
const labelStyle = { display:'block', marginBottom:6, fontSize:'0.82rem', fontWeight:600, color:'#374151' };

export default function NewConsultation() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', client: '', scheduledAt: '', duration: 60,
    type: 'initial', status: 'scheduled', notes: '', summary: '',
    followUpDate: '', followUpNotes: '', tags: '', isPrivate: false,
  });

  useEffect(() => {
    getClients({ limit: 100 }).then(res => setClients(res.data.clients)).catch(() => {});
  }, []);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.client || !form.scheduledAt) return toast.error('Fill all required fields');
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        followUpDate: form.followUpDate || undefined,
      };
      const res = await createConsultation(payload);
      toast.success('Consultation created!');
      navigate(`/consultations/${res.data.consultation._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth:700 }}>
      <div style={{ marginBottom:24 }}>
        <button onClick={() => navigate('/consultations')} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:'0.875rem', padding:0, marginBottom:8 }}>
          ← Back to Consultations
        </button>
        <h1 style={{ fontSize:'1.4rem', fontWeight:700, color:'#1e1b4b' }}>New Consultation</h1>
      </div>

      <div style={{ background:'#fff', borderRadius:12, padding:28, boxShadow:'0 1px 4px rgba(0,0,0,0.07)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {/* Title */}
            <div style={{ gridColumn:'1/-1' }}>
              <label style={labelStyle}>Title *</label>
              <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g., Initial Consultation - John Doe" required />
            </div>

            {/* Client */}
            <div>
              <label style={labelStyle}>Client *</label>
              <select style={inputStyle} value={form.client} onChange={e => set('client', e.target.value)} required>
                <option value="">Select a client</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {clients.length === 0 && (
                <p style={{ fontSize:'0.75rem', color:'#f59e0b', marginTop:4 }}>
                  No clients yet.{' '}
                  <button type="button" onClick={() => navigate('/clients')} style={{ color:'#6366f1', background:'none', border:'none', cursor:'pointer', padding:0, fontWeight:500 }}>
                    Add one first →
                  </button>
                </p>
              )}
            </div>

            {/* Date/Time */}
            <div>
              <label style={labelStyle}>Scheduled At *</label>
              <input type="datetime-local" style={inputStyle} value={form.scheduledAt} onChange={e => set('scheduledAt', e.target.value)} required />
            </div>

            {/* Duration */}
            <div>
              <label style={labelStyle}>Duration (minutes)</label>
              <input type="number" style={inputStyle} value={form.duration} min={5} max={480}
                onChange={e => set('duration', e.target.value)} />
            </div>

            {/* Type */}
            <div>
              <label style={labelStyle}>Type</label>
              <select style={inputStyle} value={form.type} onChange={e => set('type', e.target.value)}>
                {['initial','follow-up','emergency','group','online'].map(t =>
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>

            {/* Status */}
            <div>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>
                {['scheduled','in-progress','completed','cancelled','no-show'].map(s =>
                  <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Notes */}
            <div style={{ gridColumn:'1/-1' }}>
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...inputStyle, resize:'vertical', minHeight:90 }} value={form.notes}
                onChange={e => set('notes', e.target.value)} placeholder="Session notes, observations..." />
            </div>

            {/* Summary */}
            <div style={{ gridColumn:'1/-1' }}>
              <label style={labelStyle}>Summary</label>
              <textarea style={{ ...inputStyle, resize:'vertical', minHeight:70 }} value={form.summary}
                onChange={e => set('summary', e.target.value)} placeholder="Key takeaways and outcomes..." />
            </div>

            {/* Follow-up */}
            <div>
              <label style={labelStyle}>Follow-up Date</label>
              <input type="date" style={inputStyle} value={form.followUpDate} onChange={e => set('followUpDate', e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Tags (comma-separated)</label>
              <input style={inputStyle} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="astrology, birth-chart, career" />
            </div>

            {/* Private */}
            <div style={{ gridColumn:'1/-1', display:'flex', alignItems:'center', gap:10 }}>
              <input type="checkbox" id="private" checked={form.isPrivate} onChange={e => set('isPrivate', e.target.checked)}
                style={{ width:16, height:16, cursor:'pointer' }} />
              <label htmlFor="private" style={{ fontSize:'0.875rem', color:'#374151', cursor:'pointer' }}>
                Mark as private (only visible to you)
              </label>
            </div>
          </div>

          <div style={{ display:'flex', gap:12, marginTop:24, justifyContent:'flex-end' }}>
            <button type="button" onClick={() => navigate('/consultations')} style={{
              padding:'10px 20px', background:'#f1f5f9', border:'none', borderRadius:8,
              cursor:'pointer', fontSize:'0.9rem', fontWeight:500, color:'#475569',
            }}>Cancel</button>
            <button type="submit" disabled={loading} style={{
              padding:'10px 24px', background:'linear-gradient(135deg, #6366f1, #4f46e5)',
              color:'#fff', border:'none', borderRadius:8, cursor: loading ? 'not-allowed' : 'pointer',
              fontSize:'0.9rem', fontWeight:600, opacity: loading ? 0.7 : 1,
            }}>{loading ? 'Creating...' : 'Create Consultation'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
