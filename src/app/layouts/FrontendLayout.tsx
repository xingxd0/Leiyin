import { Outlet } from 'react-router-dom';
import { TopNav } from '../../features/frontend/components/TopNav';

export function FrontendLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFFFF] text-[#111111] font-sans">
      <TopNav />
      <main className="flex-1 w-full flex flex-col bg-white">
        <Outlet />
      </main>
    </div>
  );
}
