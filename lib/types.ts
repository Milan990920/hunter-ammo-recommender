import type { GameIconKey } from "@/components/icons/GameIcons";

export type GameType = GameIconKey;

export type RangeCategory = "kozeli" | "kozepes" | "nagy";

export type BudgetLevel = "alacsony" | "kozepes" | "magas";

/** Milyen fegyverrel vadászik — eldönti, hogy a peremes ("R") kaliberváltozatok élveznek-e előnyt. */
export type FegyverTipus = "ismetlo" | "billeno_csovu_kombinalt" | "nyitott";

/** Milyen vadászati módra keresi a lőszert. */
export type VadaszatiMod = "cserkeles_lesvadaszat" | "hajtovadaszat_treles";

/** A data/lovedek_kategoriak.json azonosítói. */
export type LovedekKategoriaId = "kiegyensulyozott" | "gyors_hatas" | "melyathatolas_afrikai";

/** Egy lövedék-viselkedési kategória a data/lovedek_kategoriak.json fájlból. */
export interface LovedekKategoria {
  id: LovedekKategoriaId;
  megjelenites: string;
  leiras: string;
  lovedek_konstrukciok: string[];
  pelda_termekvonalak: string[];
  ajanlott_ha: string[];
}

/** Termék ár-sávja (a lövedék-kiválasztás csoportosításához). */
export type ArSav = "ertek" | "premium";

/**
 * A kutatott kaliberadatbázis kategóriái (lásd data/calibers.json). Ez a
 * kutatásból átvett, tényleges csoportosítás — nem mi találtuk ki.
 *
 * `aprovad_ragadozo`: KIZÁRÓLAG golyós fegyverrel vadászott ragadozó/dúvad
 * fajokra vonatkozik (róka, aranysakál, borz, nyestkutya, mosómedve) — NEM a
 * sörétes apróvad-listára (nyúl, fácán, fogoly, vízivad), azokra ez az
 * alkalmazás nem ad ajánlást.
 */
export type Kategoria =
  | "aprovad_ragadozo"
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
  /** Ha true: a kaliber ritkán elérhető ehhez a gyártóhoz Magyarországon. */
  ritka_kaliber?: boolean;
}

/**
 * Egy AmmoSeedEntry, kiegészítve a mi saját (nem forrásolt, lásd README)
 * lövedék-kategória / ólommentesség / ár-sáv besorolásunkkal.
 */
export interface EnrichedAmmo extends AmmoSeedEntry {
  lovedekKategoria: LovedekKategoriaId;
  olommentes: boolean;
  arSav: ArSav;
}

export interface WizardAnswers {
  game: GameType;
  range: RangeCategory;
  fegyvertipus: FegyverTipus;
  lovedekKategoria: LovedekKategoriaId;
  olommentesSzukseges: boolean;
  vadaszatiMod: VadaszatiMod;
  budget: BudgetLevel;
  /** Egy Caliber.nev érték, vagy "nincs" ha nincs még fegyvere. */
  existingCaliberId: string;
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
  ammoOptions: EnrichedAmmo[];
}
