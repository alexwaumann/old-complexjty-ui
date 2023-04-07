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
