import React from 'react';
import ReactDom from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';

import './index.css';

import LazyHome from './pages/home/lazy-home';
import LazyLogin from './pages/login/lazy-login';

const rootElement = document.getElementById('root');
if (rootElement == null) {
  throw new Error('Root element not found');
}

ReactDom.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LazyHome />} />
        <Route path="/login" element={<LazyLogin />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
