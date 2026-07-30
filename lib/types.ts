import type { GameIconKey } from "@/components/icons/GameIcons";

export type GameType = GameIconKey;

export type RangeCategory = "kozeli" | "kozepes" | "nagy";

export type RecoilLevel = "alacsony" | "kozepes" | "magas";

export type BudgetLevel = "alacsony" | "kozepes" | "magas";

export type Goal = "pontossag" | "ar" | "hatekonysag";

export type BulletType =
  | "expanzív"
  | "teljesköpenyű"
  | "réz (ólommentes)"
  | "lágyhegyű"
  | "sörétes";

export interface Caliber {
  id: string;
  name: string;
  /** Melyik vadfajokra jellemzően ezt használják */
  targetGame: GameType[];
  /** Milyen lőtávolság-tartomány(ok)ra alkalmas jellemzően */
  rangeCategories: RangeCategory[];
  /** TODO: gyártói adatlapok alapján ellenőrizendő, J mértékegység */
  muzzleEnergyRangeJ: [number, number];
  recoilLevel: RecoilLevel;
  /** Elterjedtség Magyarországon, 1 (ritka) - 5 (nagyon elterjedt) */
  popularityHU: 1 | 2 | 3 | 4 | 5;
  /** Rövid, közérthető jellemzés */
  description: string;
}

export interface Ammo {
  id: string;
  manufacturer: string;
  productName: string;
  caliberIds: string[];
  bulletWeightGrain: number;
  bulletType: BulletType;
  /** Milyen célra ajánlott jellemzően (goal-okhoz és vadfajokhoz illesztve) */
  purpose: Goal[];
  suitedGame: GameType[];
  priceCategory: BudgetLevel;
  description: string;
  /** Miért illik ez a lőszer az adott válaszokhoz — az ajánlómotor tölti ki. */
  matchReasons?: string[];
}

export interface WizardAnswers {
  game: GameType;
  range: RangeCategory;
  existingCaliberId: string | "nincs";
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
  /** A megadott vadfajra jellemzően használt kaliber-e (kizáró szempont) */
  speciesRelevant: boolean;
}

export interface CaliberRecommendation extends ScoredCaliber {
  ammoOptions: Ammo[];
}
