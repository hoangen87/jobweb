// eslint-disable-next-line @next/next/no-img-element
export default function Logo({ className = "h-9" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.png" alt="JHONSIN" className={`${className} w-auto object-contain`} />
  );
}
