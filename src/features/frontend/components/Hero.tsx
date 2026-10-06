import { motion } from 'motion/react';
import { usePortfolioContent } from '../../portfolio/content/PortfolioContentProvider';
import { resolveAssetUrl } from '../../../shared/utils/assetUrl';

export function Hero() {
  const { content } = usePortfolioContent();
  const { heroLinks, siteProfile } = content;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full flex-col justify-between px-8 py-10 md:px-10 lg:px-14"
    >
      <div>
        <div className="mb-8 overflow-hidden bg-gray-100">
          <img
            src={resolveAssetUrl(siteProfile.heroImage)}
            alt={siteProfile.name}
            className="h-auto w-full object-cover grayscale transition-all duration-700 hover:grayscale-0"
          />
        </div>
        <div className="space-y-5">
          <div>
            <h1 className="text-4xl font-extralight tracking-tight md:text-5xl">
              {siteProfile.name}
              <span className="font-bold text-blue-600">.</span>
            </h1>
            <p className="mt-3 max-w-sm text-sm font-medium uppercase tracking-[0.22em] text-gray-500">
              {siteProfile.title}
            </p>
          </div>
          <p className="max-w-md text-base font-light leading-relaxed text-gray-600">{siteProfile.blurb}</p>
        </div>
      </div>

      <div className="grid gap-4 border-t border-gray-200 pt-8">
        {heroLinks.map((link, index) => {
          const contentNode = (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">{link.label}</p>
              <p className="mt-2 text-sm font-semibold text-[#111111]">{link.value}</p>
            </>
          );

          return link.href ? (
            <a
              key={`${link.label}-${index}`}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
              className="border-b border-gray-100 pb-4 last:border-b-0 hover:opacity-70"
            >
              {contentNode}
            </a>
          ) : (
            <div key={`${link.label}-${index}`} className="border-b border-gray-100 pb-4 last:border-b-0">
              {contentNode}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
