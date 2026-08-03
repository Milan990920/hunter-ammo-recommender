import type { GameIconKey } from "@/components/icons/GameIcons";

export const GAME_OPTIONS: { id: GameIconKey; label: string; hint: string }[] = [
  { id: "gimszarvas", label: "Gímszarvas", hint: "a legnagyobb testű hazai szarvasféle" },
  { id: "damszarvas", label: "Dámszarvas", hint: "lapátos agancsáról ismert szarvasféle" },
  { id: "oz", label: "Őz", hint: "a leggyakoribb hazai nagyvad" },
  { id: "muflon", label: "Muflon", hint: "csigás szarvú hegyvidéki vadjuh" },
  { id: "vaddiszno", label: "Vaddisznó", hint: "erős, gyors, kiszámíthatatlan nagyvad" },
  {
    id: "aprovad",
    label: "Ragadozó / dúvad",
    hint: "róka, aranysakál, borz, nyestkutya, mosómedve — golyós fegyverrel",
  },
  { id: "vegyes", label: "Vegyes", hint: "több vadfajra is jellemzően vadászom" },
];

export const RANGE_OPTIONS = [
  { id: "kozeli", label: "Sűrű erdő, közeli", hint: "jellemzően 100 méter alatti lövések" },
  { id: "kozepes", label: "Nyílt terep, közepes", hint: "kb. 100–200 méteres lövések" },
  { id: "nagy", label: "Nagy távolság", hint: "jellemzően 200 méter feletti lövések" },
] as const;

export const FEGYVERTIPUS_OPTIONS = [
  { id: "ismetlo", label: "Ismétlő (bolt-action)", hint: "hagyományos, tárból táplálkozó ismétlő puska" },
  {
    id: "billeno_csovu_kombinalt",
    label: "Billenő csövű vagy kombinált",
    hint: "pl. drilling — a peremes (R) kaliberváltozatok jellemzően ide illenek",
  },
  { id: "nyitott", label: "Még nincs fegyverem", hint: "mindkét típusra nyitott vagyok" },
] as const;

export const VADASZATI_MOD_OPTIONS = [
  {
    id: "cserkeles_lesvadaszat",
    label: "Cserkelés / lesvadászat",
    hint: "nyugodt, megfontolt lövés",
  },
  {
    id: "hajtovadaszat_treles",
    label: "Hajtóvadászat / terelés",
    hint: "mozgó vadra, rövid távolságon, gyors reagálással",
  },
] as const;

export const BUDGET_OPTIONS = [
  { id: "alacsony", label: "Alacsony", hint: "belépő szintű, kedvező árú lőszerek" },
  { id: "kozepes", label: "Közepes", hint: "jó ár-érték arányú, kiegyensúlyozott választás" },
  { id: "magas", label: "Magas", hint: "prémium, csúcskategóriás lőszerek is szóba jöhetnek" },
] as const;

/** A kutatott 14 gyártós kereszthivatkozás márkái (data/manufacturer_products_seed.json). */
export const MANUFACTURER_OPTIONS = [
  "Norma",
  "Lapua",
  "Sako",
  "Hornady",
  "Federal",
  "Remington",
  "RWS",
  "GECO",
  "Sellier & Bellot",
  "Blaser",
  "Brenneke",
  "Fiocchi",
  "SAX",
  "PPU (Prvi Partizan)",
];

export const NO_MANUFACTURER_PREFERENCE = "nincs_preferencia";

/**
 * A wizard lépéssorrendje "lépés-fajta" alapján, nem fix indexszel — a
 * "subbranch" lépés csak akkor kerül az aktív lépések közé, ha a kiválasztott
 * vadfajhoz tartozik ivar/méret szerinti al-ág (lásd data/vadfaj_kategoriak.json).
 */
export type StepKind =
  | "game"
  | "subbranch"
  | "range"
  | "fegyvertipus"
  | "lovedek"
  | "vadaszatimod"
  | "budget"
  | "existingCaliber"
  | "manufacturers";

export const STEP_ORDER: StepKind[] = [
  "game",
  "subbranch",
  "range",
  "fegyvertipus",
  "lovedek",
  "vadaszatimod",
  "budget",
  "existingCaliber",
  "manufacturers",
];

export const STEP_TITLES: Record<StepKind, string> = {
  game: "Milyen vadra vadászik jellemzően?",
  subbranch: "Milyen ivarú vagy méretű egyedre vadászik?",
  range: "Milyen terepen / távolságból jellemző a lövés?",
  fegyvertipus: "Milyen fegyverrel vadászik?",
  lovedek: "Mit vár el elsősorban a lövedéktől becsapódáskor?",
  vadaszatimod: "Milyen vadászati módra keresi elsősorban a lőszert?",
  budget: "Milyen költségkeretet szán lőszerre?",
  existingCaliber: "Van már fegyvere egy adott kaliberre?",
  manufacturers: "Van preferált gyártója?",
};
