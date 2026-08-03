# KaliberMester

Ingyenes, magyar nyelvű webalkalmazás vadászoknak: egy rövid, irányított
kérdőív (wizard) alapján ajánl kaliber- és lőszerkombinációkat, indoklással.

> **Ez egy MVP, kutatott (v4) adatbázissal.** A kaliberlista és a
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
- **Kérdőív** (`/wizard`) — 8, egymástól valóban független lépés: vadfaj,
  lőtávolság/terep, fegyvertípus (ismétlő / billenő csövű-kombinált / még
  nincs), lövedék-viselkedési cél (+ólommentes szűrő), vadászati mód
  (cserkelés-lesvadászat / hajtóvadászat-terelés), költségkeret, meglévő
  kaliber (52 kaliber, kategóriánként csoportosítva), gyártói preferencia
  (14 márka).
- **Eredményoldal** (`/eredmeny`) — a szabályalapú motor
  (`lib/recommendation-engine.ts`) által talált kaliberek közül a legfeljebb
  **3 legelterjedtebb**, szöveges indoklással ("Miért ez a kaliber?"), becsült
  torkolatienergia-tartománnyal (egyértelműen jelölve, hogy nem hivatalos
  gyártói adat) és a hozzájuk tartozó lőszerekkel, lövedék-viselkedés és
  ár-sáv szerint csoportosítva, ólommentesség jelölésével.
- **Jogi figyelmeztetés** minden oldalon (`components/DisclaimerBanner.tsx`).

## Adatréteg

### `data/calibers.json` — 52 kaliber

Mezők: `nev`, `lovedek_mm`, `tomeg_g` (jellemző lövedéktömeg-tartomány),
`energia_j_becsult` (**becsült**, tájékozódási célú torkolatienergia-tartomány),
`kategoria`, `elterjedtseg_hu` (1–5, Magyarországon), `megjegyzes`.

A `kategoria` mező hét csoportot különböztet meg: `aprovad_ragadozo`,
`univerzalis_kozepes`, `kozep_europai_klasszikus`, `nagyvad_europai`,
`magnum_tavoli`, `afrikai_nagyvad`, `weatherby`. Ez a kutatásból átvett
csoportosítás.

**Fontos pontosítás:** az `aprovad_ragadozo` kategória **kizárólag golyós
fegyverrel vadászott ragadozó/dúvad fajokra** vonatkozik (róka, aranysakál,
borz, nyestkutya, mosómedve) — **NEM** a sörétes apróvad-listára (nyúl,
fácán, fogoly, vízivad). Ez az alkalmazás kizárólag golyós kaliberekről szól,
sörétes fegyverre/apróvadra nem ad ajánlást.

### `data/lovedek_kategoriak.json` — lövedék-viselkedési kategóriák

Három kategória (`kiegyensulyozott`, `gyors_hatas`, `melyathatolas_afrikai`),
mindegyikhez leírás, jellemző lövedékkonstrukciók és példa-termékvonalak. A
harmadik (`melyathatolas_afrikai`, nem expanzív szolid lövedék veszélyes
afrikai nagyvadra) csak akkor jelenik meg választható opcióként a wizardban,
ha a kiválasztott vadfajhoz afrikai nagyvad/Weatherby kategória is releváns
lenne — a jelenlegi hazai vadfaj-listával ez sosem áll fenn, a kód viszont
helyesen van bekötve, ha a fajlista bővülne.

### `data/manufacturer_products_seed.json` — 14 gyártó kereszthivatkozása

Mezők: `gyarto`, `kaliber` (a `calibers.json` `nev` mezőjére hivatkozik,
esetenként "/" -lel elválasztva több kaliberre), `termeknev`, `tomeg`,
`forras_megjegyzes` (jelzi, hivatalos gyártói forrásból vagy kiskereskedői
megerősítésből származik-e az adat), opcionális `TODO_ellenorzendo: true`,
opcionális `ritka_kaliber: true` (ha az adott kaliber ritkán elérhető az
adott gyártótól Magyarországon).

**Ez szándékosan nem teljes lefedettségű minta** (59 sourced tétel + 4
TODO-jelölt gyártó: Federal, Remington, Fiocchi, Blaser — ezekhez a kutatás
nem talált hazai, kaliber-specifikus adatot, ezért nem generáltunk fiktív
terméket hozzájuk). A 14. gyártó a **PPU (Prvi Partizan)**, szerb gyártó,
kifejezetten "value tier" (érték-kategóriás) pozicionálással, széles
kaliberkínálattal.

**Korrekció:** a korábbi "Sako Arrowhead II" hivatkozás törölve — ez a
termékvonal nincs a Sako jelenlegi hivatalos kínálatában (sako.global).
Helyette a valós, aktuális Sako-termékcsalád szerepel: Gamehead (alap SP),
Hammerhead/Super Hammerhead (bonded, nagyvadra), Powerhead Blade (ólommentes),
Twinhead II (afrikai nagyvadra). Emellett a Lapua Mega (bonded SP, hivatalosan
gyártott 6,5x55 SE/.308 Win/.30-06/.300 Win Mag/9,3x62/9,3x74R kaliberekben)
is bekerült — korábban csak a Lapua Naturalis szerepelt, a Mega tévedésből
kimaradt.

