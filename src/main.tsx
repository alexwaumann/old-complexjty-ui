import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { connectNetwork } from './connectors/network';
import { connectWalletEagerly } from './hooks/useAuth';

connectNetwork();
connectWalletEagerly();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
