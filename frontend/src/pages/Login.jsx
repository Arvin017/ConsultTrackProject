import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' }}>
      <div style={{ background:'#fff', borderRadius:16, padding:40, width:'100%', maxWidth:420, boxShadow:'0 25px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:'2.5rem', marginBottom:8 }}>🎙️</div>
          <h1 style={{ fontSize:'1.6rem', fontWeight:700, color:'#1e1b4b' }}>ConsultTrack</h1>
          <p style={{ color:'#64748b', marginTop:4, fontSize:'0.9rem' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          {['email','password'].map(field => (
            <div key={field} style={{ marginBottom:16 }}>
              <label style={{ display:'block', marginBottom:6, fontSize:'0.85rem', fontWeight:500, color:'#374151' }}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type={field === 'password' ? 'password' : 'email'}
                value={form[field]}
                onChange={e => setForm({...form, [field]: e.target.value})}
                required
                placeholder={field === 'email' ? 'you@example.com' : '••••••••'}
                style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:'0.9rem', outline:'none', transition:'border 0.2s' }}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} style={{
            width:'100%', padding:12, background:'linear-gradient(135deg, #6366f1, #4f46e5)',
            color:'#fff', border:'none', borderRadius:8, fontSize:'0.95rem', fontWeight:600,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop:8,
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, fontSize:'0.85rem', color:'#64748b' }}>
          No account?{' '}
          <Link to="/register" style={{ color:'#6366f1', fontWeight:500, textDecoration:'none' }}>
            Create one
          </Link>
        </p>

        <div style={{ marginTop:20, padding:12, background:'#f0f9ff', borderRadius:8, fontSize:'0.8rem', color:'#0369a1' }}>
          <strong>Demo:</strong> demo@consulttrack.com / password123
        </div>
      </div>
    </div>
  );
}
