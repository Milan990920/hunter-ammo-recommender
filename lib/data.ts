import calibersData from "@/data/calibers.json";
import ammoSeedData from "@/data/manufacturer_products_seed.json";
import lovedekKategoriakData from "@/data/lovedek_kategoriak.json";
import { enrichAmmo } from "@/lib/ammo-classification";
import type { AmmoSeedEntry, Caliber, EnrichedAmmo, LovedekKategoria, LovedekKategoriaId } from "@/lib/types";

export const CALIBERS: Caliber[] = calibersData as Caliber[];
export const AMMO_SEED: AmmoSeedEntry[] = ammoSeedData as AmmoSeedEntry[];
export const LOVEDEK_KATEGORIAK: LovedekKategoria[] = lovedekKategoriakData as LovedekKategoria[];

export function getLovedekKategoria(id: LovedekKategoriaId): LovedekKategoria | undefined {
  return LOVEDEK_KATEGORIAK.find((k) => k.id === id);
}

/**
 * A gyártói seed adatbázisban a kaliber-hivatkozások néhol eltérő írásmóddal
 * szerepelnek, mint a calibers.json `nev` mezője (pl. a német "J"/"I" jelölési
 * konvenció: 8x57 JS = 8x57 IS, 8x57 JRS = 8x57 IRS), vagy rövidebb alakban
 * (pl. "7x64" a "7x64 (Brenneke)" helyett). Ez a táblázat ezeket az ismert
 * eltéréseket oldja fel, hogy a JSON fájlokat ne kelljen módosítani.
 */
const CALIBER_NAME_ALIASES: Record<string, string> = {
  "8x57 jrs": "8x57 IRS",
  "8x57 js": "8x57 IS (JS)",
  "6,5x55 se": "6,5x55 SE (Swedish)",
  "7x64": "7x64 (Brenneke)",
  "8x64s": "8x64S (Brenneke)",
  "9,3x64": "9,3x64 (Brenneke)",
  "6,5x68": "6,5x68 (RWS/Schüler)",
  "7x57": "7x57 (7mm Mauser)",
  "6x62r freres": "6x62R Freres",
};

function normalizeCaliberName(raw: string): string {
  return raw.trim().toLowerCase();
}

function resolveCaliberName(rawPart: string): string | null {
  const norm = normalizeCaliberName(rawPart);
  const alias = CALIBER_NAME_ALIASES[norm];
  if (alias) return alias;
  const exact = CALIBERS.find((c) => normalizeCaliberName(c.nev) === norm);
  return exact?.nev ?? null;
}

export function getCaliberByNev(nev: string): Caliber | undefined {
  return CALIBERS.find((c) => c.nev === nev);
}

/** Az adott kaliberhez tartozó, ellenőrzött gyártói termékpéldák (seed adatbázisból). */
export function getAmmoSeedForCaliber(caliberNev: string): AmmoSeedEntry[] {
  return AMMO_SEED.filter((entry) => {
    if (!entry.kaliber) return false;
    return entry.kaliber
      .split("/")
      .map((part) => resolveCaliberName(part))
      .includes(caliberNev);
  });
}

/** Ugyanaz, de lövedék-kategória/ólommentesség/ár-sáv besorolással kiegészítve. */
export function getEnrichedAmmoForCaliber(caliberNev: string): EnrichedAmmo[] {
  return getAmmoSeedForCaliber(caliberNev)
    .map(enrichAmmo)
    .filter((a): a is EnrichedAmmo => a !== null);
}
