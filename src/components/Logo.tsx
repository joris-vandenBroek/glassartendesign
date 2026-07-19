'use client';

import { Link } from '@/i18n/navigation';
import { BASE_PATH } from '@/lib/basePath';

export function Logo() {
  return (
    <Link href="/" data-testid="logo" className="flex items-center gap-2">
      <img
        src={`${BASE_PATH}/logo.png`}
        alt=""
        aria-hidden="true"
        className="h-7 w-7 shrink-0"
      />
      <span className="text-xs tracking-[0.15em]">
        <span className="text-gold">GLASSART</span> <span className="text-silver">&amp; DESIGN</span>
      </span>
    </Link>
  );
}
