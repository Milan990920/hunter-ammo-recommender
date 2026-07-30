import Link from "next/link";
import {
  RedDeerIcon,
  FallowDeerIcon,
  RoeDeerIcon,
  MouflonIcon,
  WildBoarIcon,
} from "@/components/icons/GameIcons";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import { AMMO_SEED, CALIBERS } from "@/lib/data";

const MANUFACTURER_COUNT = 13;

const BIG_FIVE = [
  { Icon: RedDeerIcon, label: "Gímszarvas" },
  { Icon: FallowDeerIcon, label: "Dámszarvas" },
  { Icon: RoeDeerIcon, label: "Őz" },
  { Icon: MouflonIcon, label: "Muflon" },
  { Icon: WildBoarIcon, label: "Vaddisznó" },
];

export default function Home() {
  return (
    <div>
      <section className="bg-noise border-b border-forest-900/10 bg-forest-900 text-tan-50">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto mb-10 flex max-w-2xl flex-wrap items-center justify-center gap-1 sm:gap-3">
            {BIG_FIVE.map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 px-2">
                <Icon className="h-14 w-14 text-tan-200 sm:h-16 sm:w-16" />
                <span className="text-[11px] font-medium text-tan-200/80 sm:text-xs">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <h1 className="text-balance text-center font-display text-3xl font-semibold sm:text-5xl">
            Válassza ki a vadászati céljához illő kalibert és lőszert
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-balance text-center text-tan-100/85">
            Az ajánlás mérhető ballisztikai és gyakorlati szempontok alapján készül. Az
            eredmény tájékoztató jellegű, és nem helyettesíti a hatályos jogszabályok
            ismeretét, illetve a fegyverkereskedő vagy vadásztárs szakmai tanácsát.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/wizard"
              className="rounded-full bg-ember-500 px-8 py-3.5 text-base font-semibold text-forest-950 shadow-lg shadow-ember-600/20 transition hover:bg-ember-600 hover:text-tan-50"
            >
              Ajánlás kérése →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FeatureCard
            title="Rövid, irányított kérdőív"
            body="7 lépés, kb. 2 perc — a vadfaj, a terep és a preferenciái alapján."
          />
          <FeatureCard
            title="Kutatott adatbázis"
            body={`${CALIBERS.length} kalibert tartunk nyilván, ${MANUFACTURER_COUNT} gyártó (Norma, RWS, GECO, Sako, Lapua, Hornady, Federal, Remington, Sellier & Bellot, Blaser, Brenneke, Fiocchi, SAX) kereszthivatkozásával; jelenleg ${AMMO_SEED.filter((a) => !a.TODO_ellenorzendo).length} ellenőrzött termékpéldával induló, bővíthető gyártói minta.`}
          />
          <FeatureCard
            title="Indoklással, tárgyilagosan"
            body="Minden ajánlott kaliberhez elmagyarázzuk, mi alapján illeszkedik a válaszaihoz — feltételes megfogalmazásban, kategorikus kijelentések nélkül."
          />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <DisclaimerBanner variant="full" />
      </section>
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-forest-900/10 bg-white p-6">
      <h3 className="font-display text-lg font-semibold text-forest-950">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-forest-800">{body}</p>
    </div>
  );
}
