import type { GameIconKey } from "@/components/icons/GameIcons";

export type GameType = GameIconKey;

export type RangeCategory = "kozeli" | "kozepes" | "nagy";

export type RecoilLevel = "alacsony" | "kozepes" | "magas";

export type BudgetLevel = "alacsony" | "kozepes" | "magas";

export type Goal = "pontossag" | "ar" | "hatekonysag";

/**
 * A kutatott kaliberadatbázis kategóriái (lásd data/calibers.json). Ez a
 * kutatásból átvett, tényleges csoportosítás — nem mi találtuk ki.
 */
export type Kategoria =
  | "aprovad_roka"
  | "univerzalis_kozepes"
  | "kozep_europai_klasszikus"
  | "nagyvad_europai"
  | "magnum_tavoli"
  | "afrikai_nagyvad"
  | "weatherby";

/** Egy kaliber a data/calibers.json fájlból (kutatott, referált adatok). */
export interface Caliber {
  nev: string;
  lovedek_mm: number;
  /** Jellemző lövedéktömeg-tartomány, gramm (szöveges intervallum). */
  tomeg_g: string;
  /** Becsült torkolatienergia-tartomány, Joule — NEM hivatalos gyártói mérés. */
  energia_j_becsult: string;
  kategoria: Kategoria;
  /** Elterjedtség Magyarországon, 1 (ritka) - 5 (nagyon elterjedt). */
  elterjedtseg_hu: 1 | 2 | 3 | 4 | 5;
  megjegyzes: string;
}

/**
 * Egy gyártói termékpélda-sor a data/manufacturer_products_seed.json fájlból.
 * Ez egy szándékosan NEM teljes lefedettségű kiindulási minta — lásd README.
 */
export interface AmmoSeedEntry {
  gyarto: string;
  /** Nyers kaliber-hivatkozás(ok), "/" -lel elválasztva ha több kaliberre is vonatkozik. */
  kaliber: string | null;
  termeknev: string;
  tomeg: string;
  forras_megjegyzes: string;
  /** Ha true: nincs még valós, kaliber-specifikus termékadat ehhez a gyártóhoz. */
  TODO_ellenorzendo?: boolean;
}

export interface WizardAnswers {
  game: GameType;
  range: RangeCategory;
  /** Egy Caliber.nev érték, vagy "nincs" ha nincs még fegyvere. */
  existingCaliberId: string;
  recoilSensitivity: RecoilLevel | "nem_szamit";
  goal: Goal;
  budget: BudgetLevel;
  preferredManufacturers: string[];
}

export interface ScoredCaliber {
  caliber: Caliber;
  score: number;
  maxScore: number;
  reasons: string[];
  /** A felhasználó által megadott, már meglévő kaliberrel egyezik-e */
  isOwned: boolean;
  /** A megadott vadfajhoz jellemzően illő kategóriába esik-e (kizáró szempont) */
  speciesRelevant: boolean;
}

export interface CaliberRecommendation extends ScoredCaliber {
  ammoOptions: AmmoSeedEntry[];
}
