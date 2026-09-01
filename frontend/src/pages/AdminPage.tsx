import { useState, useEffect } from 'react';
import type { Prices } from '../types';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(localStorage.getItem('isair_admin_token'));
  const [agenciaId] = useState(import.meta.env.VITE_AGENCIA_ID || 'sanjose');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const [prices, setPrices] = useState<Prices>({});
  const [banners, setBanners] = useState<{id: string, imagen: string}[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'ok' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencia_id: agenciaId, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
      
      localStorage.setItem('isair_admin_token', data.token);
      setToken(data.token);
      setStatus('idle');
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isair_admin_token');
    setToken(null);
  };

  // Load Prices and Banners
  useEffect(() => {
    if (!token) return;
    setStatus('loading');
    
    Promise.all([
      fetch(`${API_URL}/api/agencias/${agenciaId}/precios`).then(r => r.json()),
      fetch(`${API_URL}/api/agencias/${agenciaId}/banners`).then(r => r.json())
    ])
    .then(([preciosData, bannersData]) => {
      setPrices(preciosData);
      setBanners(bannersData || []);
      setStatus('idle');
    })
    .catch(() => {
      setErrorMsg('Error al cargar datos');
      setStatus('error');
    });
  }, [token, agenciaId, API_URL]);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      
      try {
        const res = await fetch(`${API_URL}/api/agencias/${agenciaId}/banners`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ imagen: base64 })
        });
        
        if (!res.ok) throw new Error('Error al subir banner');
        
        // Reload banners
        const newBanners = await fetch(`${API_URL}/api/agencias/${agenciaId}/banners`).then(r => r.json());
        setBanners(newBanners);
      } catch (err: any) {
        alert(err.message);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerDelete = async (bannerId: string) => {
    if (!confirm('¿Borrar esta imagen?')) return;
    try {
      const res = await fetch(`${API_URL}/api/agencias/${agenciaId}/banners/${bannerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al borrar');
      setBanners(prev => prev.filter(b => b.id !== bannerId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPrices(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setStatus('saving');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/api/agencias/${agenciaId}/precios`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(prices)
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }
      
      setStatus('ok');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  if (!token) {
    return (
      <div style={{ maxWidth: 400, margin: '80px auto', padding: '30px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontFamily: 'Inter, sans-serif', color: '#1a1a2e' }}>
        <h1 style={{ fontFamily: 'Sora, sans-serif', color: '#0072ff', textAlign: 'center', marginTop: 0 }}>Admin ISAIR</h1>
        <p style={{ textAlign: 'center', color: '#555' }}>Agencia: <strong>{agenciaId}</strong></p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Contraseña de Acceso</label>
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
            {status === 'loading' ? 'Verificando...' : 'Entrar al panel'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '30px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontFamily: 'Inter, sans-serif', color: '#1a1a2e' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontFamily: 'Sora, sans-serif', color: '#0072ff', margin: 0 }}>Panel Admin</h1>
        <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #ccc', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Cerrar sesión</button>
      </div>

      <form onSubmit={handleSave} style={{ borderBottom: '1px solid #eee', paddingBottom: '30px', marginBottom: '30px' }}>
        <h3 style={{ marginTop: 0 }}>Actualizar Precios ($)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {[
            { id: 'fibra_300', label: 'Fibra Óptica 300MB' },
            { id: 'fibra_istv_move', label: 'Internet + ISTV Move' },
            { id: 'fibra_istv_full', label: 'Internet + ISTV Full' },
            { id: 'fibra_iscam', label: 'Internet + IS CAM' },
            { id: 'inalambrica_15', label: 'Internet Inalámbrica 15MB' }
          ].map(field => (
            <div key={field.id}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>{field.label}</label>
              <input 
                type="number" 
                name={field.id}
                value={prices[field.id as keyof Prices] || ''}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>

        {status === 'error' && <div style={{ color: '#721c24', background: '#f8d7da', padding: '12px', borderRadius: '8px', marginTop: '20px', fontWeight: 600 }}>{errorMsg}</div>}
        {status === 'ok' && <div style={{ color: '#155724', background: '#d4edda', padding: '12px', borderRadius: '8px', marginTop: '20px', fontWeight: 600 }}>¡Precios guardados con éxito!</div>}
        
        <button type="submit" disabled={status === 'saving'} style={{ width: '100%', padding: '14px', background: '#e62a22', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '20px' }}>
          {status === 'saving' ? 'Guardando...' : 'Guardar Precios'}
        </button>
      </form>

      <div>
        <h3 style={{ margin: '0 0 8px', color: '#1a1a2e' }}>🗺️ Editor de Cobertura</h3>
        <p style={{ margin: '0 0 16px', color: '#555', fontSize: '14px' }}>
          Dibujá las zonas de Fibra Óptica cuadra por cuadra y exportá el área de cobertura directamente al sitio.
        </p>
        <a href="editor.html" target="_blank" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', textDecoration: 'none', background: '#0072ff', color: '#fff', padding: '14px 24px', borderRadius: '8px', fontWeight: 600 }}>
          <span>✏️ Abrir Editor de Cobertura</span>
        </a>
      </div>

      <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
        <h3 style={{ margin: '0 0 8px', color: '#1a1a2e' }}>🖼️ Slider Principal (Banners)</h3>
        <p style={{ margin: '0 0 16px', color: '#555', fontSize: '14px' }}>
          Subí imágenes para que vayan pasando en la cabecera de la página principal.
        </p>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'inline-block', background: '#10b950', color: '#fff', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
            + Subir nueva imagen
            <input type="file" accept="image/*" onChange={handleBannerUpload} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {banners.map((b, idx) => (
            <div key={b.id} style={{ position: 'relative', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={b.imagen} alt={`Banner ${idx}`} style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
              <button 
                onClick={() => handleBannerDelete(b.id)}
                style={{ position: 'absolute', top: 5, right: 5, background: 'red', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontWeight: 'bold' }}
              >✕</button>
            </div>
          ))}
          {banners.length === 0 && (
            <div style={{ gridColumn: 'span 2', padding: '20px', textAlign: 'center', color: '#888', background: '#f9f9f9', borderRadius: '8px' }}>
              No hay imágenes cargadas. Se mostrará el diseño predeterminado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
