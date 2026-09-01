import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Navbar from './components/Navbar';
import ConocenosPage from './pages/ConocenosPage';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';

function ConocenosApp() {
  return (
    <>
      <Navbar currentPage="conocenos" />
      <main>
        <ConocenosPage />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConocenosApp />
  </StrictMode>
);
