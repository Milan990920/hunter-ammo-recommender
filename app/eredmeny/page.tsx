import Link from "next/link";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import ResultCard from "@/components/ResultCard";
import { getCaliberByNev, getLovedekKategoria } from "@/lib/data";
import { generateRecommendations } from "@/lib/recommendation-engine";
import { BUDGET_OPTIONS, FEGYVERTIPUS_OPTIONS, GAME_OPTIONS, RANGE_OPTIONS } from "@/lib/wizard-questions";
import type {
  BudgetLevel,
  FegyverTipus,
  LovedekKategoriaId,
  RangeCategory,
  WizardAnswers,
} from "@/lib/types";

type SearchParams = Record<string, string | string[] | undefined>;

function findLabel<T extends { id: string; label: string }>(options: readonly T[], id?: string) {
  return options.find((o) => o.id === id)?.label ?? id ?? "—";
}

function parseAnswers(sp: SearchParams): WizardAnswers | null {
  const get = (key: string) => (Array.isArray(sp[key]) ? sp[key]?.[0] : sp[key]);

  const game = get("game");
  const range = get("range") as RangeCategory | undefined;
  const fegyvertipus = get("fegyvertipus") as FegyverTipus | undefined;
  const lovedekKategoria = get("lovedekKategoria") as LovedekKategoriaId | undefined;
  const olommentesSzukseges = get("olommentesSzukseges") === "true";
  const budget = get("budget") as BudgetLevel | undefined;
  const existingCaliberId = get("existingCaliberId");
  const manufacturers = get("manufacturers") ?? "";

  if (!game || !range || !fegyvertipus || !lovedekKategoria || !budget || !existingCaliberId) {
    return null;
  }

  return {
    game: game as WizardAnswers["game"],
    range,
    fegyvertipus,
    lovedekKategoria,
    olommentesSzukseges,
    budget,
    existingCaliberId,
    preferredManufacturers: manufacturers.split(",").filter(Boolean),
  };
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const answers = parseAnswers(sp);

  if (!answers) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold text-forest-950">
          Hiányzó válaszok
        </h1>
        <p className="mt-3 text-forest-800">
          Úgy tűnik, a kérdőívet nem a megfelelő úton érte el. Kérjük, töltse ki
          újra a kérdőívet az ajánláshoz.
        </p>
        <Link
          href="/wizard"
          className="mt-6 inline-block rounded-full bg-forest-800 px-6 py-3 text-sm font-semibold text-tan-50 hover:bg-forest-700"
        >
          Ajánlás kérése
        </Link>
      </div>
    );
  }

  const { recommendations, fallbackUsed } = generateRecommendations(answers);
  const existingCaliber =
    answers.existingCaliberId !== "nincs" ? getCaliberByNev(answers.existingCaliberId) : undefined;
  const lovedekKategoria = getLovedekKategoria(answers.lovedekKategoria);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-forest-950">Az Ön ajánlásai</h1>
      <p className="mt-2 text-forest-800">
        Az Ön válaszai alapján az alábbi kaliberek lehetnek megfelelőek erre a célra. Az
        eredmény tájékoztató jellegű, és nem helyettesíti a hatályos jogszabályok
        ismeretét, illetve a fegyverkereskedő vagy vadásztárs szakmai tanácsát.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-forest-900/5 px-3 py-1.5 text-forest-900">
          Vad: {findLabel(GAME_OPTIONS, answers.game)}
        </span>
        <span className="rounded-full bg-forest-900/5 px-3 py-1.5 text-forest-900">
          Táv: {findLabel(RANGE_OPTIONS, answers.range)}
        </span>
        <span className="rounded-full bg-forest-900/5 px-3 py-1.5 text-forest-900">
          Fegyver: {findLabel(FEGYVERTIPUS_OPTIONS, answers.fegyvertipus)}
        </span>
        <span className="rounded-full bg-forest-900/5 px-3 py-1.5 text-forest-900">
          Lövedék: {lovedekKategoria?.megjelenites ?? answers.lovedekKategoria}
        </span>
        {answers.olommentesSzukseges && (
          <span className="rounded-full bg-forest-900/5 px-3 py-1.5 text-forest-900">
            Ólommentes lőszer szükséges
          </span>
        )}
        <span className="rounded-full bg-forest-900/5 px-3 py-1.5 text-forest-900">
          Költségkeret: {findLabel(BUDGET_OPTIONS, answers.budget)}
        </span>
        {existingCaliber && (
          <span className="rounded-full bg-forest-900/5 px-3 py-1.5 text-forest-900">
            Meglévő kaliber: {existingCaliber.nev}
          </span>
        )}
      </div>

      {fallbackUsed && (
        <p className="mt-6 rounded-xl bg-ember-500/10 px-4 py-3 text-sm text-forest-900">
          A megadott válaszokra nem volt erősen illeszkedő kaliber az
          adatbázisunkban, ezért a legközelebbi találatokat mutatjuk. Érdemes a
          szakkereskedővel is egyeztetni.
        </p>
      )}

      <div className="mt-8 space-y-6">
        {recommendations.map((rec, i) => (
          <ResultCard
            key={rec.caliber.nev}
            recommendation={rec}
            rank={i + 1}
            game={answers.game}
            preferredLovedekKategoria={answers.lovedekKategoria}
          />
        ))}
      </div>

      <div className="mt-10">
        <DisclaimerBanner variant="full" />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/wizard"
          className="rounded-full border border-forest-800/30 px-5 py-2.5 text-sm font-medium text-forest-800 hover:bg-forest-800/5"
        >
          Új keresés indítása
        </Link>
      </div>
    </div>
  );
}
