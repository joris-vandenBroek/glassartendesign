import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { FeaturedWorks } from '@/components/FeaturedWorks';
import { Contact } from '@/components/Contact';

export default function LocalePage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-ink via-charcoal to-graphite">
      <div className="flex flex-col gap-10 px-4 pb-16 pt-24 sm:px-8">
        <Hero />
        <About />
        <FeaturedWorks />
        <Contact />
      </div>
    </main>
  );
}
