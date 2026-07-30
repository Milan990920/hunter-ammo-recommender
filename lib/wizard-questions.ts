import type { GameIconKey } from "@/components/icons/GameIcons";

export const GAME_OPTIONS: { id: GameIconKey; label: string; hint: string }[] = [
  { id: "gimszarvas", label: "Gímszarvas", hint: "a legnagyobb testű hazai szarvasféle" },
  { id: "damszarvas", label: "Dámszarvas", hint: "lapátos agancsáról ismert szarvasféle" },
  { id: "oz", label: "Őz", hint: "a leggyakoribb hazai nagyvad" },
  { id: "muflon", label: "Muflon", hint: "csigás szarvú hegyvidéki vadjuh" },
  { id: "vaddiszno", label: "Vaddisznó", hint: "erős, gyors, kiszámíthatatlan nagyvad" },
  { id: "aprovad", label: "Apróvad / ragadozó", hint: "pl. róka, üregi nyúl, fácán" },
  { id: "vegyes", label: "Vegyes", hint: "több vadfajra is jellemzően vadászom" },
];

export const RANGE_OPTIONS = [
  { id: "kozeli", label: "Sűrű erdő, közeli", hint: "jellemzően 100 méter alatti lövések" },
  { id: "kozepes", label: "Nyílt terep, közepes", hint: "kb. 100–200 méteres lövések" },
  { id: "nagy", label: "Nagy távolság", hint: "jellemzően 200 méter feletti lövések" },
] as const;

export const RECOIL_OPTIONS = [
  { id: "alacsony", label: "Érzékeny vagyok / kezdő", hint: "kis visszarúgású kalibert szeretnék" },
  { id: "kozepes", label: "Átlagos tűrőképesség", hint: "a megszokott, közepes visszarúgás nem gond" },
  { id: "nem_szamit", label: "Nem számít", hint: "a visszarúgás nem korlátozó szempont" },
] as const;

export const GOAL_OPTIONS = [
  { id: "pontossag", label: "Pontosság", hint: "elsősorban a lövés precizitása számít" },
  { id: "ar", label: "Elérhető ár", hint: "elsősorban a költséghatékonyság számít" },
  { id: "hatekonysag", label: "Gyors, tiszta terítés", hint: "elsősorban a vad hatékony elejtése számít" },
] as const;

export const BUDGET_OPTIONS = [
  { id: "alacsony", label: "Alacsony", hint: "belépő szintű, kedvező árú lőszerek" },
  { id: "kozepes", label: "Közepes", hint: "jó ár-érték arányú, kiegyensúlyozott választás" },
  { id: "magas", label: "Magas", hint: "prémium, csúcskategóriás lőszerek is szóba jöhetnek" },
] as const;

/** A kutatott 13 gyártós kereszthivatkozás márkái (data/manufacturer_products_seed.json). */
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
];

export const NO_MANUFACTURER_PREFERENCE = "nincs_preferencia";

export const WIZARD_STEP_TITLES = [
  "Milyen vadra vadászik jellemzően?",
  "Milyen terepen / távolságból jellemző a lövés?",
  "Van már fegyvere egy adott kaliberre?",
  "Mennyire érzékeny a visszarúgásra?",
  "Mi az elsődleges célja?",
  "Milyen költségkeretet szán lőszerre?",
  "Van preferált gyártója?",
] as const;
