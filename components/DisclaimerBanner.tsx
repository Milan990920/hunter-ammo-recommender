type DisclaimerBannerProps = {
  variant?: "compact" | "full";
};

export default function DisclaimerBanner({ variant = "compact" }: DisclaimerBannerProps) {
  if (variant === "compact") {
    return (
      <div className="border-b border-ember-600/20 bg-ember-500/10 px-4 py-2 text-center text-xs text-forest-900">
        <span className="font-semibold">Figyelem:</span> az itt megjelenő kaliber- és
        lőszerajánlások tájékoztató célt szolgálnak. Vásárlás vagy vadászat előtt minden
        esetben ellenőrizze a hatályos vadászati és lőszerforgalmazási jogszabályokat,
        valamint kérje ki szakértő véleményét.{" "}
        <a href="#jogi-figyelmeztetes" className="underline underline-offset-2">
          Részletek megnyitása
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
        Jogi és szakmai figyelmeztetés
      </p>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>
          Az ajánlás mérhető ballisztikai és gyakorlati szempontok alapján készül, de
          kizárólag <strong>tájékoztató jellegű</strong> — nem minősül szakmai, jogi
          vagy kereskedelmi tanácsadásnak, és nem helyettesíti a hatályos jogszabályok
          ismeretét.
        </li>
        <li>
          Az eszköz nem állít konkrét jogszabályi minimumkövetelményt (pl. fajonkénti
          torkolatienergia-minimumot) tényként. Ezeket a hatályos magyar vadászati
          jogszabályokban (a vad védelméről, a vadgazdálkodásról és a vadászatról szóló
          törvény és végrehajtási rendeletei) kell ellenőriznie minden vadászat előtt.
        </li>
        <li>
          Vásárlás vagy vadászat előtt minden esetben egyeztessen a fegyver- és
          lőszerkereskedővel, illetve a vadásztársával vagy a terület
          vadgazdálkodójával a helyi szabályokról és a fegyvere tényleges
          tulajdonságairól.
        </li>
        <li>
          A feltüntetett torkolatienergia-tartományok <strong>becsült, indikatív</strong>{" "}
          értékek, nem egy adott gyártó adott termékének hivatalosan mért adatai. A
          megjelenő gyártói termékpéldák egy része hivatalos gyártói forrásból, más
          része kiskereskedői megerősítésből származik — ezt minden tételnél jelöljük.
        </li>
      </ul>
    </div>
  );
}
