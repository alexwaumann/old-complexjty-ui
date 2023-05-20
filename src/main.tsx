import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { user } from './services/user';

user.start();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
