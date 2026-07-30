import type { ReactNode } from "react";

type OptionCardProps = {
  label: string;
  hint?: string;
  icon?: ReactNode;
  selected: boolean;
  onClick: () => void;
};

export default function OptionCard({ label, hint, icon, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group flex w-full flex-col items-center gap-2 rounded-2xl border-2 px-4 py-5 text-center transition ${
        selected
          ? "border-forest-700 bg-forest-700/10 shadow-sm"
          : "border-forest-900/10 bg-white hover:border-forest-500/50 hover:bg-forest-500/5"
      }`}
    >
      {icon && (
        <span
          className={`transition-colors ${selected ? "text-forest-800" : "text-forest-600/70 group-hover:text-forest-700"}`}
        >
          {icon}
        </span>
      )}
      <span className="font-display text-base font-semibold text-forest-950">{label}</span>
      {hint && <span className="text-xs leading-snug text-forest-700/80">{hint}</span>}
    </button>
  );
}
