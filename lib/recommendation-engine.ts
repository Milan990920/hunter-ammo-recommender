import { isRimmedCaliber } from "@/lib/ammo-classification";
import { AMMO_SEED, CALIBERS, getAlagAjanlas, getEnrichedAmmoForCaliber } from "@/lib/data";
import type {
  Caliber,
  EnrichedAmmo,
  Kategoria,
  LovedekKategoriaId,
  RangeCategory,
  WizardAnswers,
} from "@/lib/types";

/**
 * Egyszerű, átlátható pontozó logika a kutatott kaliber-adatbázisra
 * (data/calibers.json, `kategoria` mező).
 *
 * FONTOS: a `kategoria` mező és az `elterjedtseg_hu` érték a kutatott
 * adatbázisból származik. Az alábbi vadfaj↔kategória és
 * kategória↔lőtávolság megfeleltetések viszont NEM részei a kutatásnak — ez
 * a mi saját, vadászati gyakorlatra épülő besorolásunk, hogy a wizard
 * kérdéseit össze tudjuk kötni a kategória-alapú adatbázissal.
 *
 * IVAR/MÉRET AL-ÁG (scoreAlag, data/alag_ajanlasok.json) — szakirodalmi alap:
 * a német vadászati szakirodalom és vadászvizsga-felkészítő anyagok
 * következetesen megkülönböztetik a nagytestű szarvasféléknél és a
 * vaddisznónál a "gyenge" (nőivarú/fiatal, németül "Kahlwild" — agancstalan
 * vad, mert csak a hím fejleszt agancsot) és "erős" (kifejlett hím) egyedeket,
 * eltérő kaliber-/lövedéktömeg-ajánlással (pl. gyenge egyedre 6,5x57/7x64/
 * .308 Win/.30-06 könnyebb tartományban, erős egyedre semmi 7mm alatt,
 * nehezebb tartományban). A hivatalos NÉMET minimumkövetelmény (Bundesjagdgesetz:
 * őzre 1000 J/100m, más patásvadra min. 6,5mm + 2000 J/100m) ITT KIZÁRÓLAG
 * összehasonlítási referencia, NEM magyar jogszabályi tény — a magyar
 * minimumokat ettől függetlenül kell ellenőrizni, mielőtt bármi jogszabályi
 * tényként szerepelne az oldalon.
 *
 * A korábbi verzióhoz képest a végső rendezés leegyszerűsödött: a
 * kategória/lőtávolság/fegyvertípus/meglévő-kaliber szempontok csak azt
 * döntik el, mely kaliberek kerülnek egyáltalán szóba (relevancia-küszöb),
 * a végső sorrendet és a top-3-as vágást pedig kizárólag az `elterjedtseg_hu`
 * (és a meglévő kaliber előresorolása) adja.
 */

const HU_RELEVANT_KATEGORIAK: Kategoria[] = [
  "aprovad_ragadozo",
  "univerzalis_kozepes",
  "kozep_europai_klasszikus",
  "nagyvad_europai",
  "magnum_tavoli",
];

const GAME_TO_KATEGORIA: Record<Exclude<WizardAnswers["game"], "vegyes">, Kategoria[]> = {
  aprovad: ["aprovad_ragadozo"],
  oz: ["univerzalis_kozepes", "kozep_europai_klasszikus"],
  muflon: ["univerzalis_kozepes", "kozep_europai_klasszikus", "magnum_tavoli"],
  damszarvas: ["univerzalis_kozepes", "kozep_europai_klasszikus", "nagyvad_europai"],
  gimszarvas: ["kozep_europai_klasszikus", "nagyvad_europai", "magnum_tavoli"],
  vaddiszno: ["kozep_europai_klasszikus", "nagyvad_europai", "magnum_tavoli"],
};

const KATEGORIA_RANGE_HINT: Record<Kategoria, RangeCategory[]> = {
  aprovad_ragadozo: ["kozeli", "kozepes"],
  univerzalis_kozepes: ["kozeli", "kozepes", "nagy"],
  kozep_europai_klasszikus: ["kozeli", "kozepes", "nagy"],
  nagyvad_europai: ["kozeli", "kozepes"],
  magnum_tavoli: ["kozepes", "nagy"],
  afrikai_nagyvad: ["kozeli"],
  weatherby: ["nagy"],
};

