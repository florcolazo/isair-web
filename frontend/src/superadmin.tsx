import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import SuperadminPage from './pages/SuperadminPage';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <SuperadminPage />
    </StrictMode>
  );
}
