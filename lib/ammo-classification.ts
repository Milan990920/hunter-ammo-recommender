import type { AmmoSeedEntry, ArSav, EnrichedAmmo, LovedekKategoriaId } from "@/lib/types";

/**
 * A data/manufacturer_products_seed.json sorai nem tartalmaznak lövedék-
 * viselkedés / ólommentesség / ár-sáv mezőt. Az alábbi táblázat a mi saját,
 * a data/lovedek_kategoriak.json példa-termékvonalaival kereszthivatkozott
 * besorolásunk (nem forrásolt, egyedi hitelesítés nélküli szakmai
 * hozzárendelés) — lásd README. Kulcs: `${gyarto}|${termeknev}`.
 */
const CLASSIFICATION: Record<string, { lovedekKategoria: LovedekKategoriaId; olommentes: boolean; arSav: ArSav }> = {
  "Hornady|Precision Hunter ELD-X": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "premium" },
  "Norma|Whitetail": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "ertek" },
  "GECO|Express / Plus / TM-SP": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "ertek" },
  "GECO|TM-SP / Plus": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "ertek" },
  "GECO|TM-SP": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "ertek" },
  "GECO|TM-SP / Plus / Express": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "ertek" },
  "GECO|Plus": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "ertek" },
  "GECO|TM-SP / Express": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "ertek" },
  "GECO|Express": { lovedekKategoria: "gyors_hatas", olommentes: false, arSav: "ertek" },
  "Sako|Gamehead": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "ertek" },
  "Sako|Hammerhead": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "premium" },
  "Sako|Super Hammerhead": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "premium" },
  "Sako|Twinhead II": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "premium" },
  "Sako|Gamehead Pro / Powerhead Blade Pro": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "premium" },
  "Lapua|Naturalis": { lovedekKategoria: "kiegyensulyozott", olommentes: true, arSav: "premium" },
  "Lapua|Mega": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "premium" },
  "RWS|KS": { lovedekKategoria: "gyors_hatas", olommentes: false, arSav: "ertek" },
  "RWS|Driven Hunt": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "premium" },
  "Sellier & Bellot|SP": { lovedekKategoria: "gyors_hatas", olommentes: false, arSav: "ertek" },
  "SAX|KJG": { lovedekKategoria: "kiegyensulyozott", olommentes: true, arSav: "premium" },
  "SAX|KJG-HSR": { lovedekKategoria: "kiegyensulyozott", olommentes: true, arSav: "premium" },
  "Brenneke|fúrt hegyű (polymer tip) sorozat": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "ertek" },
  "Brenneke|Soft Point sorozat": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "ertek" },
  "Weatherby|Select Plus (Hornady ELD-X lövedékkel)": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "premium" },
  "PPU (Prvi Partizan)|TM-SP": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "ertek" },
  "PPU (Prvi Partizan)|SP": { lovedekKategoria: "kiegyensulyozott", olommentes: false, arSav: "ertek" },
};

export function enrichAmmo(entry: AmmoSeedEntry): EnrichedAmmo | null {
  if (entry.TODO_ellenorzendo || !entry.kaliber) return null;
  const key = `${entry.gyarto}|${entry.termeknev}`;
  const classification = CLASSIFICATION[key];
  if (!classification) return null;
  return { ...entry, ...classification };
}

/**
 * Ismert peremes ("R") kaliberváltozatok a data/calibers.json-ban — explicit
 * lista, mert a névalak (pl. "IRS" vs "IS", vagy a .303 British esetén
 * egyáltalán nincs "R" a névben) nem old fel megbízhatóan egy egyszerű
 * mintaillesztéssel.
 */
const RIMMED_CALIBER_NAMES = new Set([
  "5,6x52R",
  "6,5x57R",
  "7x57R",
  "7x65R",
  "8x57 IRS",
  "9,3x74R",
  ".303 British",
]);

export function isRimmedCaliber(nev: string): boolean {
  return RIMMED_CALIBER_NAMES.has(nev);
}
