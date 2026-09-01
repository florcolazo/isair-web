import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Navbar from './components/Navbar';
import ContactanosPage from './pages/ContactanosPage';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';

function ContactanosApp() {
  return (
    <>
      <Navbar currentPage="contactanos" />
      <main>
        <ContactanosPage />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContactanosApp />
  </StrictMode>
);
