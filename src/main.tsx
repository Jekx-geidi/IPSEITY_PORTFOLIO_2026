import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import PortfolioMotion from './components/PortfolioMotion/PortfolioMotion';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortfolioMotion><App /></PortfolioMotion>
  </StrictMode>,
);
