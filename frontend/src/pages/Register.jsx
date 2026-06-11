import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key:'name', label:'Full Name', type:'text', placeholder:'John Doe' },
    { key:'email', label:'Email', type:'email', placeholder:'you@example.com' },
    { key:'password', label:'Password', type:'password', placeholder:'Min. 6 characters' },
    { key:'confirm', label:'Confirm Password', type:'password', placeholder:'Repeat password' },
  ];

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' }}>
      <div style={{ background:'#fff', borderRadius:16, padding:40, width:'100%', maxWidth:420, boxShadow:'0 25px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:8 }}>🎙️</div>
          <h1 style={{ fontSize:'1.6rem', fontWeight:700, color:'#1e1b4b' }}>Create Account</h1>
          <p style={{ color:'#64748b', marginTop:4, fontSize:'0.9rem' }}>Get started with ConsultTrack</p>
        </div>

        <form onSubmit={handleSubmit}>
          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key} style={{ marginBottom:14 }}>
              <label style={{ display:'block', marginBottom:5, fontSize:'0.85rem', fontWeight:500, color:'#374151' }}>{label}</label>
              <input
                type={type} value={form[key]} placeholder={placeholder} required
                onChange={e => setForm({...form, [key]: e.target.value})}
                style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:'0.9rem', outline:'none' }}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} style={{
            width:'100%', padding:12, background:'linear-gradient(135deg, #6366f1, #4f46e5)',
            color:'#fff', border:'none', borderRadius:8, fontSize:'0.95rem', fontWeight:600,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop:6,
          }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, fontSize:'0.85rem', color:'#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'#6366f1', fontWeight:500, textDecoration:'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
