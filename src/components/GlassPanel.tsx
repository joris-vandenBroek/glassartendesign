import { ReactNode } from 'react';

export function GlassPanel({
  children,
  className = '',
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      data-testid="glass-panel"
      className={`relative mx-auto max-w-3xl rounded-lg border border-white/10 bg-white/5 px-6 py-10 backdrop-blur-sm sm:px-10 ${className}`}
    >
      {children}
    </section>
  );
}