### `lib/ammo-classification.ts` — lövedék-viselkedés/ólommentesség/ár-sáv besorolás

A seed sorok nem tartalmaznak lövedék-viselkedés, ólommentesség vagy ár-sáv
mezőt. Ez a fájl a mi saját, a `data/lovedek_kategoriak.json` példa-
termékvonalaival kereszthivatkozott besorolásunk (kulcs: `gyártó|termeknév`)
— **nem egyedileg forrásolt**, hanem iparági termékpozicionálás alapján
készült szakmai hozzárendelés (pl. a GECO és a PPU (Prvi Partizan) márka
egésze "value tier", a lead-free/bonded és a Sako Hammerhead/Super
Hammerhead/Twinhead II vonalak "prémium"). 63 sorból 59-hez van besorolás (a
4 TODO-jelölt, terméknév nélküli sor kimarad). Ezt is érdemes egyedi
forrásokkal (gyártói katalógus-pozicionálás) megerősíteni éles indulás előtt.

Ugyanitt van az `isRimmedCaliber()` — egy explicit lista a peremes ("R")
kaliberváltozatokról (5,6x52R, 6,5x57R, 7x57R, 7x65R, 8x57 IRS, 9,3x74R,
.303 British), mert a névalak (pl. "IRS" vs "IS") nem old fel megbízhatóan
egyszerű mintaillesztéssel.

### Vadfaj ↔ kategória megfeleltetés (a mi saját besorolásunk, nem kutatott adat)

A wizard vadfaj-kérdése (gímszarvas/dámszarvas/őz/muflon/vaddisznó/
ragadozó-dúvad/vegyes) és a `kategoria` mező összekötéséhez szükség volt egy
saját megfeleltetésre — ez `lib/recommendation-engine.ts`-ben a
`GAME_TO_KATEGORIA` és `KATEGORIA_RANGE_HINT` táblázatokban van, kódban (nem
a JSON-ban, hogy a kutatott adatfájlok sémáját ne kelljen módosítani). Ez
vadászati gyakorlatra épülő, szakmailag indokolt, de **nem forrásolt**
besorolás — finomításra szorulhat.

### Hajtóvadászat/terelés — vadászati mód kérdés

A 8. wizard-kérdés ("Milyen vadászati módra keresi elsősorban a lőszert?")
két opciót ad: cserkelés/lesvadászat (alapértelmezett, semleges) és
hajtóvadászat/terelés. Utóbbi esetén, a kapott szakmai brief alapján:

- `HAJTAS_PRIORITY_CALIBERS` (.308 Win, .30-06, 8x57 IS (JS), 9,3x62) és az
  azokkal azonos kategóriájú "hasonló társak" (kozep_europai_klasszikus,
  nagyvad_europai) pluszpontot kapnak a relevancia-pontozásban.
- A lőszerlistán belül a nehezebb grain-tartományú tételek kerülnek előre
  (`extractMaxGrainWeight()` egy egyszerű regex-alapú heurisztika a `tomeg`
  mező grain-értékeire).
- A lőszerlista vezető lövedék-kategória bucketje **kiegyensúlyozott**-ra
  van kényszerítve — de **csak nagyvad fajoknál**, nem ragadozó/dúvadnál
  (`resolvePreferredLovedekKategoria()`), mert utóbbinál a "gyors hatás"
  kategória a saját species-alapú logikánk szerint is indokolt marad. Ez a
  mi saját, a species-logika és a hajtóvadászati brief közötti ellentmondást
  feloldó döntésünk — dokumentálva a kódban is.
- Ha egy kaliberhez van kifejezetten "Driven Hunt" névre illeszkedő termék
  (jelenleg: RWS 9,3x62 Driven Hunt), az "Hajtásra ajánlott" jelöléssel
  kiemelve jelenik meg.
- Az eredményoldalon egy rövid szakirodalmi indoklás jelenik meg, ha ezt a
  módot választotta a felhasználó.

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

`lib/recommendation-engine.ts` — egyszerű, átlátható pontozás, két lépésben:

**1) Melyik kaliberek jöhetnek egyáltalán szóba (relevancia-küszöb):**

1. **Kategória-egyezés** — kizáró jellegű szempont. Csak az adott vadfajra
   jellemzően használt kategóriába eső kaliberek kerülnek szóba (kivéve a
   felhasználó már meglévő kaliberét, azt mindig megmutatjuk).
