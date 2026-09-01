import { useState, useEffect } from 'react';

interface Agencia {
  id: string;
  nombre: string;
  ciudad: string;
  dominio: string | null;
  activa: number;
}

export default function SuperadminPage() {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('isair_superadmin_token'));
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [newAgencia, setNewAgencia] = useState({ id: '', nombre: '', ciudad: '', dominio: '', password: '' });

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencia_id: 'superadmin', password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
      
      localStorage.setItem('isair_superadmin_token', data.token);
      setToken(data.token);
      setStatus('idle');
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isair_superadmin_token');
    setToken(null);
  };

  // Load Agencias
  const loadAgencias = async () => {
    if (!token) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_URL}/api/admin/agencias`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar agencias');
      const data = await res.json();
      setAgencias(data);
      setStatus('idle');
    } catch (e: any) {
      setErrorMsg(e.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    loadAgencias();
  }, [token]);

  const handleCreateAgencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/agencias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAgencia)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear agencia');
      }
      setNewAgencia({ id: '', nombre: '', ciudad: '', dominio: '', password: '' });
      loadAgencias();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!token) {
    return (
      <div style={{ maxWidth: 400, margin: '80px auto', padding: '30px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontFamily: 'Inter, sans-serif', color: '#1a1a2e' }}>
        <h1 style={{ fontFamily: 'Sora, sans-serif', color: '#0072ff', textAlign: 'center', marginTop: 0 }}>Super Admin ISAIR</h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Contraseña de Superadmin</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Ingresá la clave"
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box' }}
              required
            />
          </div>
          {status === 'error' && <div style={{ color: '#721c24', background: '#f8d7da', padding: '10px', borderRadius: '8px', textAlign: 'center', fontWeight: 600 }}>{errorMsg}</div>}
          <button type="submit" disabled={status === 'loading'} style={{ width: '100%', padding: '14px', background: '#0072ff', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
            {status === 'loading' ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '30px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontFamily: 'Inter, sans-serif', color: '#1a1a2e' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontFamily: 'Sora, sans-serif', color: '#0072ff', margin: 0 }}>Panel Super Admin</h1>
        <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #ccc', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Cerrar sesión</button>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h3>Agencias Creadas</h3>
        {agencias.length === 0 ? <p>No hay agencias todavía.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ background: '#f4f6fa', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Nombre</th>
                <th style={{ padding: '12px' }}>Ciudad</th>
                <th style={{ padding: '12px' }}>Dominio</th>
              </tr>
            </thead>
            <tbody>
              {agencias.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{a.id}</td>
                  <td style={{ padding: '12px' }}>{a.nombre}</td>
                  <td style={{ padding: '12px' }}>{a.ciudad}</td>
                  <td style={{ padding: '12px' }}>{a.dominio || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ borderTop: '1px solid #eee', paddingTop: '30px' }}>
        <h3>Crear Nueva Agencia</h3>
        <form onSubmit={handleCreateAgencia} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>ID (ej: sanjose)</label>
            <input type="text" value={newAgencia.id} onChange={e => setNewAgencia({...newAgencia, id: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Nombre (ej: ISAIR San José)</label>
            <input type="text" value={newAgencia.nombre} onChange={e => setNewAgencia({...newAgencia, nombre: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Ciudad</label>
            <input type="text" value={newAgencia.ciudad} onChange={e => setNewAgencia({...newAgencia, ciudad: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Dominio (opcional)</label>
            <input type="text" value={newAgencia.dominio} onChange={e => setNewAgencia({...newAgencia, dominio: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Contraseña inicial</label>
            <input type="password" value={newAgencia.password} onChange={e => setNewAgencia({...newAgencia, password: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" style={{ width: '100%', padding: '12px', background: '#10b950', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Crear Agencia</button>
          </div>
        </form>
      </div>
    </div>
  );
}
