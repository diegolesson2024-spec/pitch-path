import clsx from "clsx";

// The PitchPath mark: a pitch tile with a rising orange path ending in the ball.
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden>
      {/* Solid fills only: a gradient id defined inside a hidden copy of the logo would break visible copies. */}
      <rect x="1" y="1" width="38" height="38" rx="10" fill="#2f5bff" />
      <path d="M1 11 A10 10 0 0 1 11 1 H29 A10 10 0 0 1 39 11 V20 H1 Z" fill="white" fillOpacity=".08" />
      <path d="M1 20h38" stroke="white" strokeOpacity=".18" strokeWidth="1.2" />
      <circle cx="20" cy="20" r="6" fill="none" stroke="white" strokeOpacity=".18" strokeWidth="1.2" />
      <path d="M8 31 C 15 31, 15 22, 21 21 S 27 12, 30 10" fill="none" stroke="#ff6a13" strokeWidth="3.6" strokeLinecap="round" />
      <circle cx="30.5" cy="9.5" r="4" fill="white" />
      <circle cx="30.5" cy="9.5" r="1.4" fill="#081230" />
    </svg>
  );
}

export function Logo({ size = 32, className, wordmark = true }: { size?: number; className?: string; wordmark?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {wordmark && (
        <span className="display text-[1.45rem] leading-none tracking-tight">
          Pitch<span className="text-volt">Path</span>
        </span>
      )}
    </span>
  );
}
