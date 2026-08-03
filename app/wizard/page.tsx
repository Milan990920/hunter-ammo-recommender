"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import OptionCard from "@/components/OptionCard";
import { GAME_ICONS, type GameIconKey } from "@/components/icons/GameIcons";
import { CALIBERS, LOVEDEK_KATEGORIAK, getSubBranchesForGame } from "@/lib/data";
import { KATEGORIA_LABELS, relevantKategoriak } from "@/lib/recommendation-engine";
import {
  BUDGET_OPTIONS,
  FEGYVERTIPUS_OPTIONS,
  GAME_OPTIONS,
  MANUFACTURER_OPTIONS,
  NO_MANUFACTURER_PREFERENCE,
  RANGE_OPTIONS,
  STEP_ORDER,
  STEP_TITLES,
  VADASZATI_MOD_OPTIONS,
  type StepKind,
} from "@/lib/wizard-questions";
import type {
  BudgetLevel,
  FegyverTipus,
  Kategoria,
  LovedekKategoriaId,
  RangeCategory,
  SubBranchId,
  VadaszatiMod,
  WizardAnswers,
} from "@/lib/types";

const CALIBERS_BY_KATEGORIA = (Object.keys(KATEGORIA_LABELS) as Kategoria[]).map((kategoria) => ({
  kategoria,
  label: KATEGORIA_LABELS[kategoria],
  calibers: CALIBERS.filter((c) => c.kategoria === kategoria),
}));

// A "mély átütés / afrikai szolid" lövedék-kategória csak akkor releváns, ha a
// kiválasztott vadfaj kategóriája afrikai nagyvad/Weatherby — a jelenlegi
// hazai vadfaj-listával ez sosem áll fenn, de a kód erre az esetre is fel van
// készítve, ha a jövőben bővül a fajlista.
const AFRIKAI_RELEVANS_KATEGORIAK: Kategoria[] = ["afrikai_nagyvad", "weatherby"];

