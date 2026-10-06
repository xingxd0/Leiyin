import { Link } from 'react-router-dom';
import { usePortfolioContent } from '../../portfolio/content/PortfolioContentProvider';

interface SiteFooterProps {
  className?: string;
  leftLabel?: string;
  leftValue?: string;
  rightLabel?: string;
  rightValue?: string;
  rightHref?: string;
}

export function SiteFooter({
  className = 'mt-auto flex flex-col gap-6 border-t border-gray-100 pt-8 md:flex-row md:items-center md:justify-between md:gap-0',
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  rightHref,
}: SiteFooterProps) {
  const { content } = usePortfolioContent();
  const { footerInfo } = content;

  const resolvedHref = rightHref ?? footerInfo.connectHref;
  const resolvedValue = rightValue ?? footerInfo.connectValue;

  return (
    <footer className={className}>
      <div className="flex space-x-12">
        <div>
          <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">
            {leftLabel ?? footerInfo.locationLabel}
          </p>
          <p className="text-xs font-semibold">{leftValue ?? footerInfo.locationValue}</p>
        </div>
        <div>
          <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">
            {rightLabel ?? footerInfo.connectLabel}
          </p>
          {resolvedHref?.startsWith('/') ? (
            <Link to={resolvedHref} className="text-xs font-semibold underline underline-offset-4">
              {resolvedValue}
            </Link>
          ) : resolvedHref ? (
            <a href={resolvedHref} className="text-xs font-semibold underline underline-offset-4">
              {resolvedValue}
            </a>
          ) : (
            <p className="text-xs font-semibold">{resolvedValue}</p>
          )}
        </div>
      </div>
      <div className="text-left md:text-right">
        <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">{footerInfo.timeLabel}</p>
        <p className="text-xs font-mono font-bold tracking-tighter">{footerInfo.timeValue}</p>
      </div>
    </footer>
  );
}
