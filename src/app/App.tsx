import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { FrontendLayout } from './layouts/FrontendLayout';
import { AdminPage } from '../features/admin/pages/AdminPage';
import { AboutWorkPage } from '../features/frontend/pages/AboutWorkPage';
import { HomePage } from '../features/frontend/pages/HomePage';
import { ProjectDetailPage } from '../features/frontend/pages/ProjectDetailPage';

export default function App() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocalAdminHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

  return (
    <Routes>
      <Route element={<FrontendLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/work" element={<AboutWorkPage />} />
        <Route path="/work/:slug" element={<ProjectDetailPage />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/admin" element={isLocalAdminHost ? <AdminPage /> : <Navigate to="/" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
