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
  className = 'mt-auto grid gap-6 border-t border-gray-100 pt-8 md:grid-cols-3 md:items-start',
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
  const labelClass = 'text-[9px] font-bold uppercase leading-none tracking-widest text-gray-400';
  const valueClass = 'mt-3 block text-xs font-semibold leading-none text-[#111111]';
  const linkClass = `${valueClass} w-fit underline underline-offset-4`;

  return (
    <footer className={className}>
      <div>
        <p className={labelClass}>
          {leftLabel ?? footerInfo.locationLabel}
        </p>
        <p className={valueClass}>{leftValue ?? footerInfo.locationValue}</p>
      </div>
      <div>
        <p className={labelClass}>
          {rightLabel ?? footerInfo.connectLabel}
        </p>
        {resolvedHref?.startsWith('/') ? (
          <Link to={resolvedHref} className={linkClass}>
            {resolvedValue}
          </Link>
        ) : resolvedHref ? (
          <a href={resolvedHref} className={linkClass}>
            {resolvedValue}
          </a>
        ) : (
          <p className={valueClass}>{resolvedValue}</p>
        )}
      </div>
      <div className="text-left md:text-right">
        <p className={labelClass}>{footerInfo.timeLabel}</p>
        <p className={`${valueClass} font-mono font-bold tracking-tighter`}>{footerInfo.timeValue}</p>
      </div>
    </footer>
  );
}
