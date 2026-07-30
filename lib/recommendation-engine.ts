import { AMMO_SEED, CALIBERS, getAmmoSeedForCaliber } from "@/lib/data";
import type {
  Caliber,
  Kategoria,
  RangeCategory,
  RecoilLevel,
  WizardAnswers,
} from "@/lib/types";

/**
 * Egyszerű, átlátható pontozó logika a kutatott kaliber-adatbázisra
 * (data/calibers.json, `kategoria` mező). A küszöbérték feletti KALIBEREK
 * MIND megjelennek — nincs mesterséges "csak a legjobbat mutasd" korlátozás.
 *
 * FONTOS: a `kategoria` mező és az `elterjedtseg_hu` érték a kutatott
 * adatbázisból származik. Az alábbi vadfaj↔kategória és
 * kategória↔lőtávolság/visszarúgás megfeleltetések viszont NEM részei a
 * kutatásnak — ez a mi saját, vadászati gyakorlatra épülő besorolásunk,
 * hogy a wizard kérdéseit össze tudjuk kötni a kategória-alapú adatbázissal.
 * Módosítsd bátran, ha szakmailag indokolt finomítás szükséges.
 */

const HU_RELEVANT_KATEGORIAK: Kategoria[] = [
  "aprovad_roka",
  "univerzalis_kozepes",
  "kozep_europai_klasszikus",
  "nagyvad_europai",
  "magnum_tavoli",
];

const GAME_TO_KATEGORIA: Record<Exclude<WizardAnswers["game"], "vegyes">, Kategoria[]> = {
  aprovad: ["aprovad_roka"],
  oz: ["univerzalis_kozepes", "kozep_europai_klasszikus"],
  muflon: ["univerzalis_kozepes", "kozep_europai_klasszikus", "magnum_tavoli"],
  damszarvas: ["univerzalis_kozepes", "kozep_europai_klasszikus", "nagyvad_europai"],
  gimszarvas: ["kozep_europai_klasszikus", "nagyvad_europai", "magnum_tavoli"],
  vaddiszno: ["kozep_europai_klasszikus", "nagyvad_europai", "magnum_tavoli"],
};

const KATEGORIA_RANGE_HINT: Record<Kategoria, RangeCategory[]> = {
  aprovad_roka: ["kozeli", "kozepes"],
  univerzalis_kozepes: ["kozeli", "kozepes", "nagy"],
  kozep_europai_klasszikus: ["kozeli", "kozepes", "nagy"],
  nagyvad_europai: ["kozeli", "kozepes"],
  magnum_tavoli: ["kozepes", "nagy"],
  afrikai_nagyvad: ["kozeli"],
  weatherby: ["nagy"],
};

const KATEGORIA_RECOIL_HINT: Record<Kategoria, RecoilLevel> = {
  aprovad_roka: "alacsony",
  univerzalis_kozepes: "alacsony",
  kozep_europai_klasszikus: "kozepes",
  nagyvad_europai: "kozepes",
  magnum_tavoli: "magas",
  afrikai_nagyvad: "magas",
  weatherby: "magas",
};

export const KATEGORIA_LABELS: Record<Kategoria, string> = {
  aprovad_roka: "Apróvad / róka",
  univerzalis_kozepes: "Univerzális, közepes",
  kozep_europai_klasszikus: "Közép-európai klasszikus",
  nagyvad_europai: "Európai nagyvad",
  magnum_tavoli: "Magnum / nagy távolság",
  afrikai_nagyvad: "Afrikai nagyvad (veszélyes vad)",
  weatherby: "Weatherby speciális",
};

const RANGE_ADJACENCY: Record<RangeCategory, RangeCategory[]> = {
  kozeli: ["kozepes"],
  kozepes: ["kozeli", "nagy"],
  nagy: ["kozepes"],
};

const RECOIL_RANK: Record<RecoilLevel, number> = {
  alacsony: 1,
  kozepes: 2,
  magas: 3,
};

