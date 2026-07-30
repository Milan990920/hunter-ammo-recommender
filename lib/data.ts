import calibersData from "@/data/calibers.json";
import manufacturersData from "@/data/manufacturers.json";
import type { Ammo, Caliber } from "@/lib/types";

export const CALIBERS: Caliber[] = calibersData as Caliber[];

interface ManufacturerEntry {
  id: string;
  manufacturer: string;
  products: Omit<Ammo, "manufacturer">[];
}

export const AMMO: Ammo[] = (manufacturersData as ManufacturerEntry[]).flatMap(
  (entry) =>
    entry.products.map((product) => ({
      ...product,
      manufacturer: entry.manufacturer,
    })),
);

export function getCaliberById(id: string): Caliber | undefined {
  return CALIBERS.find((c) => c.id === id);
}

export function getAmmoForCaliber(caliberId: string): Ammo[] {
  return AMMO.filter((a) => a.caliberIds.includes(caliberId));
}
