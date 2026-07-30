"use client";

import { useState } from "react";
import { GAME_ICONS, type GameIconKey } from "@/components/icons/GameIcons";
import { getLovedekKategoria } from "@/lib/data";
import { KATEGORIA_LABELS } from "@/lib/recommendation-engine";
import type { CaliberRecommendation, EnrichedAmmo, GameType, LovedekKategoriaId } from "@/lib/types";

const AR_SAV_LABELS: Record<string, string> = {
  ertek: "Érték kategória",
  premium: "Prémium kategória",
};

const BUCKET_ORDER: LovedekKategoriaId[] = ["kiegyensulyozott", "gyors_hatas", "melyathatolas_afrikai"];

function groupAmmo(ammoOptions: EnrichedAmmo[], preferredFirst: LovedekKategoriaId) {
  const order = [preferredFirst, ...BUCKET_ORDER.filter((b) => b !== preferredFirst)];
  return order.map((bucket) => ({
    bucket,
    items: ammoOptions.filter((a) => a.lovedekKategoria === bucket),
  }));
}

function groupByArSav(items: EnrichedAmmo[]) {
  return (["ertek", "premium"] as const)
    .map((arSav) => ({ arSav, items: items.filter((i) => i.arSav === arSav) }))
    .filter((g) => g.items.length > 0);
}

export default function ResultCard({
  recommendation,
  rank,
  game,
  preferredLovedekKategoria,
}: {
  recommendation: CaliberRecommendation;
  rank: number;
  game: GameType;
  preferredLovedekKategoria: LovedekKategoriaId;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { caliber, score, maxScore, reasons, ammoOptions, isOwned } = recommendation;
  const matchPercent = Math.round((score / maxScore) * 100);
  const Icon = GAME_ICONS[game as GameIconKey];
  const ammoGroups = groupAmmo(ammoOptions, preferredLovedekKategoria);

  return (
    <section className="rounded-3xl border border-forest-900/10 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {Icon && <Icon className="h-14 w-14 shrink-0 text-forest-700" />}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ember-600">
              #{rank} javasolt kaliber {isOwned && "· már megvan Önnek"}
            </p>
            <h2 className="font-display text-2xl font-semibold text-forest-950">
              {caliber.nev}
            </h2>
            <p className="text-xs text-forest-700/70">{KATEGORIA_LABELS[caliber.kategoria]}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-bold text-forest-800">{matchPercent}%</span>
          <span className="text-xs text-forest-700/70">illeszkedés az Ön válaszaihoz</span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-forest-800">{caliber.megjegyzes}</p>

      {reasons.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-forest-700">
            Miért ez a kaliber?
          </p>
          <ul className="space-y-1.5 border-l-2 border-forest-700/30 pl-4">
            {reasons.map((reason) => (
              <li key={reason} className="text-sm text-forest-900">
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => setDetailsOpen((v) => !v)}
        className="mt-4 text-xs font-medium text-forest-700 underline underline-offset-2"
      >
        {detailsOpen ? "Részletek elrejtése" : "Részletek megnyitása"}
      </button>
      {detailsOpen && (
        <div className="mt-2 space-y-1 rounded-xl bg-tan-50 p-3 text-xs text-forest-700/80">
          <p>
            Becsült torkolati energia (tájékozódási célra, nem hivatalos gyártói adat):{" "}
            {caliber.energia_j_becsult} J
          </p>
          <p>Jellemző lövedéktömeg-tartomány: {caliber.tomeg_g} g</p>
          <p>Lövedékátmérő: {caliber.lovedek_mm} mm</p>
          <p>Elterjedtség Magyarországon (1–5): {caliber.elterjedtseg_hu}</p>
        </div>
      )}

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-forest-950">
          Elérhető lőszertípusok ebben a kaliberben — az Ön preferenciája szerint csoportosítva:
        </p>

        <div className="space-y-5">
          {ammoGroups.map(({ bucket, items }) => {
            const kategoriaInfo = getLovedekKategoria(bucket);
            if (items.length === 0) {
              if (bucket !== preferredLovedekKategoria) return null;
              return (
                <div key={bucket}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-forest-700">
                    {kategoriaInfo?.megjelenites ?? bucket}
                  </p>
                  <p className="rounded-xl bg-tan-50 p-3 text-sm text-forest-800">
                    Ebben a kategóriában jelenleg korlátozott a nyilvántartott kínálatunk.
                    Javasoljuk, hogy vegye fel a kapcsolatot lőszerkereskedővel a legfrissebb
                    választék megismeréséhez.
                  </p>
                </div>
              );
            }

            const arSavGroups = groupByArSav(items);

            return (
              <div key={bucket}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-forest-700">
                  {kategoriaInfo?.megjelenites ?? bucket}
                  {bucket === preferredLovedekKategoria && " (az Ön választása)"}
                </p>
                <div className="space-y-3">
                  {arSavGroups.map(({ arSav, items: arSavItems }) => (
                    <div key={arSav}>
                      <p className="mb-1.5 text-[11px] font-medium text-forest-600">
                        {AR_SAV_LABELS[arSav]}
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {arSavItems.map((ammo) => (
                          <div
                            key={`${ammo.gyarto}-${ammo.termeknev}`}
                            className="rounded-2xl border border-forest-900/10 bg-tan-50 p-4"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-forest-600">
                                {ammo.gyarto}
                              </p>
                              {ammo.olommentes && (
                                <span className="shrink-0 rounded-full bg-forest-700/10 px-2 py-0.5 text-[10px] font-semibold text-forest-800">
                                  Ólommentes
                                </span>
                              )}
                            </div>
                            <p className="font-display text-base font-semibold text-forest-950">
                              {ammo.termeknev}
                            </p>
                            <p className="mt-1 text-xs text-forest-700/80">{ammo.tomeg}</p>
                            <p className="mt-2 text-xs text-forest-700/70">
                              {ammo.forras_megjegyzes}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
