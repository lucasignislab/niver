export default function OfferButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      disabled
      className={`inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-brand-dark/10 px-4 text-center text-sm font-black text-brand-dark/50 ${className}`}
    >
      Checkout indisponível nesta demonstração
    </button>
  );
}
