import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { usePortfolioContent } from '../../portfolio/content/PortfolioContentProvider';
import { navLinks } from '../../../shared/config/navigation';

export function TopNav() {
  const { content } = usePortfolioContent();
  const { heroLinks, siteProfile } = content;
  const externalProfileLink =
    heroLinks.find((item) => item.href?.startsWith('http')) ??
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/xingxd',
    };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white/95 px-8 backdrop-blur-sm md:px-12 lg:px-20"
    >
      <NavLink
        to="/"
        className="text-[10px] font-black uppercase tracking-[0.4em] text-[#111111] transition-opacity hover:opacity-70"
      >
        {siteProfile.name}
      </NavLink>

      <ul className="flex items-center space-x-8 text-[10px] font-bold uppercase tracking-widest md:space-x-12">
        {navLinks.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 transition-colors ${
                  isActive ? 'text-[#111111]' : 'text-gray-400 hover:text-[#111111]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? <span className="h-1.5 w-1.5 rounded-full bg-blue-600" /> : null}
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
        {externalProfileLink?.href ? (
          <li>
            <a
              href={externalProfileLink.href}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 transition-colors hover:text-[#111111]"
            >
              {externalProfileLink.label}
            </a>
          </li>
        ) : null}
      </ul>
    </motion.header>
  );
}
