import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with immediate check
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      // Automatic reload or silent update
    },
    onOfflineReady() {
      console.log('PTSP MAN Kota Blitar siap digunakan secara offline.');
    },
  });
}

createRoot(document.getElementById('root')!).render(<App />);

