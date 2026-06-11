import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { getConsultation, updateConsultation, deleteConsultation, uploadRecording, deleteRecording, uploadAttachment } from '../utils/api';

const STATUS_COLORS = {
  scheduled: { bg:'#dbeafe', color:'#1d4ed8' }, 'in-progress': { bg:'#fef9c3', color:'#a16207' },
  completed: { bg:'#dcfce7', color:'#15803d' }, cancelled: { bg:'#fee2e2', color:'#b91c1c' },
  'no-show': { bg:'#f3e8ff', color:'#7c3aed' },
};

export default function ConsultationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [uploadingRec, setUploadingRec] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recStartRef = useRef(null);

  const fetchData = async () => {
    try {
      const res = await getConsultation(id);
      setConsultation(res.data.consultation);
      setEditForm(res.data.consultation);
    } catch { toast.error('Failed to load'); navigate('/consultations'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleSave = async () => {
    try {
      const res = await updateConsultation(id, editForm);
      setConsultation(res.data.consultation);
      setEditing(false);
      toast.success('Saved!');
    } catch { toast.error('Save failed'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this consultation permanently?')) return;
    await deleteConsultation(id);
    toast.success('Deleted');
    navigate('/consultations');
  };

  // Live recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const duration = Math.round((Date.now() - recStartRef.current) / 1000);
        const formData = new FormData();
        formData.append('recording', blob, `recording-${Date.now()}.webm`);
        formData.append('duration', duration);
        setUploadingRec(true);
        try {
          await uploadRecording(id, formData);
          toast.success('Recording saved!');
          fetchData();
        } catch { toast.error('Upload failed'); }
        finally { setUploadingRec(false); }
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      recStartRef.current = Date.now();
      setIsRecording(true);
    } catch { toast.error('Microphone access denied'); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleUploadRecording = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('recording', file);
    setUploadingRec(true);
    try {
      await uploadRecording(id, formData);
      toast.success('Recording uploaded!');
      fetchData();
    } catch { toast.error('Upload failed'); }
    finally { setUploadingRec(false); e.target.value = ''; }
  };

  const handleDeleteRecording = async (recId) => {
    if (!window.confirm('Delete this recording?')) return;
    await deleteRecording(id, recId);
    toast.success('Recording deleted');
    fetchData();
  };

  const handleUploadAttachment = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await uploadAttachment(id, formData);
      toast.success('File attached!');
      fetchData();
    } catch { toast.error('Upload failed'); }
    finally { e.target.value = ''; }
  };

  const formatBytes = (b) => b > 1024*1024 ? `${(b/1024/1024).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`;
  const formatDuration = (s) => s > 60 ? `${Math.floor(s/60)}m ${s%60}s` : `${s}s`;

  if (loading) return <div style={{ textAlign:'center', padding:60, color:'#6366f1' }}>Loading...</div>;
  if (!consultation) return null;

  const c = consultation;
  const inputStyle = { width:'100%', padding:'8px 12px', border:'1.5px solid #e2e8f0', borderRadius:6, fontSize:'0.875rem', outline:'none' };

  return (
    <div style={{ maxWidth:900 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <button onClick={() => navigate('/consultations')} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:'0.875rem', padding:0, marginBottom:6 }}>← Back</button>
          <h1 style={{ fontSize:'1.4rem', fontWeight:700, color:'#1e1b4b' }}>{c.title}</h1>
          <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:6 }}>
            <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'0.75rem', fontWeight:600, ...STATUS_COLORS[c.status] }}>{c.status}</span>
            <span style={{ color:'#94a3b8', fontSize:'0.8rem' }}>{format(new Date(c.scheduledAt), 'MMMM d, yyyy · h:mm a')}</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} style={{ padding:'8px 16px', background:'#f1f5f9', border:'none', borderRadius:8, cursor:'pointer', fontWeight:500 }}>Cancel</button>
              <button onClick={handleSave} style={{ padding:'8px 16px', background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>Save</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} style={{ padding:'8px 16px', background:'#f1f5f9', border:'none', borderRadius:8, cursor:'pointer', fontWeight:500 }}>Edit</button>
              <button onClick={handleDelete} style={{ padding:'8px 16px', background:'#fee2e2', color:'#b91c1c', border:'none', borderRadius:8, cursor:'pointer', fontWeight:500 }}>Delete</button>
            </>
          )}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Details */}
        <div style={{ background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', gridColumn:'1/-1' }}>
          <h3 style={{ fontSize:'0.9rem', fontWeight:600, color:'#64748b', marginBottom:14, textTransform:'uppercase', letterSpacing:'0.05em' }}>Details</h3>
          {editing ? (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div><label style={{ fontSize:'0.8rem', fontWeight:500, display:'block', marginBottom:4 }}>Title</label>
                <input style={inputStyle} value={editForm.title || ''} onChange={e => setEditForm({...editForm, title:e.target.value})} /></div>
              <div><label style={{ fontSize:'0.8rem', fontWeight:500, display:'block', marginBottom:4 }}>Status</label>
                <select style={inputStyle} value={editForm.status} onChange={e => setEditForm({...editForm, status:e.target.value})}>
                  {['scheduled','in-progress','completed','cancelled','no-show'].map(s=><option key={s} value={s}>{s}</option>)}
                </select></div>
              <div style={{ gridColumn:'1/-1' }}><label style={{ fontSize:'0.8rem', fontWeight:500, display:'block', marginBottom:4 }}>Notes</label>
                <textarea style={{ ...inputStyle, minHeight:80, resize:'vertical' }} value={editForm.notes||''} onChange={e => setEditForm({...editForm, notes:e.target.value})} /></div>
              <div style={{ gridColumn:'1/-1' }}><label style={{ fontSize:'0.8rem', fontWeight:500, display:'block', marginBottom:4 }}>Summary</label>
                <textarea style={{ ...inputStyle, minHeight:70, resize:'vertical' }} value={editForm.summary||''} onChange={e => setEditForm({...editForm, summary:e.target.value})} /></div>
              <div><label style={{ fontSize:'0.8rem', fontWeight:500, display:'block', marginBottom:4 }}>Follow-up Date</label>
                <input type="date" style={inputStyle} value={editForm.followUpDate ? editForm.followUpDate.substring(0,10) : ''} onChange={e => setEditForm({...editForm, followUpDate:e.target.value})} /></div>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <InfoRow label="Client" value={c.client?.name || '—'} />
              <InfoRow label="Type" value={c.type} />
              <InfoRow label="Duration" value={`${c.duration} min`} />
              <InfoRow label="Follow-up" value={c.followUpDate ? format(new Date(c.followUpDate), 'MMM d, yyyy') : 'None'} />
              {c.notes && <div style={{ gridColumn:'1/-1' }}><InfoRow label="Notes" value={c.notes} /></div>}
              {c.summary && <div style={{ gridColumn:'1/-1' }}><InfoRow label="Summary" value={c.summary} /></div>}
              {c.tags?.length > 0 && (
                <div style={{ gridColumn:'1/-1' }}>
                  <div style={{ fontSize:'0.75rem', fontWeight:500, color:'#94a3b8', marginBottom:6, textTransform:'uppercase' }}>Tags</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {c.tags.map(t => <span key={t} style={{ padding:'2px 10px', borderRadius:20, background:'#ede9fe', color:'#6d28d9', fontSize:'0.78rem', fontWeight:500 }}>{t}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recordings */}
        <div style={{ background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', gridColumn:'1/-1' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ fontSize:'0.9rem', fontWeight:600, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em' }}>🎙️ Recordings ({c.recordings?.length || 0})</h3>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={isRecording ? stopRecording : startRecording} style={{
                padding:'7px 14px', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:'0.8rem',
                background: isRecording ? '#fee2e2' : '#dcfce7', color: isRecording ? '#b91c1c' : '#15803d',
              }}>
                {isRecording ? '⏹ Stop Recording' : '🔴 Record Live'}
              </button>
              <label style={{ padding:'7px 14px', background:'#f1f5f9', borderRadius:8, cursor:'pointer', fontWeight:500, fontSize:'0.8rem', color:'#475569' }}>
                📁 Upload File
                <input type="file" accept="audio/*,video/*" hidden onChange={handleUploadRecording} />
              </label>
            </div>
          </div>

          {isRecording && (
            <div style={{ padding:'12px 16px', background:'#fee2e2', borderRadius:8, marginBottom:12, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:'#ef4444', animation:'pulse 1s infinite' }} />
              <span style={{ color:'#b91c1c', fontWeight:500, fontSize:'0.875rem' }}>Recording in progress... Click Stop when done.</span>
            </div>
          )}

          {uploadingRec && <div style={{ padding:12, background:'#ede9fe', borderRadius:8, marginBottom:12, color:'#6d28d9', fontSize:'0.875rem' }}>Uploading recording...</div>}

          {!c.recordings?.length ? (
            <div style={{ textAlign:'center', padding:24, color:'#94a3b8', fontSize:'0.875rem' }}>No recordings yet. Record live or upload a file.</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {c.recordings.map((rec, i) => (
                <div key={rec._id} style={{ padding:'12px 16px', background:'#f8fafc', borderRadius:8, display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'0.85rem', fontWeight:500, color:'#1e293b', marginBottom:2 }}>{rec.originalName || `Recording ${i+1}`}</div>
                    <div style={{ fontSize:'0.75rem', color:'#94a3b8' }}>
                      {rec.duration ? formatDuration(rec.duration) : ''}{rec.size ? ` · ${formatBytes(rec.size)}` : ''} · {format(new Date(rec.uploadedAt), 'MMM d, h:mm a')}
                    </div>
                  </div>
                  <audio controls src={rec.url} style={{ height:32 }} />
                  <button onClick={() => handleDeleteRecording(rec._id)} style={{ color:'#ef4444', background:'none', border:'none', cursor:'pointer', fontSize:'1.1rem' }}>🗑</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attachments */}
        <div style={{ background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', gridColumn:'1/-1' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ fontSize:'0.9rem', fontWeight:600, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em' }}>📎 Attachments ({c.attachments?.length || 0})</h3>
            <label style={{ padding:'7px 14px', background:'#f1f5f9', borderRadius:8, cursor:'pointer', fontWeight:500, fontSize:'0.8rem', color:'#475569' }}>
              + Attach File
              <input type="file" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png" hidden onChange={handleUploadAttachment} />
            </label>
          </div>
          {!c.attachments?.length ? (
            <div style={{ textAlign:'center', padding:20, color:'#94a3b8', fontSize:'0.875rem' }}>No attachments yet.</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {c.attachments.map((att) => (
                <div key={att._id} style={{ padding:'10px 14px', background:'#f8fafc', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:'0.85rem', fontWeight:500, color:'#1e293b' }}>{att.originalName}</div>
                    <div style={{ fontSize:'0.75rem', color:'#94a3b8' }}>{att.size ? formatBytes(att.size) : ''}</div>
                  </div>
                  <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ color:'#6366f1', fontSize:'0.8rem', fontWeight:500, textDecoration:'none' }}>Download</a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const InfoRow = ({ label, value }) => (
  <div>
    <div style={{ fontSize:'0.72rem', fontWeight:500, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>{label}</div>
    <div style={{ fontSize:'0.9rem', color:'#1e293b' }}>{value}</div>
  </div>
);
