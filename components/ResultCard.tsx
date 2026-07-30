import { GAME_ICONS, type GameIconKey } from "@/components/icons/GameIcons";
import type { CaliberRecommendation } from "@/lib/types";

const BULLET_TYPE_LABEL: Record<string, string> = {
  "expanzív": "expanzív lövedék",
  "teljesköpenyű": "teljesköpenyű lövedék",
  "réz (ólommentes)": "ólommentes rézlövedék",
  "lágyhegyű": "lágyhegyű lövedék",
  "sörétes": "sörétes töltény",
};

const PRICE_LABEL: Record<string, string> = {
  alacsony: "alacsony ártartomány",
  kozepes: "közepes ártartomány",
  magas: "magas ártartomány",
};

export default function ResultCard({
  recommendation,
  rank,
}: {
  recommendation: CaliberRecommendation;
  rank: number;
}) {
  const { caliber, score, maxScore, reasons, ammoOptions, isOwned } = recommendation;
  const matchPercent = Math.round((score / maxScore) * 100);
  const primaryGame = caliber.targetGame[0] as GameIconKey | undefined;
  const Icon = primaryGame ? GAME_ICONS[primaryGame] : null;

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
              {caliber.name}
            </h2>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-bold text-forest-800">{matchPercent}%</span>
          <span className="text-xs text-forest-700/70">illeszkedés az Ön válaszaihoz</span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-forest-800">{caliber.description}</p>

      {reasons.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-l-2 border-forest-700/30 pl-4">
          {reasons.map((reason) => (
            <li key={reason} className="text-sm text-forest-900">
              {reason}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-forest-700/70">
        Jellemző torkolati energia (TODO: gyártói adatlappal ellenőrizendő):{" "}
        {caliber.muzzleEnergyRangeJ[0]}–{caliber.muzzleEnergyRangeJ[1]} J
      </p>

      {ammoOptions.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-forest-950">
            Ehhez a kaliberhez illő lőszertípusok ({ammoOptions.length})
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ammoOptions.map((ammo) => (
              <div
                key={ammo.id}
                className="rounded-2xl border border-forest-900/10 bg-tan-50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-forest-600">
                  {ammo.manufacturer}
                </p>
                <p className="font-display text-base font-semibold text-forest-950">
                  {ammo.productName}
                </p>
                <p className="mt-1 text-xs text-forest-700/80">
                  {ammo.bulletWeightGrain} grain · {BULLET_TYPE_LABEL[ammo.bulletType] ?? ammo.bulletType} ·{" "}
                  {PRICE_LABEL[ammo.priceCategory]}
                </p>
                <p className="mt-2 text-sm text-forest-800">{ammo.description}</p>
                {ammo.matchReasons && ammo.matchReasons.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-forest-700">
                    {ammo.matchReasons.map((r) => (
                      <li key={r}>· {r}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
