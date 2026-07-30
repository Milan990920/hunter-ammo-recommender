export default function Footer() {
  return (
    <footer className="mt-16 border-t border-forest-900/10 bg-forest-950 text-tan-100">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm sm:px-6">
        <p className="font-display text-base font-semibold text-tan-50">
          KaliberMester
        </p>
        <p className="mt-1 max-w-2xl text-tan-200/80">
          Ingyenes, tájékoztató jellegű kaliber- és lőszerajánló magyar
          vadászoknak. Nem hivatalos, nem hatósági, és nem helyettesíti a
          jogszabályokat vagy a szakkereskedő tanácsát.
        </p>
        <p className="mt-4 text-xs text-tan-200/60">
          © {new Date().getFullYear()} KaliberMester — MVP verzió, adatok
          egy része placeholder.
        </p>
      </div>
    </footer>
  );
}
