import { Outlet } from 'react-router-dom';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f7f7f4] text-[#111111] font-sans">
      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
