import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AdminPage from './pages/AdminPage';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AdminPage />
    </StrictMode>
  );
}
