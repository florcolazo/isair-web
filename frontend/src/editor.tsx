import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CoverageEditor from './components/CoverageEditor';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CoverageEditor />
  </StrictMode>
);
