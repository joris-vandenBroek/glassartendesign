'use client';

import { Link } from '@/i18n/navigation';

export function Logo() {
  return (
    <Link href="/" data-testid="logo" className="flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
        <g fill="none" className="stroke-gold" strokeWidth={4} strokeLinecap="square">
          <path d="M 4 16 L 4 4 L 16 4" />
          <path d="M 48 4 L 60 4 L 60 16" />
          <path d="M 60 48 L 60 60 L 48 60" />
          <path d="M 16 60 L 4 60 L 4 48" />
          <path d="M 40 20 L 24 20 L 24 44 L 40 44 M 40 34 L 30 34" />
        </g>
      </svg>
      <span className="text-xs tracking-[0.15em]">
        <span className="text-gold">GLASSART</span> <span className="text-silver">&amp; DESIGN</span>
      </span>
    </Link>
  );
}
