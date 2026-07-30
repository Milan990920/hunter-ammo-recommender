# KaliberMester

Ingyenes, magyar nyelvű webalkalmazás vadászoknak: egy rövid, irányított
kérdőív (wizard) alapján ajánl kaliber- és lőszerkombinációkat, indoklással.

> **Ez egy MVP.** A cél egy átlátható, könnyen bővíthető, szabályalapú
> (nem AI/ML) ajánlórendszer. Az adatok egy része **placeholder** — lásd az
> "Adatellenőrzési TODO" szakaszt éles indulás előtt.

## Miért ez az eszköz

Sok hobbivadász bizonytalan abban, hogy egy adott vadfajra, terepre és
tapasztalati szintre milyen kaliber és lőszertípus illik. A KaliberMester
7 kérdés alapján megmutatja **az összes érdemben illeszkedő kalibert** (nem
csak egyet), mindegyikhez a döntést magyarázó indoklással és 2-5 konkrét,
kereskedelmi forgalomban kapható lőszertípussal, gyártónként.

## Funkciók (MVP)

- **Landing oldal** (`/`) — az öt magyar nagyvadfaj (gímszarvas, dámszarvas,
  őz, muflon, vaddisznó) saját, kézzel rajzolt jelvény-ikonjaival.
- **Kérdőív** (`/wizard`) — 7 lépés: vadfaj, lőtávolság/terep, meglévő
  kaliber, visszarúgás-érzékenység, elsődleges cél, költségkeret, gyártói
  preferencia.
- **Eredményoldal** (`/eredmeny`) — a szabályalapú motor (`lib/recommendation-engine.ts`)
  által talált **összes** releváns kaliber, illeszkedési százalékkal,
  szöveges indoklással és a hozzájuk tartozó lőszerekkel (szintén indoklással).
- **Jogi figyelmeztetés** minden oldalon (`components/DisclaimerBanner.tsx`).

## Ajánlási logika (dióhéjban)

`lib/recommendation-engine.ts` — egyszerű, átlátható pontozás:

1. **Vadfaj-egyezés** — kizáró jellegű szempont. Ha a felhasználó egy
   konkrét vadfajt választott, csak az arra jellemzően használt kaliberek
   kerülnek szóba (kivéve a felhasználó már meglévő kaliberét, azt mindig
   megmutatjuk). "Vegyes" válasz esetén az univerzális kaliberek kapnak
   pluszpontot.
2. **Lőtávolság** — teljes vagy részleges (szomszédos tartomány) egyezés.
3. **Meglévő kaliber** — ha van, erős pluszpontot kap (nem kell új fegyver).
4. **Visszarúgás-tűrés** — a kaliber jellemző visszarúgása a jelzett
   tűrőképesség alatt vagy azzal egyező kell legyen a teljes pontszámhoz.
5. **Elterjedtség Magyarországon** — enyhe, tájékoztató jellegű súlyozás.

A küszöbérték felett **minden** találat megjelenik (nincs mesterséges "csak
egy legjobb megoldást mutass" korlátozás) — ha semmi nem éri el a
küszöböt, a legközelebbi 3 találatot mutatjuk, jelezve, hogy ez tartalék.

A lőszerek kiválasztása (cél, költségkeret, gyártói preferencia, vadfaj)
hasonlóan pontozott, és minden lőszerhez rövid indoklás tartozik.

## Adatréteg

- `data/calibers.json` — 10 kaliber (targetGame, lőtávolság-kategóriák,
  torkolati energia placeholder, visszarúgás, magyarországi elterjedtség).
- `data/manufacturers.json` — 7 gyártó (Norma, Sellier & Bellot, RWS,
  Hornady, Federal, Fiocchi, Sako), gyártónként 2-3 termékkel.
- `lib/types.ts` — a fenti struktúrák TypeScript típusai.
- `lib/data.ts` — az adatok betöltése/kilapítása (`CALIBERS`, `AMMO`).

## ⚠️ Adatellenőrzési TODO éles indulás előtt

**A projektben szereplő ballisztikai és termékadatok jelenleg placeholder
(helyőrző), de reális formában felvitt adatok — nem gyártói adatlapból
származnak, és nem lettek egyenként leellenőrizve.**

Éles indulás előtt kötelező:

- [ ] Minden kaliber `muzzleEnergyRangeJ` értékét ellenőrizni hiteles
      gyártói ballisztikai adatlapok alapján (a jelenlegi értékek
      nagyságrendileg reálisak, de nem pontos gyártói mérések).
- [ ] **NEM** lett kitalálva vagy feltüntetve semmilyen konkrét,
      vadfajonkénti jogszabályi minimum torkolati energia — ezt a hatályos
      magyar vadászati jogszabályokból (a vad védelméről, a vadgazdálkodásról
      és a vadászatról szóló törvény és végrehajtási rendeletei) kell
      lekérdezni és a `DisclaimerBanner` linkjét a pontos jogforrásra
      mutatni.
- [ ] A `data/manufacturers.json`-ban szereplő termékek (`productName`,
      `bulletWeightGrain`, `bulletType`, árkategória) valós gyártói
      katalógusból ellenőrizendők — jelenleg ismert, létező termékvonalak
      nevei kerültek be, de a konkrét paraméterek (súly, lövedéktípus)
      típuspéldák, nem garantáltan az adott gyártó jelenlegi, pontos
      kínálata.
- [ ] Az ártartomány-kategóriák (`priceCategory`) szubjektív becslések,
      nem valós árlisták alapján.
- [ ] A "Magyarországon elterjedtség" (`popularityHU`) szubjektív, becsült
      érték, nem statisztikai adat.

## Technológia

- Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- Statikus JSON adatréteg (nincs adatbázis az MVP-hez)
- `next/font` (Inter + Fraunces) — nincs külső CSS/JS függőség

## Fejlesztés

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

## Repó struktúra

```
/app
  page.tsx              → landing oldal
  layout.tsx             → globális layout (Header, Footer, Disclaimer)
  wizard/page.tsx         → kérdőív wizard
  eredmeny/page.tsx       → eredményoldal
/data
  calibers.json
  manufacturers.json
/lib
  types.ts
  data.ts
  recommendation-engine.ts
  wizard-questions.ts
/components
  Header.tsx / Footer.tsx
  ProgressBar.tsx / OptionCard.tsx
  ResultCard.tsx / DisclaimerBanner.tsx
  icons/GameIcons.tsx    → az öt nagyvadfaj + apróvad/vegyes ikonjai
```

## Amit szándékosan NEM tartalmaz ez a verzió

- Nincs AI/ML ajánlórendszer — egyszerű, átlátható, könnyen módosítható
  szabályalapú pontozás.
- Nincs fizetős/affiliate link.
- Nincs PDF-export vagy megosztható link (lehetséges 2. fázis: az
  `/eredmeny` oldal jelenleg query paraméterekben tárolja a válaszokat, így
  az URL már most megosztható).
- Nincs adatbázis-backend — statikus JSON, könnyen kiváltható
  Supabase/Postgres-re, ha szükséges.
