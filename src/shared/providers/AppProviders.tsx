import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PortfolioContentProvider } from '../../features/portfolio/content/PortfolioContentProvider';
import { ScrollToTop } from './ScrollToTop';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PortfolioContentProvider>
      <BrowserRouter>
        <ScrollToTop />
        {children}
      </BrowserRouter>
    </PortfolioContentProvider>
  );
}