const KATEGORIA_WEIGHT = 3;
const RANGE_WEIGHT = 2;
const EXISTING_CALIBER_WEIGHT = 3;
const RECOIL_WEIGHT = 2;
const POPULARITY_WEIGHT = 1;

const GAME_LABELS: Record<string, string> = {
  gimszarvas: "gímszarvas",
  damszarvas: "dámszarvas",
  oz: "őz",
  muflon: "muflon",
  vaddiszno: "vaddisznó",
  aprovad: "apróvad/róka",
};

const RANGE_LABELS: Record<RangeCategory, string> = {
  kozeli: "közeli (<100 m)",
  kozepes: "közepes (100–200 m)",
  nagy: "nagy (200 m+)",
};

function relevantKategoriak(game: WizardAnswers["game"]): Kategoria[] {
  return game === "vegyes" ? HU_RELEVANT_KATEGORIAK : GAME_TO_KATEGORIA[game];
}

function scoreKategoriaMatch(caliber: Caliber, answers: WizardAnswers) {
  const relevant = relevantKategoriak(answers.game);
  if (!relevant.includes(caliber.kategoria)) {
    return { points: 0, reason: null };
  }
  if (answers.game === "vegyes") {
    return {
      points: KATEGORIA_WEIGHT,
      reason: "Több vadfajra is jellemzően használt kategóriába tartozó kaliber — jó választás vegyes vadászathoz.",
    };
  }
  const label = GAME_LABELS[answers.game] ?? answers.game;
  return {
    points: KATEGORIA_WEIGHT,
    reason: `Jellemzően ${label} vadászatára használt kaliberkategóriába (${KATEGORIA_LABELS[caliber.kategoria]}) tartozik.`,
  };
}

function scoreRangeMatch(caliber: Caliber, answers: WizardAnswers) {
  const ranges = KATEGORIA_RANGE_HINT[caliber.kategoria];
  if (ranges.includes(answers.range)) {
    return {
      points: RANGE_WEIGHT,
      reason: `Megfelel az Ön által jelzett ${RANGE_LABELS[answers.range]} lőtávolságnak.`,
    };
  }
  const isAdjacent = ranges.some((rc) => RANGE_ADJACENCY[answers.range]?.includes(rc));
  if (isAdjacent) {
    return {
      points: RANGE_WEIGHT * 0.5,
      reason: "Részben illeszkedik a jelzett lőtávolsághoz (a szomszédos tartományban is jól használható).",
    };
  }
  return { points: 0, reason: null };
}

function scoreExistingCaliber(caliber: Caliber, answers: WizardAnswers) {
  if (answers.existingCaliberId === "nincs") {
    return { active: false, points: 0, reason: null };
  }
  if (caliber.nev === answers.existingCaliberId) {
    return {
      active: true,
      points: EXISTING_CALIBER_WEIGHT,
      reason: "Ez a kaliber már megvan Önnek — nincs szükség új fegyver vásárlására.",
    };
  }
  return { active: true, points: 0, reason: null };
}

function scoreRecoil(caliber: Caliber, answers: WizardAnswers) {
  if (answers.recoilSensitivity === "nem_szamit") {
    return { points: RECOIL_WEIGHT, reason: null };
  }
  const toleranceRank = RECOIL_RANK[answers.recoilSensitivity as RecoilLevel];
  const caliberRank = RECOIL_RANK[KATEGORIA_RECOIL_HINT[caliber.kategoria]];

  if (caliberRank <= toleranceRank) {
    return {
      points: RECOIL_WEIGHT,
      reason: "Visszarúgása illeszkedik az Ön jelzett tűrőképességéhez/tapasztalatához.",
    };
  }
  if (caliberRank === toleranceRank + 1) {
    return { points: RECOIL_WEIGHT * 0.4, reason: null };
  }
  return { points: 0, reason: null };
}

