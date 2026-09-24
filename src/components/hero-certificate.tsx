/**
 * The hero illustration: a certificate with a verification code on it.
 *
 * It replaced a mock dashboard full of invented activity counts, which sold
 * nothing to a visitor who is not a member yet. The holder's name and
 * programme are abstract rules rather than invented text, so the picture can
 * never read as a real person's certificate, and everything is painted through
 * the design tokens so it themes with the page instead of needing a dark copy.
 */
export function HeroCertificate() {
  return (
    <div className="bg-primary-subtle flex aspect-[4/3] w-full items-center justify-center rounded-2xl p-6">
      <svg
        viewBox="0 0 420 320"
        className="h-full w-full"
        role="img"
        aria-label="A certificate of completion carrying a verification code"
      >
        <rect
          x="70"
          y="52"
          width="270"
          height="180"
          rx="12"
          fill="var(--surface)"
          opacity=".55"
          transform="rotate(-5 205 142)"
        />
        <rect
          x="62"
          y="68"
          width="286"
          height="190"
          rx="12"
          fill="var(--surface)"
          stroke="var(--border)"
          strokeWidth="1.5"
        />
        <rect x="62" y="68" width="7" height="190" rx="3.5" fill="var(--accent)" />
        <circle
          cx="92"
          cy="92"
          r="9"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
        />
        <circle cx="92" cy="92" r="3" fill="var(--primary)" />
        <text
          x="110"
          y="97"
          fontFamily="var(--font-body)"
          fontSize="10.5"
          fontWeight="600"
          letterSpacing="1.3"
          fill="var(--primary-text)"
        >
          CERTIFICATE OF COMPLETION
        </text>
        <rect
          x="92"
          y="122"
          width="150"
          height="10"
          rx="5"
          fill="var(--text)"
          opacity=".82"
        />
        <rect
          x="92"
          y="146"
          width="196"
          height="8"
          rx="4"
          fill="var(--primary)"
          opacity=".62"
        />
        <rect
          x="92"
          y="166"
          width="120"
          height="8"
          rx="4"
          fill="var(--text)"
          opacity=".22"
        />
        <rect
          x="92"
          y="206"
          width="66"
          height="5"
          rx="2.5"
          fill="var(--text)"
          opacity=".2"
        />
        <rect
          x="176"
          y="206"
          width="66"
          height="5"
          rx="2.5"
          fill="var(--text)"
          opacity=".2"
        />
        <text
          x="252"
          y="212"
          fontFamily="var(--font-mono)"
          fontSize="11"
          letterSpacing="1"
          fill="var(--text-muted)"
        >
          NM-7K4Q-2X9
        </text>
        <circle cx="326" cy="90" r="23" fill="var(--primary)" />
        <path
          d="M315 90.5l7.5 7.5L338 82"
          fill="none"
          stroke="var(--on-primary)"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
