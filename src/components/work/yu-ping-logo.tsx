type YuPingLogoProps = {
  className?: string;
};

/**
 * Original wordmark for Yu-Ping — no real logo asset was provided, so this
 * is a from-scratch mark in the style common to MEP engineering firms
 * (stacked chevron mark + tracked geometric wordmark), not a claim about
 * the company's actual branding.
 */
export function YuPingLogo({ className }: YuPingLogoProps) {
  return (
    <svg viewBox="0 0 160 32" className={className} role="img" aria-label="Yu-Ping (original mark, not the company's actual logo)">
      <g strokeLinejoin="round">
        <path d="M2,24 L10,4 L18,24" fill="none" stroke="var(--color-fg-subtle)" strokeWidth={2.4} />
        <path d="M9,24 L17,4 L25,24" fill="none" stroke="var(--color-cyan)" strokeWidth={2.4} />
        <path d="M16,24 L24,4 L32,24" fill="none" stroke="var(--color-fg-subtle)" strokeWidth={2.4} />
      </g>
      <text
        x={44}
        y={21}
        fontFamily="var(--font-sans)"
        fontWeight={700}
        fontSize={17}
        letterSpacing="0.06em"
        fill="var(--color-fg)"
      >
        YU-PING
      </text>
    </svg>
  );
}
