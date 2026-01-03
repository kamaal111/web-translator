import React from 'react';

import { Outlet } from 'react-router';

import './page-layout.css';

function PageLayout() {
  return (
    <>
      <main className="content">
        <React.Suspense fallback={null}>
          <Outlet />
        </React.Suspense>
      </main>
    </>
  );
}

export default PageLayout;
