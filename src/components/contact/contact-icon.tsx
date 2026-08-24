import type { ContactLink } from "@/lib/contact";

type ContactIconProps = {
  id: ContactLink["id"];
  className?: string;
};

/** Small, quiet per-type cues — not illustrations, just enough to read at a glance. */
export function ContactIcon({ id, className }: ContactIconProps) {
  const common = { width: 20, height: 20, viewBox: "0 0 20 20", "aria-hidden": true, className };

  switch (id) {
    case "resume":
      return (
        <svg {...common}>
          <path d="M5,2 L12,2 L16,6 L16,18 L5,18 Z" fill="none" stroke="currentColor" strokeWidth={1.3} />
          <path d="M12,2 L12,6 L16,6" fill="none" stroke="currentColor" strokeWidth={1.3} />
          <line x1={7.5} y1={10} x2={13.5} y2={10} stroke="currentColor" strokeWidth={1} />
          <line x1={7.5} y1={13} x2={13.5} y2={13} stroke="currentColor" strokeWidth={1} />
        </svg>
      );
    case "email":
      return (
        <svg {...common}>
          <rect x={2} y={4} width={16} height={12} fill="none" stroke="currentColor" strokeWidth={1.3} />
          <path d="M2.5,4.5 L10,11 L17.5,4.5" fill="none" stroke="currentColor" strokeWidth={1.3} />
        </svg>
      );
    case "github":
      return (
        <svg {...common}>
          <rect x={2} y={3} width={16} height={14} fill="none" stroke="currentColor" strokeWidth={1.3} />
          <path d="M6,8 L3.5,10 L6,12" fill="none" stroke="currentColor" strokeWidth={1.2} />
          <path d="M14,8 L16.5,10 L14,12" fill="none" stroke="currentColor" strokeWidth={1.2} />
          <line x1={11} y1={7} x2={9} y2={13} stroke="currentColor" strokeWidth={1.2} />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common}>
          <rect x={2.5} y={4} width={15} height={12} rx={2} fill="none" stroke="currentColor" strokeWidth={1.3} />
          <circle cx={10} cy={10} r={3.4} fill="none" stroke="currentColor" strokeWidth={1.3} />
          <circle cx={14.5} cy={6.6} r={0.9} fill="currentColor" />
        </svg>
      );
  }
}
