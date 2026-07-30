type DisclaimerBannerProps = {
  variant?: "compact" | "full";
};

export default function DisclaimerBanner({ variant = "compact" }: DisclaimerBannerProps) {
  if (variant === "compact") {
    return (
      <div className="border-b border-ember-600/20 bg-ember-500/10 px-4 py-2 text-center text-xs text-forest-900">
        <span className="font-semibold">Tájékoztató jellegű eszköz</span> — nem
        helyettesíti a hatályos jogszabályokat és a szakkereskedő tanácsát.{" "}
        <a href="#jogi-figyelmeztetes" className="underline underline-offset-2">
          Részletek
        </a>
      </div>
    );
  }

  return (
    <div
      id="jogi-figyelmeztetes"
      className="rounded-2xl border border-ember-600/30 bg-ember-500/10 p-5 text-sm leading-relaxed text-forest-900"
    >
      <p className="mb-2 font-semibold text-forest-950">
        Fontos jogi és szakmai figyelmeztetés
      </p>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>
          Ez az eszköz kizárólag <strong>tájékoztató jellegű</strong>, nem minősül
          szakmai, jogi vagy kereskedelmi tanácsadásnak.
        </li>
        <li>
          Az ajánlás nem helyettesíti a hatályos magyar vadászati jogszabályokban
          (pl. a vad védelméről, a vadgazdálkodásról és a vadászatról szóló
          törvény és végrehajtási rendeletei) rögzített, fajonkénti és
          lőszertípusonkénti <strong>minimumkövetelményeket</strong> — ezeket
          minden vadászat előtt önállóan ellenőrizni kell a hatályos jogforrásban.
        </li>
        <li>
          Vásárlás előtt mindig egyeztess a fegyver- és lőszerkereskedővel, illetve
          a vadásztársad vagy a terület vadgazdálkodójával a helyi szabályokról és
          a fegyvered tényleges tulajdonságairól.
        </li>
        <li>
          A feltüntetett torkolati energia-, ár- és termékadatok{" "}
          <strong>placeholder (helyőrző) adatok</strong>, gyártói adatlapokkal még
          nincsenek egyenként leellenőrizve.
        </li>
      </ul>
    </div>
  );
}