function scorePopularity(caliber: Caliber) {
  const points = (caliber.elterjedtseg_hu / 5) * POPULARITY_WEIGHT;
  if (caliber.elterjedtseg_hu >= 4) {
    return {
      points,
      reason: "Magyarországon elterjedt kaliber — jellemzően szélesebb és kedvezőbb árú lőszerkínálattal.",
    };
  }
  return { points, reason: null };
}

export function scoreCalibers(answers: WizardAnswers) {
  return CALIBERS.map((caliber) => {
    const kategoriaMatch = scoreKategoriaMatch(caliber, answers);
    const range = scoreRangeMatch(caliber, answers);
    const existing = scoreExistingCaliber(caliber, answers);
    const recoil = scoreRecoil(caliber, answers);
    const popularity = scorePopularity(caliber);

    const score = kategoriaMatch.points + range.points + existing.points + recoil.points + popularity.points;
    const maxScore =
      KATEGORIA_WEIGHT + RANGE_WEIGHT + (existing.active ? EXISTING_CALIBER_WEIGHT : 0) + RECOIL_WEIGHT + POPULARITY_WEIGHT;

    const reasons = [kategoriaMatch.reason, existing.reason, range.reason, recoil.reason, popularity.reason].filter(
      (r): r is string => Boolean(r),
    );

    const isOwned = caliber.nev === answers.existingCaliberId;
    const speciesRelevant = relevantKategoriak(answers.game).includes(caliber.kategoria);

    return { caliber, score, maxScore, reasons, isOwned, speciesRelevant };
  });
}

const RELEVANCE_THRESHOLD = 0.4;

export interface RecommendationResult {
  recommendations: {
    caliber: Caliber;
    score: number;
    maxScore: number;
    reasons: string[];
    isOwned: boolean;
    speciesRelevant: boolean;
    ammoOptions: ReturnType<typeof getAmmoSeedForCaliber>;
  }[];
  fallbackUsed: boolean;
}

export function generateRecommendations(answers: WizardAnswers): RecommendationResult {
  const scored = scoreCalibers(answers);

  // A vadfaj-kategória egyezés a legfontosabb, kizáró jellegű szempont: egy
  // kaliber, ami jellemzően nem az adott vadfaj kategóriájába esik, nem
  // javasolható — kivéve, ha ez a felhasználó már meglévő kalibere.
  const speciesCandidates = scored.filter((s) => s.speciesRelevant || s.isOwned);

  let selected = speciesCandidates.filter(
    (s) => s.score / s.maxScore >= RELEVANCE_THRESHOLD || s.isOwned,
  );
  let fallbackUsed = false;

  if (selected.length === 0) {
    fallbackUsed = true;
    const fallbackPool = speciesCandidates.length > 0 ? speciesCandidates : scored;
    selected = [...fallbackPool].sort((a, b) => b.score - a.score).slice(0, 3);
  }

  // Végső rendezés: illeszkedési arány, majd (kutatott) hazai elterjedtség.
  selected.sort((a, b) => {
    if (a.isOwned !== b.isOwned) return a.isOwned ? -1 : 1;
    const ratioDiff = b.score / b.maxScore - a.score / a.maxScore;
    if (Math.abs(ratioDiff) > 0.001) return ratioDiff;
    return b.caliber.elterjedtseg_hu - a.caliber.elterjedtseg_hu;
  });

  const preferred = answers.preferredManufacturers.filter((m) => m !== "nincs_preferencia");

  const recommendations = selected.map((s) => {
    const ammoOptions = [...getAmmoSeedForCaliber(s.caliber.nev)].sort((a, b) => {
      const aPreferred = preferred.includes(a.gyarto) ? 1 : 0;
      const bPreferred = preferred.includes(b.gyarto) ? 1 : 0;
      return bPreferred - aPreferred;
    });
    return { ...s, ammoOptions };
  });

  return { recommendations, fallbackUsed };
}

/** Csak diagnosztikához/tesztekhez: az összes gyártó, aminek van seed-adata. */
export function listSeedManufacturers(): string[] {
  return Array.from(new Set(AMMO_SEED.map((a) => a.gyarto))).sort();
}
