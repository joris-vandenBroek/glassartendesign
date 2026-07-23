import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// GitHub Pages serves project sites under a /<repo-name> subpath. Only apply
// it when building for that target (set by the deploy workflow); local dev
// and other hosts serve from the root, so basePath stays empty there.
const basePath = process.env.GITHUB_PAGES === 'true' ? '/glassart-and-design' : '';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default withNextIntl(nextConfig);
