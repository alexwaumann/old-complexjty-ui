import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { wallet } from './services/wallet';
// import { connectWalletEagerly } from './services/metamask';

// connectWalletEagerly();
wallet.start();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
