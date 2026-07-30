import { AMMO, CALIBERS } from "@/lib/data";
import type {
  Ammo,
  Caliber,
  CaliberRecommendation,
  RangeCategory,
  RecoilLevel,
  WizardAnswers,
} from "@/lib/types";

/**
 * Egyszerű, átlátható pontozó logika: minden kaliber minden kérdésre kap egy
 * részpontszámot és (ha releváns) egy magyarázó mondatot. A végén a
 * küszöbérték feletti KALIBEREK MIND megjelennek — nincs mesterséges "csak
 * a legjobbat mutasd" korlátozás, hogy a felhasználó lássa a rendszer teljes
 * indoklását és mérlegelhessen alternatívák között.
 */

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

const GAME_WEIGHT = 3;
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
  aprovad: "apróvad/ragadozó",
};

const RANGE_LABELS: Record<RangeCategory, string> = {
  kozeli: "közeli (<100 m)",
  kozepes: "közepes (100–200 m)",
  nagy: "nagy (200 m+)",
};

function scoreGameMatch(caliber: Caliber, answers: WizardAnswers) {
  if (answers.game === "vegyes") {
    if (caliber.targetGame.length >= 2) {
      return {
        points: GAME_WEIGHT,
        reason:
          "Több vadfajra is jellemzően használt, univerzális kaliber — jó választás vegyes vadászathoz.",
      };
    }
    return { points: GAME_WEIGHT * 0.4, reason: null };
  }

  if (caliber.targetGame.includes(answers.game)) {
    const label = GAME_LABELS[answers.game] ?? answers.game;
    return {
      points: GAME_WEIGHT,
      reason: `Kifejezetten ${label} vadászatára jellemzően használt kaliber.`,
    };
  }
  return { points: 0, reason: null };
}

function scoreRangeMatch(caliber: Caliber, answers: WizardAnswers) {
  if (caliber.rangeCategories.includes(answers.range)) {
    return {
      points: RANGE_WEIGHT,
      reason: `Megfelel az Ön által jelzett ${RANGE_LABELS[answers.range]} lőtávolságnak.`,
    };
  }
  const isAdjacent = caliber.rangeCategories.some((rc) =>
    RANGE_ADJACENCY[answers.range]?.includes(rc),
  );
  if (isAdjacent) {
    return {
      points: RANGE_WEIGHT * 0.5,
      reason: `Részben illeszkedik a jelzett lőtávolsághoz (a szomszédos tartományban is jól használható).`,
    };
  }
  return { points: 0, reason: null };
}

function scoreExistingCaliber(caliber: Caliber, answers: WizardAnswers) {
  if (answers.existingCaliberId === "nincs") {
    return { active: false, points: 0, reason: null };
  }
  if (caliber.id === answers.existingCaliberId) {
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
  const caliberRank = RECOIL_RANK[caliber.recoilLevel];

  if (caliberRank <= toleranceRank) {
    return {
      points: RECOIL_WEIGHT,
      reason: "Visszarúgása illeszkedik az Ön jelzett tűrőképességéhez/tapasztalatához.",
    };
  }
  if (caliberRank === toleranceRank + 1) {
    return {
      points: RECOIL_WEIGHT * 0.4,
      reason: null,
    };
  }
  return { points: 0, reason: null };
}

function scorePopularity(caliber: Caliber) {
  const points = (caliber.popularityHU / 5) * POPULARITY_WEIGHT;
  if (caliber.popularityHU >= 4) {
    return {
      points,
      reason: "Magyarországon jól elterjedt kaliber — könnyű hozzá lőszert és alkatrészt beszerezni.",
    };
  }
  return { points, reason: null };
}

export function scoreCalibers(answers: WizardAnswers) {
  return CALIBERS.map((caliber) => {
    const game = scoreGameMatch(caliber, answers);
    const range = scoreRangeMatch(caliber, answers);
    const existing = scoreExistingCaliber(caliber, answers);
    const recoil = scoreRecoil(caliber, answers);
    const popularity = scorePopularity(caliber);

    const score = game.points + range.points + existing.points + recoil.points + popularity.points;
    const maxScore =
      GAME_WEIGHT + RANGE_WEIGHT + (existing.active ? EXISTING_CALIBER_WEIGHT : 0) + RECOIL_WEIGHT + POPULARITY_WEIGHT;

    const reasons = [game.reason, existing.reason, range.reason, recoil.reason, popularity.reason].filter(
      (r): r is string => Boolean(r),
    );

    const isOwned = caliber.id === answers.existingCaliberId;
    const speciesRelevant = answers.game === "vegyes" || caliber.targetGame.includes(answers.game);

    return { caliber, score, maxScore, reasons, isOwned, speciesRelevant };
  });
}

const RELEVANCE_THRESHOLD = 0.4;

/** Egy ammo-ra vonatkozó relevancia-pontszám és rövid indoklás. */
function scoreAmmo(ammo: Ammo, answers: WizardAnswers) {
  let points = 0;
  const reasons: string[] = [];

  if (ammo.purpose.includes(answers.goal)) {
    points += 2;
    const goalLabel = { pontossag: "pontosság", ar: "elérhető ár", hatekonysag: "hatékony terítés" }[
      answers.goal
    ];
    reasons.push(`Az Ön elsődleges célja (${goalLabel}) szempontjából jó választás.`);
  }

  if (ammo.priceCategory === answers.budget) {
    points += 1.5;
    reasons.push("Illeszkedik a megadott költségkeretbe.");
  }

  if (
    answers.preferredManufacturers.length > 0 &&
    !answers.preferredManufacturers.includes("nincs_preferencia") &&
    answers.preferredManufacturers.includes(ammo.manufacturer)
  ) {
    points += 2;
    reasons.push(`Az Ön által preferált gyártó (${ammo.manufacturer}) terméke.`);
  }

  if (answers.game !== "vegyes" && ammo.suitedGame.includes(answers.game)) {
    points += 1;
  }

  return { points, reasons };
}

export function getAmmoRecommendations(caliberId: string, answers: WizardAnswers) {
  return AMMO.filter((a) => a.caliberIds.includes(caliberId))
    .map((ammo) => {
      const { points, reasons } = scoreAmmo(ammo, answers);
      return { ammo, points, reasons };
    })
    .sort((a, b) => b.points - a.points)
    .map(({ ammo, reasons }) => ({ ...ammo, matchReasons: reasons }));
}

export interface RecommendationResult {
  recommendations: CaliberRecommendation[];
  fallbackUsed: boolean;
}

export function generateRecommendations(answers: WizardAnswers): RecommendationResult {
  const scored = scoreCalibers(answers);

  // A vadfaj-egyezés a legfontosabb, kizáró jellegű szempont: olyan kaliber,
  // amit jellemzően nem az adott vadfajra használnak, nem javasolható —
  // kivéve, ha ez a felhasználó már meglévő kalibere (azt mindig megmutatjuk).
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

  selected.sort((a, b) => {
    if (a.isOwned !== b.isOwned) return a.isOwned ? -1 : 1;
    return b.score / b.maxScore - a.score / a.maxScore;
  });

  const recommendations: CaliberRecommendation[] = selected.map((s) => ({
    ...s,
    ammoOptions: getAmmoRecommendations(s.caliber.id, answers),
  }));

  return { recommendations, fallbackUsed };
}
