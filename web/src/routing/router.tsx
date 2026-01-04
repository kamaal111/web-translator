import { BrowserRouter, Route, Routes } from 'react-router';

import LazyHome from '@/pages/home/lazy-home';
import LazyLogin from '@/pages/login/lazy-login';
import PageLayout from '@/layouts/page-layout/page-layout';
import LoginRequiredLayout from '@/layouts/login-required-layout/login-required-layout';

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PageLayout />}>
          <Route element={<LoginRequiredLayout />}>
            <Route index element={<LazyHome />} />
          </Route>
          <Route path="/login" element={<LazyLogin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
