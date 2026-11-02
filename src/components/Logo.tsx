export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-heading font-semibold text-brand-dark ${className}`}>
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M12 3C6.48 3 2 6.58 2 11c0 2.36 1.26 4.47 3.3 5.95-.1.98-.47 2.3-1.3 3.55a.5.5 0 0 0 .6.76c1.86-.7 3.3-1.6 4.2-2.26A12.9 12.9 0 0 0 12 19c5.52 0 10-3.58 10-8s-4.48-8-10-8Z"
          fill="#4FA7E0"
        />
        <circle cx="8.5" cy="11" r="1.1" fill="white" />
        <circle cx="12" cy="11" r="1.1" fill="white" />
        <circle cx="15.5" cy="11" r="1.1" fill="white" />
      </svg>
      <span>
        Descomplica <span className="text-brand-blue-dark">English</span>
      </span>
    </span>
  );
}
