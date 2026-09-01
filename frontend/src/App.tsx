import { useState, useEffect } from 'react';
import type { SelectedPlan, Zone, Prices } from './types';
import Navbar        from './components/Navbar';
import HomePage      from './pages/HomePage';
import Footer        from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';

export default function App() {
  const [zone, setZone]           = useState<Zone>(null);
  const [prices, setPrices]       = useState<Prices>({});
  const [prefillAddr, setPrefill] = useState('');
  const [banners, setBanners]     = useState<{id: string, imagen: string}[]>([]);

  // Cargar precios y banners dinámicos
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const AGENCIA = import.meta.env.VITE_AGENCIA_ID || 'sanjose';
    
    Promise.all([
      fetch(`${API_URL}/api/agencias/${AGENCIA}/precios`).then(r => r.json()),
      fetch(`${API_URL}/api/agencias/${AGENCIA}/banners`).then(r => r.json())
    ])
    .then(([preciosData, bannersData]) => {
      if (preciosData.error) throw new Error('Agencia no encontrada');
      setPrices(preciosData);
      setBanners(bannersData || []);
    })
    .catch(e => console.error('Error cargando datos:', e));
  }, []);

  const handleSelect = (plan: SelectedPlan) => {
    const query = new URLSearchParams({
      plan: plan.name,
      precio: plan.price,
      futbol: plan.futbol ? '1' : '0',
    }).toString();
    window.location.href = `contactanos.html?${query}`;
  };

  return (
    <>
      <Navbar currentPage="home" />
      <main>
        <HomePage
          prices={prices}
          banners={banners}
          zone={zone}
          prefillAddr={prefillAddr}
          setZone={setZone}
          setPrefill={setPrefill}
          handleSelect={handleSelect}
        />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
