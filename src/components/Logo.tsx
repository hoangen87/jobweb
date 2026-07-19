export default function Logo({ className = "h-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 60"
      className={className}
      role="img"
      aria-label="JHONSIN"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="4" width="52" height="52" rx="8" fill="#E4212B" />
      <path
        d="M31 16 H40 V38 C40 45 35 49 28 49 C22 49 17.5 46 15.5 41 L22 37.5 C23 40 25 42 28 42 C30.5 42 31 40 31 37.5 V16 Z"
        fill="#FFFFFF"
      />
      <text
        x="64"
        y="40"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontWeight="700"
        fontSize="30"
        fill="#1B2A5C"
      >
        JHONSIN
      </text>
    </svg>
  );
}