export const KATEGORIA_LABELS: Record<Kategoria, string> = {
  aprovad_ragadozo: "Ragadozó / dúvad (golyós fegyverrel)",
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

const KATEGORIA_WEIGHT = 3;
const RANGE_WEIGHT = 2;
const FEGYVERTIPUS_WEIGHT = 1.5;
const EXISTING_CALIBER_WEIGHT = 3;
const POPULARITY_WEIGHT = 1;

const GAME_LABELS: Record<string, string> = {
  gimszarvas: "gímszarvas",
  damszarvas: "dámszarvas",
  oz: "őz",
  muflon: "muflon",
  vaddiszno: "vaddisznó",
  aprovad: "ragadozó/dúvad",
};

const RANGE_LABELS: Record<RangeCategory, string> = {
  kozeli: "közeli (<100 m)",
  kozepes: "közepes (100–200 m)",
  nagy: "nagy (200 m+)",
};

export function relevantKategoriak(game: WizardAnswers["game"]): Kategoria[] {
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

function scoreFegyvertipus(caliber: Caliber, answers: WizardAnswers) {
  const rimmed = isRimmedCaliber(caliber.nev);

  if (answers.fegyvertipus === "nyitott") {
    return { points: FEGYVERTIPUS_WEIGHT, reason: null };
  }

  if (answers.fegyvertipus === "ismetlo") {
    if (!rimmed) return { points: FEGYVERTIPUS_WEIGHT, reason: null };
    return {
      points: FEGYVERTIPUS_WEIGHT * 0.3,
      reason:
        "Ez peremes (R) kaliberváltozat — ismétlő fegyverbe jellemzően ritkábban, speciális kivitelben készül.",
    };
  }

  // billeno_csovu_kombinalt
  if (rimmed) {
    return {
      points: FEGYVERTIPUS_WEIGHT,
      reason: "Billenő csövű/kombinált fegyverekhez jellemzően előnyben részesített, peremes (R) kaliberváltozat.",
    };
  }
  return {
    points: FEGYVERTIPUS_WEIGHT * 0.6,
    reason:
      "Ez rimless (nem peremes) kaliber — billenő csövű/kombinált fegyverbe jellemzően csak hüvelytoldatos/adapteres megoldással tölthető.",
  };
}

/**
 * Hajtóvadászaton/terelésen a szakirodalom szerint a gyorsaság, megbízhatóság
 * és a nagyobb megállítóerő a döntő szempont — ezek a kaliberek (és a velük
 * azonos kategóriába eső "hasonló társak") kapnak ezért pluszpontot. Ez a mi
 * saját, a kapott szakmai brief alapján rögzített listánk, nem a
 * calibers.json kutatott adata.
 */
const HAJTAS_PRIORITY_CALIBERS = new Set([".308 Winchester", ".30-06 Springfield", "8x57 IS (JS)", "9,3x62"]);
const HAJTAS_PRIORITY_KATEGORIAK: Kategoria[] = ["kozep_europai_klasszikus", "nagyvad_europai"];
const VADASZATIMOD_WEIGHT = 1.5;

function scoreVadaszatiMod(caliber: Caliber, answers: WizardAnswers) {
  if (answers.vadaszatiMod === "cserkeles_lesvadaszat") {
    return { points: VADASZATIMOD_WEIGHT, reason: null };
  }
  if (HAJTAS_PRIORITY_CALIBERS.has(caliber.nev)) {
    return {
      points: VADASZATIMOD_WEIGHT,
      reason:
        "Hajtóvadászaton/terelésen jellemzően ajánlott, mérsékelt visszarúgású, de kellően nagy energiájú kaliber.",
    };
  }
  if (HAJTAS_PRIORITY_KATEGORIAK.includes(caliber.kategoria)) {
    return {
      points: VADASZATIMOD_WEIGHT * 0.6,
      reason: "A hajtóvadászaton jellemzően ajánlott kaliberekhez hasonló kategóriájú, mérsékelt visszarúgású kaliber.",
    };
  }
  return { points: 0, reason: null };
}

const ALAG_WEIGHT = 1.5;

/**
 * Ivar/méret szerinti al-ág (data/alag_ajanlasok.json) alapú pluszpont — a
 * német vadászati szakirodalom "gyenge/erős" egyed megkülönböztetése alapján
 * (lásd README). Puha preferencia: az al-ág ajánlott kaliberlistáján kívüli
 * kaliberek nem kapnak pontot, de nem is zárjuk ki őket a kategória-egyezés
 * hard gate-jén felül.
 */
function scoreAlag(caliber: Caliber, answers: WizardAnswers) {
  if (!answers.subCategory) return { points: 0, reason: null };
  const alag = getAlagAjanlas(answers.subCategory);
  if (!alag) return { points: 0, reason: null };
  if (alag.ajanlott_kaliberek.includes(caliber.nev)) {
    return {
      points: ALAG_WEIGHT,
      reason: `Az Ön által megadott ivar/méret esetén jellemzően ajánlott kaliber (${alag.lovedektomeg_iranyelv}).`,
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
    const fegyvertipus = scoreFegyvertipus(caliber, answers);
    const vadaszatiMod = scoreVadaszatiMod(caliber, answers);
    const alag = scoreAlag(caliber, answers);
    const existing = scoreExistingCaliber(caliber, answers);
    const popularity = scorePopularity(caliber);

    const score =
      kategoriaMatch.points +
      range.points +
      fegyvertipus.points +
      vadaszatiMod.points +
      alag.points +
      existing.points +
      popularity.points;
    const maxScore =
      KATEGORIA_WEIGHT +
      RANGE_WEIGHT +
      FEGYVERTIPUS_WEIGHT +
      VADASZATIMOD_WEIGHT +
      (answers.subCategory ? ALAG_WEIGHT : 0) +
      (existing.active ? EXISTING_CALIBER_WEIGHT : 0) +
      POPULARITY_WEIGHT;

    const reasons = [
      kategoriaMatch.reason,
      existing.reason,
      range.reason,
      fegyvertipus.reason,
      vadaszatiMod.reason,
      alag.reason,
      popularity.reason,
    ].filter((r): r is string => Boolean(r));

    const isOwned = caliber.nev === answers.existingCaliberId;
    const speciesRelevant = relevantKategoriak(answers.game).includes(caliber.kategoria);

    return { caliber, score, maxScore, reasons, isOwned, speciesRelevant };
  });
}

const RELEVANCE_THRESHOLD = 0.4;
const MAX_RECOMMENDATIONS = 3;

export interface RecommendationResult {
  recommendations: {
    caliber: Caliber;
    score: number;
    maxScore: number;
    reasons: string[];
    isOwned: boolean;
    speciesRelevant: boolean;
    ammoOptions: ReturnType<typeof getEnrichedAmmoForCaliber>;
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
    selected = [...fallbackPool].sort((a, b) => b.score - a.score).slice(0, MAX_RECOMMENDATIONS);
  }

  // Rendezés: elterjedtseg_hu szerint csökkenő sorrendben (a meglévő kaliber
  // mindig legelöl), majd vágás a top 3 kaliberre.
  selected.sort((a, b) => {
    if (a.isOwned !== b.isOwned) return a.isOwned ? -1 : 1;
    return b.caliber.elterjedtseg_hu - a.caliber.elterjedtseg_hu;
  });
  selected = selected.slice(0, MAX_RECOMMENDATIONS);

  const preferred = answers.preferredManufacturers.filter((m) => m !== "nincs_preferencia");
  const hajtas = answers.vadaszatiMod === "hajtovadaszat_treles";
  const alagAjanlas = answers.subCategory ? getAlagAjanlas(answers.subCategory) : undefined;
  const preferHeavier = hajtas || alagAjanlas?.suly_irany === "nehezebb";

  const recommendations = selected.map((s) => {
    let ammoOptions = getEnrichedAmmoForCaliber(s.caliber.nev);
    if (answers.olommentesSzukseges) {
      ammoOptions = ammoOptions.filter((a) => a.olommentes);
    }

    // ".308 Win bika-szabály": a hüvely korlátozott kapacitása miatt "erős"
    // (nehezebb súlyirányú) al-ágban a könnyebb, <180 gr-os tételek nem
    // ajánlhatók — ez csak a .308 Winchesterre vonatkozó, konkrét szabály,
    // más kaliberekre (7x64, .30-06 stb.) a nagyobb hüvelykapacitás miatt
    // nem kell hard-filternek lennie, csak a sorrendben előrébb kerülnek.
    if (s.caliber.nev === ".308 Winchester" && alagAjanlas?.suly_irany === "nehezebb") {
      ammoOptions = ammoOptions.filter((a) => extractMaxGrainWeight(a.tomeg) >= 180);
    }

    ammoOptions = [...ammoOptions].sort((a, b) => {
      const aPreferred = preferred.includes(a.gyarto) ? 1 : 0;
      const bPreferred = preferred.includes(b.gyarto) ? 1 : 0;
      if (aPreferred !== bPreferred) return bPreferred - aPreferred;
      // Hajtóvadászaton/terelésen, illetve "erős" (bika/kan/kos) al-ágban a
      // nehezebb lövedéktömeg-tartomány jellemzően megbízhatóbb átütést ad,
      // ezért ilyenkor a nehezebb tételek kerülnek előre.
      if (preferHeavier) return extractMaxGrainWeight(b.tomeg) - extractMaxGrainWeight(a.tomeg);
      return 0;
    });
    return { ...s, ammoOptions };
  });

  return { recommendations, fallbackUsed };
}

/** Legnagyobb grain-érték egy "tomeg" mezőből (pl. "150 gr / 180 gr" → 180). Nincs találat esetén 0. */
export function extractMaxGrainWeight(tomeg: string): number {
  const matches = [...tomeg.matchAll(/(\d+(?:[.,]\d+)?)\s*gr/gi)];
  if (matches.length === 0) return 0;
  return Math.max(...matches.map((m) => parseFloat(m[1].replace(",", "."))));
}

/** Igaz, ha a ".308 Win bika-szabály" magyarázó szövegét meg kell jeleníteni ehhez a kaliberhez/al-ághoz. */
export function shouldShow308WinBikaSzabaly(
  caliberNev: string,
  subCategory: WizardAnswers["subCategory"],
): boolean {
  if (caliberNev !== ".308 Winchester" || !subCategory) return false;
  return getAlagAjanlas(subCategory)?.suly_irany === "nehezebb";
}

/**
 * Az eredményoldalon melyik lövedék-viselkedési kategóriát vezessük a
 * lőszerlistában. Alapesetben a felhasználó saját választása (`lovedekKategoria`).
 *
 * Két eset kényszeríti "kiegyensúlyozott"-ra, függetlenül a felhasználó saját
 * választásától:
 * 1. Hajtóvadászat/terelés — kizárólag nagyvad fajoknál, NEM ragadozó/
 *    dúvadnál, ahol a "gyors hatás" kategória a species-alapú logika szerint
 *    is indokolt marad.
 * 2. "Erős" ivar/méret al-ág (bika/kan/kos) — a német szakirodalom szerint a
 *    kifejlett hím egyedeknél a megbízható, kiszámítható átütés a döntő, nem
 *    a gyors fragmentáció (data/alag_ajanlasok.json `kiegyensulyozott_kotelezo`).
 */
export function resolvePreferredLovedekKategoria(answers: WizardAnswers): LovedekKategoriaId {
  if (answers.vadaszatiMod === "hajtovadaszat_treles" && answers.game !== "aprovad") {
    return "kiegyensulyozott";
  }
  if (answers.subCategory && getAlagAjanlas(answers.subCategory)?.kiegyensulyozott_kotelezo) {
    return "kiegyensulyozott";
  }
  return answers.lovedekKategoria;
}

/** Egy lőszer valóban "Driven Hunt"/hajtásra pozicionált termékvonal-e (névalapú detektálás). */
export function isDrivenHuntProduct(ammo: EnrichedAmmo): boolean {
  return /driven hunt/i.test(ammo.termeknev);
}

/** Csak diagnosztikához/tesztekhez: az összes gyártó, aminek van seed-adata. */
export function listSeedManufacturers(): string[] {
  return Array.from(new Set(AMMO_SEED.map((a) => a.gyarto))).sort();
}