type PartialAnswers = Partial<WizardAnswers>;

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<PartialAnswers>({
    preferredManufacturers: [],
    olommentesSzukseges: false,
  });

  // A "subbranch" lépés csak akkor aktív, ha a kiválasztott vadfajhoz tartozik
  // ivar/méret szerinti al-ág (vaddiszno, gímszarvas, dámszarvas, muflon).
  const subBranches = answers.game ? getSubBranchesForGame(answers.game) : null;
  const activeSteps: StepKind[] = useMemo(
    () => STEP_ORDER.filter((kind) => kind !== "subbranch" || Boolean(subBranches)),
    [subBranches],
  );
  const totalSteps = activeSteps.length;
  const currentKind = activeSteps[step];

  const showAfrikaiOption = useMemo(() => {
    if (!answers.game) return false;
    return relevantKategoriak(answers.game).some((k) => AFRIKAI_RELEVANS_KATEGORIAK.includes(k));
  }, [answers.game]);

  const lovedekOptions = LOVEDEK_KATEGORIAK.filter(
    (k) => k.id !== "melyathatolas_afrikai" || showAfrikaiOption,
  );

  const isStepComplete = useMemo(() => {
    switch (currentKind) {
      case "game":
        return Boolean(answers.game);
      case "subbranch":
        return Boolean(answers.subCategory);
      case "range":
        return Boolean(answers.range);
      case "fegyvertipus":
        return Boolean(answers.fegyvertipus);
      case "lovedek":
        return Boolean(answers.lovedekKategoria);
      case "vadaszatimod":
        return Boolean(answers.vadaszatiMod);
      case "budget":
        return Boolean(answers.budget);
      case "existingCaliber":
        return Boolean(answers.existingCaliberId);
      case "manufacturers":
        return true;
      default:
        return false;
    }
  }, [currentKind, answers]);

  function goNext() {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
      return;
    }
    const finalAnswers = answers as WizardAnswers;
    const params = new URLSearchParams({
      game: finalAnswers.game,
      subCategory: finalAnswers.subCategory ?? "",
      range: finalAnswers.range,
      fegyvertipus: finalAnswers.fegyvertipus,
      lovedekKategoria: finalAnswers.lovedekKategoria,
      olommentesSzukseges: String(Boolean(finalAnswers.olommentesSzukseges)),
      vadaszatiMod: finalAnswers.vadaszatiMod,
      budget: finalAnswers.budget,
      existingCaliberId: finalAnswers.existingCaliberId,
      manufacturers: finalAnswers.preferredManufacturers.join(","),
    });
    router.push(`/eredmeny?${params.toString()}`);
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function selectGame(id: GameIconKey) {
    setAnswers((prev) => ({ ...prev, game: id, subCategory: undefined }));
  }

  function toggleManufacturer(name: string) {
    setAnswers((prev) => {
      const current = prev.preferredManufacturers ?? [];
      if (name === NO_MANUFACTURER_PREFERENCE) {
        return { ...prev, preferredManufacturers: [NO_MANUFACTURER_PREFERENCE] };
      }
      const withoutNone = current.filter((m) => m !== NO_MANUFACTURER_PREFERENCE);
      const next = withoutNone.includes(name)
        ? withoutNone.filter((m) => m !== name)
        : [...withoutNone, name];
      return { ...prev, preferredManufacturers: next };
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <ProgressBar step={step} total={totalSteps} />
      <h1 className="font-display text-2xl font-semibold text-forest-950 sm:text-3xl">
        {currentKind ? STEP_TITLES[currentKind] : ""}
      </h1>

      <div className="mt-8">
        {currentKind === "game" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {GAME_OPTIONS.map((opt) => {
              const Icon = GAME_ICONS[opt.id as GameIconKey];
              return (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  hint={opt.hint}
                  icon={<Icon className="h-12 w-12" />}
                  selected={answers.game === opt.id}
                  onClick={() => selectGame(opt.id)}
                />
              );
            })}
          </div>
        )}

        {currentKind === "subbranch" && subBranches && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {subBranches.map((opt) => (
              <OptionCard
                key={opt.alag_id}
                label={opt.megjelenites}
                selected={answers.subCategory === opt.alag_id}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, subCategory: opt.alag_id as SubBranchId }))
                }
              />
            ))}
          </div>
        )}

        {currentKind === "range" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {RANGE_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.id}
                label={opt.label}
                hint={opt.hint}
                selected={answers.range === opt.id}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, range: opt.id as RangeCategory }))
                }
              />
            ))}
          </div>
        )}

        {currentKind === "fegyvertipus" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {FEGYVERTIPUS_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.id}
                label={opt.label}
                hint={opt.hint}
                selected={answers.fegyvertipus === opt.id}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, fegyvertipus: opt.id as FegyverTipus }))
                }
              />
            ))}
          </div>
        )}

        {currentKind === "lovedek" && (
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {lovedekOptions.map((opt) => (
                <OptionCard
                  key={opt.id}
                  label={opt.megjelenites}
                  hint={opt.leiras}
                  selected={answers.lovedekKategoria === opt.id}
                  onClick={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      lovedekKategoria: opt.id as LovedekKategoriaId,
                    }))
                  }
                />
              ))}
            </div>
            <p className="mt-4 text-xs text-forest-700/80">
              A pontos lövés helye mindig a legfontosabb tényező a gyors, tiszta terítésben —
              ezt a lövedék típusa nem helyettesíti, csak kiegészíti. Az alábbi választás azt
              befolyásolja, hogyan viselkedik a lövedék a vad testében becsapódás után.
            </p>

            <div className="mt-6 rounded-2xl border-2 border-dashed border-forest-900/15 bg-tan-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-forest-700">
                További szűrő
              </p>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(answers.olommentesSzukseges)}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, olommentesSzukseges: e.target.checked }))
                  }
                  className="h-5 w-5 rounded border-forest-900/30 text-forest-700 focus:ring-forest-600"
                />
                <span className="font-medium text-forest-950">Ólommentes lőszert keresek</span>
              </label>
              <p className="mt-2 text-xs text-forest-700/80">
                Egyes vadászterületeken és élőhelyeken (pl. vizes élőhelyek közelében) az EU
                szabályozása korlátozza az ólomsörét/ólomlövedék használatát — érdemes
                tájékozódni a helyi előírásokról.
              </p>
            </div>
          </div>
        )}

        {currentKind === "vadaszatimod" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {VADASZATI_MOD_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.id}
                label={opt.label}
                hint={opt.hint}
                selected={answers.vadaszatiMod === opt.id}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, vadaszatiMod: opt.id as VadaszatiMod }))
                }
              />
            ))}
          </div>
        )}

        {currentKind === "budget" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {BUDGET_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.id}
                label={opt.label}
                hint={opt.hint}
                selected={answers.budget === opt.id}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, budget: opt.id as BudgetLevel }))
                }
              />
            ))}
          </div>
        )}

        {currentKind === "existingCaliber" && (
          <div className="space-y-4">
            <OptionCard
              label="Még nincs fegyverem"
              hint="Kérek kaliber-ajánlást a nulláról"
              selected={answers.existingCaliberId === "nincs"}
              onClick={() => setAnswers((prev) => ({ ...prev, existingCaliberId: "nincs" }))}
            />
            <div className="rounded-2xl border-2 border-forest-900/10 bg-white p-4">
              <label className="mb-2 block text-sm font-medium text-forest-800">
                ...vagy válassza ki a meglévő kaliberét
              </label>
              <select
                className="w-full rounded-lg border border-forest-900/20 bg-tan-50 px-3 py-2 text-forest-950 focus:border-forest-600 focus:outline-none"
                value={
                  answers.existingCaliberId && answers.existingCaliberId !== "nincs"
                    ? answers.existingCaliberId
                    : ""
                }
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, existingCaliberId: e.target.value }))
                }
              >
                <option value="" disabled>
                  Válasszon kalibert…
                </option>
                {CALIBERS_BY_KATEGORIA.filter((g) => g.calibers.length > 0).map((group) => (
                  <optgroup key={group.kategoria} label={group.label}>
                    {group.calibers.map((c) => (
                      <option key={c.nev} value={c.nev}>
                        {c.nev}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        )}

        {currentKind === "manufacturers" && (
          <div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {MANUFACTURER_OPTIONS.map((name) => (
                <OptionCard
                  key={name}
                  label={name}
                  selected={Boolean(answers.preferredManufacturers?.includes(name))}
                  onClick={() => toggleManufacturer(name)}
                />
              ))}
            </div>
            <div className="mt-3">
              <OptionCard
                label="Nincs preferenciám"
                hint="Legyen nyitott bármelyik gyártóra"
                selected={Boolean(
                  answers.preferredManufacturers?.includes(NO_MANUFACTURER_PREFERENCE),
                )}
                onClick={() => toggleManufacturer(NO_MANUFACTURER_PREFERENCE)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className="rounded-full px-5 py-2.5 text-sm font-medium text-forest-800 transition disabled:opacity-0"
        >
          ← Vissza
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!isStepComplete}
          className="rounded-full bg-forest-800 px-6 py-2.5 text-sm font-semibold text-tan-50 transition hover:bg-forest-700 disabled:cursor-not-allowed disabled:bg-forest-900/20 disabled:text-forest-900/40"
        >
          {step === totalSteps - 1 ? "Eredmény megtekintése" : "Tovább →"}
        </button>
      </div>
    </div>
  );
}
