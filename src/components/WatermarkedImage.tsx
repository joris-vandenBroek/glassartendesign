export interface WatermarkedImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function WatermarkedImage({ src, alt, className }: WatermarkedImageProps) {
  return (
    <div data-testid="watermarked-image" className={`relative overflow-hidden ${className ?? ''}`}>
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      <div
        data-testid="watermark-overlay"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex select-none flex-wrap content-center justify-center gap-4 overflow-hidden text-[0.65rem] font-head uppercase tracking-widest text-white/40 [transform:rotate(-30deg)_scale(1.4)]"
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <span key={index}>© Glassart & Design</span>
        ))}
      </div>
    </div>
  );
}
