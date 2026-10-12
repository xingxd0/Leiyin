import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { TopNav } from '../../features/frontend/components/TopNav';

export function FrontendLayout() {
  const { pathname } = useLocation();
  const usesInstantReplica = pathname === '/' || pathname === '/about' || pathname === '/career';

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF] font-sans text-[#111111]">
      {usesInstantReplica ? null : <TopNav />}
      <main className={`flex w-full flex-1 flex-col bg-white ${usesInstantReplica ? '' : 'pt-16'}`}>
        <Outlet />
      </main>
    </div>
  );
}