2. **Lőtávolság** — teljes vagy részleges egyezés (kategória-szintű becslés).
3. **Fegyvertípus** — puha preferencia, nem kizárás: ismétlő fegyverhez a
   rimless (nem peremes) kaliberváltozatok kapnak pluszpontot, billenő
   csövű/kombinált fegyverhez a peremes ("R") változatok — de mindkét eset
   megjeleníthető, csak egy magyarázó megjegyzéssel ("hüvelytoldatos/
   adapteres megoldással tölthető").
4. **Vadászati mód** — hajtóvadászat/terelés esetén a mérsékelt visszarúgású,
   de kellően nagy energiájú kaliberek (lásd lent) kapnak pluszpontot.
5. **Meglévő kaliber** — ha van, erős pluszpontot kap.
6. **Elterjedtség Magyarországon** (`elterjedtseg_hu`) — enyhe súlyozás itt is.

**2) Rendezés és vágás:** a küszöböt elérő kaliberek közül a végső sorrendet
kizárólag az `elterjedtseg_hu` (csökkenő) adja — a meglévő kaliber mindig
legelöl —, majd **legfeljebb 3 kaliber** kerül az eredményoldalra. Ez
szándékos leegyszerűsítés: kevesebb, de a felhasználó számára ténylegesen
releváns kaliber, cserébe minden megjelenő kaliberhez a teljes elérhető
lőszerkínálat látszik (lásd lent).

**Lőszerkínálat a top 3 kaliberhez:** minden megjelenő kaliberhez az ÖSSZES
illeszkedő, ellenőrzött termékpélda megjelenik, csoportosítva: előbb a
felhasználó által választott lövedék-viselkedési kategória (kiegyensúlyozott
/ gyors hatás), utána a másik kategória mint alternatíva; mindegyiken belül
ár-sáv szerint (érték / prémium), és minden tétel jelölve, ha ólommentes. Ha
az "ólommentes lőszert keresek" szűrő aktív, csak ólommentes tételek
jelennek meg. Ha egy kategóriában nincs (elég) találat, korrekt jelzés
jelenik meg fiktív termék generálása helyett.

**Fontos, átlátható egyszerűsítés:** a "költségkeret" válasz jelenleg csak
tájékoztató jelleggel jelenik meg az eredményoldalon (a lőszerkínálat
ár-sáv szerinti csoportosítása a termék saját, kód-oldali besorolásán
alapul, nem a felhasználó személyes költségkeret-válaszán) — ezt a két
fogalmat szándékosan nem kevertük össze.

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
- [ ] A `lib/ammo-classification.ts`-ben lévő lövedék-viselkedés/ólommentesség/
      ár-sáv besorolás iparági termékpozicionálás alapján készült, nem
      egyedi gyártói forrásból — érdemes minden tételt egyenként
      megerősíteni (különösen az ár-sáv "érték"/"prémium" besorolást).
- [ ] A PPU (Prvi Partizan) tételek nagy része "bővítendő" lövedéktömeggel
      szerepel — a kaliber és a gyártó hazai kereskedői kínálat alapján
      megerősített, de a pontos grain-értékeket a prvipartizan.com oldalról
      kell ellenőrizni.
- [ ] Az RWS 9,3x62 Driven Hunt tétel léte valós (RWS hivatalosan gyárt
      Driven Hunt terméket), de a pontos lövedéktömeg még ellenőrizendő a
      rws-ammunition.com oldalon.
- [ ] A Sako 6.5 Creedmoor "Gamehead Pro / Powerhead Blade Pro" tétel két
      különböző lövedékkonstrukciót (hagyományos lágyhegyű és ólommentes
      réz) von össze egy sorba — bővítéskor érdemes szétbontani, mert
      jelenleg az `olommentes: false` besorolás alulbecsli a Powerhead Blade
      Pro részt.

### Miért nincs "visszarúgás-érzékenység" és "elsődleges cél" kérdés?

A korábbi verzió tartalmazott egy "elsődleges cél" (pontosság / ár / gyors
terítés) és egy "visszarúgás-érzékenység" kérdést. Ezeket szándékosan
kivettük: a pontosság nem választható cél (a helyes lövedékválasztás és a
fegyverben való kipróbálás eredménye, nem egy trade-off a stop-hatás
rovására), a visszarúgás pedig átfedésben volt az új, pontosabb
fegyvertípus/lövedék-viselkedés kérdésekkel. A jelenlegi 8 kérdés
egymástól valóban független szempontokat mér.

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
  manufacturer_products_seed.json  → 14 gyártó kereszthivatkozása (seed)
  lovedek_kategoriak.json          → 3 lövedék-viselkedési kategória
/lib
  types.ts
  data.ts                 → betöltés + kaliber-név feloldás (aliasok)
  ammo-classification.ts  → lövedék-viselkedés/ólommentesség/ár-sáv besorolás + isRimmedCaliber()
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
- A személyes költségkeret-válasz nem szűri algoritmikusan a lőszerlistát
  (lásd fent, "Fontos, átlátható egyszerűsítés").
- Nincs PDF-export vagy megosztható link (az `/eredmeny` oldal jelenleg
  query paraméterekben tárolja a válaszokat, így az URL már most
  megosztható).
- Nincs adatbázis-backend — statikus JSON, könnyen kiváltható
  Supabase/Postgres-re, ha szükséges.
