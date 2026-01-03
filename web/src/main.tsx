import React from 'react';
import ReactDom from 'react-dom/client';

import './index.css';

import Router from './routing/router';
import DataProviders from './data-providers/data-providers';

const rootElement = document.getElementById('root');
if (rootElement == null) {
  throw new Error('Root element not found');
}

ReactDom.createRoot(rootElement).render(
  <React.StrictMode>
    <DataProviders>
      <Router />
    </DataProviders>
  </React.StrictMode>,
);
