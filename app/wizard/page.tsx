"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import OptionCard from "@/components/OptionCard";
import { GAME_ICONS, type GameIconKey } from "@/components/icons/GameIcons";
import { CALIBERS } from "@/lib/data";
import {
  BUDGET_OPTIONS,
  GAME_OPTIONS,
  GOAL_OPTIONS,
  MANUFACTURER_OPTIONS,
  NO_MANUFACTURER_PREFERENCE,
  RANGE_OPTIONS,
  RECOIL_OPTIONS,
  WIZARD_STEP_TITLES,
} from "@/lib/wizard-questions";
import type {
  BudgetLevel,
  Goal,
  RangeCategory,
  RecoilLevel,
  WizardAnswers,
} from "@/lib/types";

const TOTAL_STEPS = WIZARD_STEP_TITLES.length;

type PartialAnswers = Partial<WizardAnswers>;

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<PartialAnswers>({
    preferredManufacturers: [],
  });

  const isStepComplete = useMemo(() => {
    switch (step) {
      case 0:
        return Boolean(answers.game);
      case 1:
        return Boolean(answers.range);
      case 2:
        return Boolean(answers.existingCaliberId);
      case 3:
        return Boolean(answers.recoilSensitivity);
      case 4:
        return Boolean(answers.goal);
      case 5:
        return Boolean(answers.budget);
      case 6:
        return true;
      default:
        return false;
    }
  }, [step, answers]);

  function goNext() {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      return;
    }
    const finalAnswers = answers as WizardAnswers;
    const params = new URLSearchParams({
      game: finalAnswers.game,
      range: finalAnswers.range,
      existingCaliberId: finalAnswers.existingCaliberId,
      recoilSensitivity: finalAnswers.recoilSensitivity,
      goal: finalAnswers.goal,
      budget: finalAnswers.budget,
      manufacturers: finalAnswers.preferredManufacturers.join(","),
    });
    router.push(`/eredmeny?${params.toString()}`);
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
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
      <ProgressBar step={step} total={TOTAL_STEPS} />
      <h1 className="font-display text-2xl font-semibold text-forest-950 sm:text-3xl">
        {WIZARD_STEP_TITLES[step]}
      </h1>

      <div className="mt-8">
        {step === 0 && (
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
                  onClick={() => setAnswers((prev) => ({ ...prev, game: opt.id }))}
                />
              );
            })}
          </div>
        )}

        {step === 1 && (
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

        {step === 2 && (
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
                {CALIBERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {RECOIL_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.id}
                label={opt.label}
                hint={opt.hint}
                selected={answers.recoilSensitivity === opt.id}
                onClick={() =>
                  setAnswers((prev) => ({
                    ...prev,
                    recoilSensitivity: opt.id as RecoilLevel | "nem_szamit",
                  }))
                }
              />
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {GOAL_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.id}
                label={opt.label}
                hint={opt.hint}
                selected={answers.goal === opt.id}
                onClick={() => setAnswers((prev) => ({ ...prev, goal: opt.id as Goal }))}
              />
            ))}
          </div>
        )}

        {step === 5 && (
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

        {step === 6 && (
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
          {step === TOTAL_STEPS - 1 ? "Eredmény megtekintése" : "Tovább →"}
        </button>
      </div>
    </div>
  );
}
