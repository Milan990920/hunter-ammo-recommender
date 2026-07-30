# KaliberMester

Ingyenes, magyar nyelvű webalkalmazás vadászoknak: egy rövid, irányított
kérdőív (wizard) alapján ajánl kaliber- és lőszerkombinációkat, indoklással.

> **Ez egy MVP, kutatott (v2) adatbázissal.** A kaliberlista és a
> gyártói kereszthivatkozás valós kutatáson alapul, de a torkolatienergia-
> tartományok **becsültek**, és a gyártói termékpélda-adatbázis szándékosan
> **nem teljes lefedettségű**. Lásd az "Adatellenőrzési TODO" szakaszt éles
> indulás előtt.

## Miért ez az eszköz

Sok hobbivadász bizonytalan abban, hogy egy adott vadfajra, terepre és
tapasztalati szintre milyen kaliber és lőszertípus illik. A KaliberMester
7 kérdés alapján megmutatja **az összes érdemben illeszkedő kalibert** (nem
csak egyet), mindegyikhez a döntést magyarázó indoklással és — ahol van hozzá
ellenőrzött adat — konkrét, kereskedelmi forgalomban kapható lőszertípusokkal.

A hangnem mindenhol tárgyilagos és feltételes ("az Ön válaszai alapján ez
lehet megfelelő"), nem kategorikus ("ez a legjobb") — ez szándékos, lásd a
"Jogi követelmények" szakaszt.

## Funkciók

- **Landing oldal** (`/`) — az öt magyar nagyvadfaj (gímszarvas, dámszarvas,
  őz, muflon, vaddisznó) saját, kézzel rajzolt jelvény-ikonjaival.
- **Kérdőív** (`/wizard`) — 7 lépés: vadfaj, lőtávolság/terep, meglévő
  kaliber (52 kaliber, kategóriánként csoportosítva), visszarúgás-érzékenység,
  elsődleges cél, költségkeret, gyártói preferencia (13 márka).
- **Eredményoldal** (`/eredmeny`) — a szabályalapú motor
  (`lib/recommendation-engine.ts`) által talált **összes** releváns kaliber,
  illeszkedési százalékkal, szöveges indoklással ("Miért ez a kaliber?"),
  becsült torkolatienergia-tartománnyal (egyértelműen jelölve, hogy nem
  hivatalos gyártói adat) és az elérhető gyártói termékpéldákkal — vagy egy
  korrekt jelzéssel, ha egy kaliberhez még nincs ellenőrzött termékadatunk.
- **Jogi figyelmeztetés** minden oldalon (`components/DisclaimerBanner.tsx`).

## Adatréteg (v2)

### `data/calibers.json` — 52 kaliber

Mezők: `nev`, `lovedek_mm`, `tomeg_g` (jellemző lövedéktömeg-tartomány),
`energia_j_becsult` (**becsült**, tájékozódási célú torkolatienergia-tartomány),
`kategoria`, `elterjedtseg_hu` (1–5, Magyarországon), `megjegyzes`.

A `kategoria` mező hét csoportot különböztet meg: `aprovad_roka`,
`univerzalis_kozepes`, `kozep_europai_klasszikus`, `nagyvad_europai`,
`magnum_tavoli`, `afrikai_nagyvad`, `weatherby`. Ez a kutatásból átvett
csoportosítás.

### `data/manufacturer_products_seed.json` — 13 gyártó kereszthivatkozása

Mezők: `gyarto`, `kaliber` (a `calibers.json` `nev` mezőjére hivatkozik,
esetenként "/" -lel elválasztva több kaliberre), `termeknev`, `tomeg`,
`forras_megjegyzes` (jelzi, hivatalos gyártói forrásból vagy kiskereskedői
megerősítésből származik-e az adat), opcionális `TODO_ellenorzendo: true`.

**Ez szándékosan nem teljes lefedettségű minta** (21 sourced tétel + 4
TODO-jelölt gyártó: Federal, Remington, Fiocchi, Blaser — ezekhez a kutatás
nem talált hazai, kaliber-specifikus adatot, ezért nem generáltunk fiktív
terméket hozzájuk).

### Vadfaj ↔ kategória megfeleltetés (a mi saját besorolásunk, nem kutatott adat)

A wizard vadfaj-kérdése (gímszarvas/dámszarvas/őz/muflon/vaddisznó/apróvad/
vegyes) és a `kategoria` mező összekötéséhez szükség volt egy saját
megfeleltetésre — ez `lib/recommendation-engine.ts`-ben a
`GAME_TO_KATEGORIA`, `KATEGORIA_RANGE_HINT` és `KATEGORIA_RECOIL_HINT`
táblázatokban van, kódban (nem a JSON-ban, hogy a kutatott adatfájlok
sémáját ne kelljen módosítani). Ez vadászati gyakorlatra épülő, szakmailag
indokolt, de **nem forrásolt** besorolás — finomításra szorulhat.

Az `afrikai_nagyvad` és `weatherby` kategóriák szándékosan nincsenek egyetlen
hazai vadfajhoz sem rendelve (Magyarországon nem releváns veszélyesvad-
vadászat), ezért ezek a kaliberek sosem jelennek meg ajánlásként — de az
adatbázisban megmaradnak referenciaként.

### `lib/data.ts` — betöltés és névfeloldás

A seed adatbázis néhol eltérő írásmóddal hivatkozik egy kaliberre, mint a
`calibers.json` (pl. német "J"/"I" jelölés: 8x57 JS = 8x57 IS). A
`CALIBER_NAME_ALIASES` táblázat ezeket oldja fel — a forrás-JSON-okat emiatt
nem kellett módosítani.

## Ajánlási logika

`lib/recommendation-engine.ts` — egyszerű, átlátható pontozás:

1. **Kategória-egyezés** — kizáró jellegű szempont. Csak az adott vadfajra
   jellemzően használt kategóriába eső kaliberek kerülnek szóba (kivéve a
   felhasználó már meglévő kaliberét, azt mindig megmutatjuk).
2. **Lőtávolság** — teljes vagy részleges egyezés (kategória-szintű becslés).
3. **Meglévő kaliber** — ha van, erős pluszpontot kap.
4. **Visszarúgás-tűrés** — kategória-szintű becslés alapján.
5. **Elterjedtség Magyarországon** (`elterjedtseg_hu`) — a végső rendezésben
   is szerepet kap: azonos illeszkedési arány esetén az elterjedtebb kaliber
   kerül előrébb.

A küszöbérték felett **minden** találat megjelenik — nincs mesterséges "csak
a legjobbat mutasd" korlátozás. Gyártói preferencia esetén a hozzá tartozó
lőszerek kerülnek előre a listában.

**Fontos, átlátható egyszerűsítés:** az "elsődleges cél" (pontosság / ár /
hatékony terítés) és a "költségkeret" válaszok jelenleg csak tájékoztató
jelleggel jelennek meg az eredményoldalon — **nem** befolyásolják
algoritmikusan a lőszerválasztást, mert a seed adatbázis (szándékosan) nem
tartalmaz ár- vagy felhasználásicél-adatot egyetlen termékhez sem, és nem
akartunk ilyet kitalálni. Ha bővül a termékadatbázis ár/cél mezőkkel, ez a
logika visszaépíthető.

## ⚠️ Adatellenőrzési TODO éles indulás előtt

- [ ] Minden kaliber `energia_j_becsult` értékét ellenőrizni hiteles gyártói
      ballisztikai adatlapok alapján (barrel-hossz függő! RWS/GECO 600–650 mm,
      amerikai gyártók jellemzően 610 mm/24" tesztcsövet használnak — ne
      hasonlíts össze normalizálás nélkül).
- [ ] A `manufacturer_products_seed.json` **retailer-forrású** tételeit
      (`forras_megjegyzes` mezőben jelölve) hivatalos gyártói ballisztikai
      adatra kell cserélni/kiegészíteni.
- [ ] Federal, Remington, Fiocchi, Blaser: nincs kaliber-specifikus,
      ellenőrzött termékadat — ezek feltöltése a hivatalos gyártói oldalakról
      (federalpremium.com, remington.com, fiocchi.com/fiocchiusa.com,
      blaser.de) szükséges éles indulás előtt.
- [ ] RWS 8×60S és 9,3×57: bizonytalan/legacy tételek, nem szerepelnek
      egyértelműen a jelenlegi online katalógusban — ellenőrizendő.
- [ ] Blaser CDC termékcsalád: hivatalosan "tizenkét kaliberben" elérhető, de
      ebből csak 5 megerősített (7×64, 7×65R, .308 Win, .30-06, .300 Win Mag +
      saját .300 Blaser Mag / 8.5×55 Blaser) — a teljes lista a blaser.de
      élő oldaláról ellenőrizendő.
- [ ] GECO 6.5 Creedmoor és 6,5×55/57 bővítések: nem egyértelműen
      megerősített, ellenőrizendő a geco-ammunition.com oldalon.
- [ ] **Ismert hibás adat, amit szándékosan NEM vettünk át:** egy
      kiskereskedői forrás a Sellier & Bellot 7×64 SPCE torkolati sebességét
      "770 fps"-ként adta meg — ez hibás, a valós érték kb. 730+ m/s
      (2400+ fps). Ne importáld ezt az értéket, ha bővíted az adatbázist.
- [ ] Ne állíts konkrét jogszabályi minimumkövetelményt (torkolati energia
      vadfajonként) tényként ellenőrzés nélkül — ezt a hatályos magyar
      vadászati jogszabályokból kell lekérdezni.

### Gyártói háttér (kontextus, nem befolyásolja a kódot)

A Beretta Holding S.A. 2022. július 31-én lezárta a svájci RUAG Ammotec
csoport felvásárlását — ez azt jelenti, hogy az **RWS, Norma, GECO és Sako**
mind a Beretta Holding vállalatcsoportjához tartoznak, gyakran közös
disztribúciós csatornán keresztül elérhetők Magyarországon is. A **Lapua**
ezzel szemben a Nammo csoport tagja, NEM tartozik a Norma/RWS/GECO/Sako
csoporthoz — ezt a gyakori téves feltételezést kerülni kell a felhasználói
kommunikációban. A Blaser lőszereket Barnes lövedékekkel, Norma üzemében
töltik, és nem kerülnek forgalomba Észak-Amerikában.

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
  calibers.json                    → 52 kaliber, kutatott adatok
  manufacturer_products_seed.json  → 13 gyártó kereszthivatkozása (seed)
/lib
  types.ts
  data.ts                 → betöltés + kaliber-név feloldás (aliasok)
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
- Nincs fizetős/affiliate link. Ha a jövőben bármely gyártóval kereskedelmi
  kapcsolat (affiliate, szponzoráció) létesül, azt egyértelműen jelölni kell.
- Nincs algoritmikus ár/cél-alapú lőszerszűrés (lásd fent, "Fontos, átlátható
  egyszerűsítés").
- Nincs PDF-export vagy megosztható link (az `/eredmeny` oldal jelenleg
  query paraméterekben tárolja a válaszokat, így az URL már most
  megosztható).
- Nincs adatbázis-backend — statikus JSON, könnyen kiváltható
  Supabase/Postgres-re, ha szükséges.
