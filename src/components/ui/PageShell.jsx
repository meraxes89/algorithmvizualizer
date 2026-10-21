
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import AppFooter from './AppFooter';

const WIDTHS = {
  default: 'max-w-7xl',
  wide: 'max-w-[1600px]',
  narrow: 'max-w-3xl',
};

const PageShell = ({
  kicker,
  title,
  subtitle,
  icon: Icon,
  layoutKey,
  backTo = '/algorithms',
  backLabel = 'Back to Categories',
  actions,
  tabs,
  children,
  width = 'default',
  stage = true,
  stageClassName = '',
  footer = true,
  className = '',
}) => {
  const TitleTag = layoutKey ? motion.h1 : 'h1';
  const titleProps = layoutKey ? { layoutId: `title-${layoutKey}` } : {};

  return (
    <div className={`relative min-h-screen flex flex-col ${className}`}>
      <main
        className={`flex-1 w-full ${WIDTHS[width] || WIDTHS.default} mx-auto px-4 sm:px-6 py-10 flex flex-col relative z-10`}
      >
        <div className="flex items-center justify-between gap-3 mb-8">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 rounded-xl border border-line-subtle bg-paper-1/60 px-3 py-2 text-xs font-semibold text-ink-2 transition-colors hover:border-line-strong hover:text-accent"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{backLabel}</span>
          </Link>
          <div className="flex items-center gap-2">{actions}</div>
        </div>

        <header className="text-center max-w-2xl mx-auto mb-8">
          {Icon && (
            <motion.div
              layoutId={layoutKey ? `icon-${layoutKey}` : undefined}
              className="mx-auto mb-4 hidden h-12 w-12 items-center justify-center rounded-2xl border border-line-subtle bg-accent-soft text-accent md:flex"
            >
              <Icon className="w-5 h-5" />
            </motion.div>
          )}
          {kicker && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line-subtle bg-accent-soft px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              {kicker}
            </div>
          )}
          <TitleTag
            {...titleProps}
            className="font-display text-4xl md:text-5xl font-bold tracking-tight text-ink"
          >
            {title}
          </TitleTag>
          {subtitle && (
            <p className="mt-3 text-sm leading-relaxed text-ink-2">{subtitle}</p>
          )}
        </header>

        {tabs && <div className="mb-8 flex justify-center">{tabs}</div>}

        {stage ? (
          <div
            className={`w-full min-h-[600px] flex-1 overflow-hidden rounded-3xl border border-line-subtle bg-paper-1/80 shadow-paper flex flex-col ${stageClassName}`}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </main>

      {footer && <AppFooter />}
    </div>
  );
};

export default PageShell;
