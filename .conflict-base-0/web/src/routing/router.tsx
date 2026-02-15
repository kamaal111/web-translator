import { Route, Routes } from 'react-router';

import LazyHome from '@/pages/home/lazy-home';
import LazyLogin from '@/pages/login/lazy-login';
import LazyProject from '@/pages/project/lazy-project';
import PageLayout from '@/layouts/page-layout/page-layout';
import LoginRequiredLayout from '@/layouts/login-required-layout/login-required-layout';

function Router() {
  return (
    <Routes>
      <Route element={<PageLayout />}>
        <Route element={<LoginRequiredLayout />}>
          <Route index element={<LazyHome />} />
          <Route path="/projects/:id" element={<LazyProject />} />
        </Route>
        <Route path="/login" element={<LazyLogin />} />
      </Route>
    </Routes>
  );
}

export default Router;
