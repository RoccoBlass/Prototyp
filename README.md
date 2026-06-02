# Projektdokumentation – Kalorientracker

## Inhaltsverzeichnis

1. [Ausgangslage](#1-ausgangslage)
2. [Lösungsidee](#2-lösungsidee)
3. [Vorgehen & Artefakte](#3-vorgehen--artefakte)
    1. [Understand & Define](#31-understand--define)
    2. [Sketch](#32-sketch)
    3. [Decide](#33-decide)
    4. [Prototype](#34-prototype)
    5. [Validate](#35-validate)
4. [Erweiterungen](#4-erweiterungen)
5. [Projektorganisation](#5-projektorganisation)
6. [KI-Deklaration](#6-ki-deklaration)
7. [Anhang](#7-anhang)

> **Hinweis:** Massgeblich sind die im **Unterricht** und auf **Moodle** kommunizierten Anforderungen.

## 1. Ausgangslage

Wer auf seine Ernährung achtet (z. B. zur Gewichtskontrolle oder beim Muskelaufbau), möchte den Tag über grob im Blick haben, wie viele Kalorien und Makros (Protein, Kohlenhydrate, Fett) schon konsumiert wurden. Bestehende Apps wie MyFitnessPal können das natürlich auch, sind in meinen Augen aber überladen und blenden Werbung ein. Dazu kommt: Wer immer wieder dieselben Mahlzeiten isst, gibt die gleichen Werte gefühlt zum hundertsten Mal ein.

- **Problem:** Bestehende Tracking-Apps sind zu komplex und ignorieren, dass viele Mahlzeiten Wiederholungen sind.
- **Ziele:** Schlanker Tagesüberblick mit klarem Fortschritt zum eigenen Ziel; einmal angelegte Mahlzeiten/Lebensmittel mit einem Klick erfassen; persönliches Tagesziel, das sich aus den Körperdaten berechnen lässt; Wochenrückblick und Gewichtsverlauf.
- **Primäre Zielgruppe:** Erwachsene, die ihre Kalorien- und Nährwertaufnahme bewusst verfolgen wollen und dafür eine schnelle, schlanke Lösung suchen.
- **Weitere Stakeholder:** Modulleitung (Bewertung), Mitstudierende als Tester:innen der Usability-Evaluation.

## 2. Lösungsidee

Der Kalorientracker ist ein persönlicher, schlanker Ernährungstracker mit Benutzerkonto. Nach der Anmeldung führt ein kurzes **Onboarding** durch ein paar Fragen (Geschlecht, Alter, Grösse, Gewicht, Aktivität, Ziel) und berechnet daraus automatisch ein **Kalorien- und Makroziel**. Statt jedes Essen neu einzugeben, baue ich mir wiederverwendbare **Lebensmittel** und **Mahlzeiten** auf und protokolliere sie mit wenigen Klicks auf einem Tag.

- **Kernfunktionalität:**
  - **Lebensmittel** mit Nährwerten je 100 g/ml – entweder über eine **öffentliche Lebensmittel-Datenbank** (Open Food Facts) gesucht oder selbst angelegt (inkl. Foto).
  - **Mahlzeiten** als Kombination mehrerer Lebensmittel mit Mengen; Gesamtnährwerte werden automatisch berechnet.
  - **Tageseinträge:** eine ganze Mahlzeit *oder* ein einzelnes Lebensmittel (mit Gramm/Milliliter) zu einem Tag hinzufügen, jeweils mit Mahlzeitentyp (Frühstück, Mittag, Abendessen, Snack).
  - **Dashboard** mit Kalorienring und Makro-Übersicht, **Verlauf** der letzten 7 Tage, **Gewichtstracker** mit Verlaufs-Chart, **Profil** mit anpassbarem Ziel und wählbarem Farbschema (Dark/Light).
- **Annahmen:** Nutzer:innen wollen wenig Aufwand pro Logging-Vorgang und ein nachvollziehbares Tagesziel, das sie nicht selbst ausrechnen müssen.
- **Abgrenzung:** Kein Barcode-Scan; keine sozialen Funktionen (Teilen, Freunde); keine Offline-Nutzung; kein Auswertungszeitraum > 7 Tage im Verlauf; die Datenqualität der externen Lebensmittel-Datenbank wird nicht kuratiert.

> **Hinweis zur Entwicklung:** Das Projekt startete als minimaler Tracker mit „Mahlzeitenvorlagen" (siehe Phasen 3.1–3.3) und wurde anschliessend bewusst zu einem vollwertigen, personalisierten Tracker ausgebaut. Die über den ursprünglichen Umfang hinausgehenden Funktionen sind in **Kapitel 4 (Erweiterungen)** dokumentiert.

## 3. Vorgehen & Artefakte

Das Projekt orientierte sich am Design-Sprint-Vorgehen aus dem Unterricht.

### 3.1 Understand & Define

- **Zielgruppenverständnis:** Im Problemraum habe ich mir bestehende Tracking-Apps angeschaut (MyFitnessPal, Yazio, FatSecret) und Erfahrungen aus dem eigenen Umfeld einbezogen. Daraus entstanden zwei Proto-Personas: einerseits jemand sportlich Aktives im Aufbau, andererseits eine berufstätige Person mit relativ konstanten Routinegerichten.
- **Wesentliche Erkenntnisse:**
  - Wiederholung ist riesig: Über die Woche kehren oft dieselben 5–10 Mahlzeiten wieder. Genau hier setzt das Prinzip wiederverwendbarer Mahlzeiten an.
  - Ein sichtbares Ziel motiviert mehr als reine Zahlen – ein Fortschrittsring wirkt stärker als eine reine Tabelle.
  - Viele Nutzer:innen kennen ihren genauen Kalorienbedarf nicht – die App sollte ihn aus den Körperdaten herleiten können.
  - Lebensmittelsuchen werden häufig abgebrochen, wenn das gesuchte Produkt nicht sofort gefunden wird.

### 3.2 Sketch

- **Variantenüberblick:** Drei Skizzen entstanden:
  - (a) klassisches Eingabeformular pro Mahlzeit
  - (b) Sammlung wiederverwendbarer Mahlzeiten mit „Tap-to-Log"
  - (c) Tagesplan mit fixen Mahlzeit-Slots
- **Skizzen:** _[Skizzen unter `/docs/sketches/` ablegen und hier referenzieren.]_ (a) wurde verworfen wegen wiederholter Eingabearbeit, (c) weil sie unterschiedliche Esstypen (z. B. mehrere Snacks) nicht sauber abbildet.

### 3.3 Decide

Gewählt habe ich Variante (b). Entscheidkriterien waren minimaler Aufwand pro Logging-Vorgang, niedrige kognitive Last, hohe Wiederverwendung und einfache technische Umsetzung in SvelteKit.

**End-to-End-Ablauf (Hauptworkflow „Essen erfassen"):**
1. Nutzer:in öffnet das Dashboard und sieht den aktuellen Tagesstand (Kalorienring + Makros).
2. Klick auf „Hinzufügen" → Tab „Mahlzeiten" oder „Lebensmittel" wählen.
3. Eine bestehende Mahlzeit auswählen **oder** ein Lebensmittel suchen/anlegen und die Menge angeben.
4. Mahlzeitentyp wählen → Eintrag erscheint sofort auf dem Dashboard, der Kalorienring aktualisiert sich.
5. Über „Verlauf" / „Gewicht" / „Profil" lassen sich Woche, Gewichtsverlauf und Ziel überblicken bzw. anpassen.

**Mockup:** Referenz-Mockup (klickbarer Figma-Prototyp): <https://www.figma.com/proto/WGIBvorlP9wmaHF67J3IIC/Fitness-App>
_(Screenshots der wichtigsten Mockup-Screens unter `/docs/mockups/` ablegen und hier referenzieren.)_ Das Mockup bildet den ursprünglichen Kern-Workflow ab; die umgesetzte App geht in mehreren Punkten darüber hinaus (siehe Kap. 4).

### 3.4 Prototype

#### 3.4.1 Entwurf (Design)

**Informationsarchitektur** – nach Login flach und aufgabenorientiert:

| Route | Funktion |
| --- | --- |
| `/login` | Registrierung & Anmeldung |
| `/onboarding` | Ersteinrichtung: Körperdaten → automatisch berechnetes Ziel |
| `/` | Dashboard (Tagesüberblick: Kalorienring, Makros, Einträge) |
| `/add` | Hinzufügen-Hub mit Tabs „Mahlzeiten" und „Lebensmittel" |
| `/add/food/new`, `/add/food/[id]` | Eigenes Lebensmittel anlegen / bearbeiten |
| `/add/meal/new`, `/add/meal/[id]` | Mahlzeit aus Lebensmitteln zusammenstellen / bearbeiten |
| `/weight` | Gewichtstracker mit Verlaufs-Chart |
| `/history` | Verlauf der letzten 7 Tage |
| `/profile` | Profil, Körperdaten, Ziel, Farbschema (Dark/Light), Abmelden |
| `/api/food-search` | Server-Endpunkt für die Open-Food-Facts-Suche |
| `/api/coach` | Server-Endpunkt für das KI-Coach-Feedback (OpenRouter) |
| `/logout` | Abmelden (POST-Endpunkt) |

Auf dem Desktop wird die Navigation als Sidebar dargestellt, mobil als Bottom-Nav mit hervorgehobenem „+"-Button. Nicht angemeldete Nutzer:innen werden auf `/login` geleitet, angemeldete ohne abgeschlossenes Onboarding auf `/onboarding` (Zugriffsschutz in `src/hooks.server.js`).

**User Interface Design:** Die folgenden Screenshots zeigen die wichtigsten Screens der umgesetzten App (Dark Mode als Standard, mit Demo-Account und Beispieldaten erstellt).

**Anmeldung & Registrierung**

![Login-Screen](docs/screenshots/login.png)

Schlanker Einstieg mit Umschalter zwischen Anmelden und Registrieren.

**Onboarding (Schritt 1 von 5)**

![Onboarding-Wizard](docs/screenshots/onboarding.png)

Geführter Wizard, der aus den Körperdaten automatisch das Tagesziel berechnet (siehe Kap. 4.2).

**Dashboard**

![Dashboard](docs/screenshots/dashboard.png)

Tagesüberblick mit Kalorienring, Makro-Fortschritt, KI-Coach-Karte (Kap. 4.7) und den heutigen Einträgen.

**Hinzufügen**

![Hinzufügen-Hub](docs/screenshots/add.png)

Mahlzeitentyp wählen, danach über die Tabs eine gespeicherte Mahlzeit oder ein einzelnes Lebensmittel erfassen.

**Lebensmittel anlegen**

![Lebensmittel-Formular](docs/screenshots/food-form.png)

Eigenes Lebensmittel mit Nährwerten je 100 g/ml und optionalem Foto (wird im Browser verkleinert).

**Mahlzeit zusammenstellen**

![Mahlzeit-Builder](docs/screenshots/meal-builder.png)

Mehrere Zutaten zu einer Mahlzeit kombinieren – die Gesamtnährwerte werden live berechnet (Kap. 4.4).

**Gewicht**

![Gewichtstracker mit Verlaufs-Chart](docs/screenshots/weight.png)

Tägliche Gewichtserfassung mit SVG-Verlaufsdiagramm ohne externe Chart-Bibliothek (Kap. 4.5).

**Verlauf**

![Verlauf der letzten 7 Tage](docs/screenshots/history.png)

Rückblick auf die letzten 7 Tage mit Tagessummen je Tag.

**Profil**

![Profil](docs/screenshots/profile.png)

Persönliche Angaben, Körperdaten & Ziel, Farbschema (Dark/Light, Kap. 4.6) sowie Abmelden.

**Designentscheidungen:**
- **Mobile-first** mit responsivem Desktop-Layout (ab 900 px Sidebar). Das Tracken passiert typischerweise am Handy.
- **Grünes Theming** als positives Signal („Gesundheit"); Rot ausschliesslich, wenn das Tagesziel überschritten wird.
- **Kalorienring statt Balken** auf dem Dashboard, weil ein Ring den Fortschritt schneller erfassbar macht.
- **Mahlzeitentyp wird automatisch nach Tageszeit vorgeschlagen** (Frühstück bis 10, Mittag bis 14, Snack bis 17, sonst Abendessen) – spart einen Klick.
- **Onboarding als geführter Wizard:** Statt die Nutzer:innen ein Kalorienziel raten zu lassen, wird es aus den Körperdaten berechnet (siehe Kap. 4.2).
- **Mahlzeit als ein aufklappbarer Block** im Tagesprotokoll: übersichtlich, Zutaten bei Bedarf einsehbar.

#### 3.4.2 Umsetzung (Technik)

**Technologie-Stack:** SvelteKit (Svelte 5 mit Runes-Syntax, JavaScript ohne TypeScript), MongoDB Atlas über den offiziellen `mongodb`-Treiber, Plain CSS mit Custom Properties (kein UI-Framework). Vite als Build-Tool, Cloudflare-Adapter (`adapter-cloudflare`) für das Deployment auf Cloudflare Pages. Passwort-Hashing mit dem Node-Kern (`node:crypto`, scrypt) ohne externe Auth-Bibliothek. Anbindung an die öffentliche **Open-Food-Facts**-Datenbank (ohne API-Key).

**Tooling:** VS Code mit Svelte-Erweiterung, Node.js + npm lokal, MongoDB Atlas in der Cloud, Cloudflare Pages als Hosting (siehe [wrangler.toml](kalorientracker/wrangler.toml)). Der Einsatz von KI ist in **Kapitel 6 (KI-Deklaration)** beschrieben.

**Struktur & Komponenten:**
- Routen unter [src/routes/](kalorientracker/src/routes/): `+layout.svelte` (Navigation, nur für angemeldete & eingerichtete Nutzer:innen), je Bereich `+page.svelte` (UI) und `+page.server.js` (Loader / Form-Actions). `src/hooks.server.js` löst die Session auf und schützt die Routen.
- Wiederverwendbare Komponenten unter [src/lib/components/](kalorientracker/src/lib/components/): `CalorieBar` (Kalorienring), `NutrientSummary` (Makros), `MealCard` (Tageseintrag, bei Mahlzeiten aufklappbar), `FoodForm` (Lebensmittel-Formular inkl. Foto-Upload), `MealBuilder` (Zutaten-Komposition mit Live-Summe), `WeightChart` (SVG-Verlaufsdiagramm), `Icon` (Inline-SVG-Set, an Lucide angelehnt).
- Reine Hilfslogik unter [src/lib/](kalorientracker/src/lib/): `nutrition.js` (Bedarfsberechnung nach Mifflin-St Jeor), `food.js` (Nährwert-Skalierung, Mahlzeiten-Summen, Mahlzeitentypen) – sowohl client- als auch serverseitig nutzbar.
- Server-only unter [src/lib/server/](kalorientracker/src/lib/server/): `db.js` (alle MongoDB-Zugriffe gekapselt), `auth.js` (scrypt-Hashing, Sessions), `foodInput.js` / `mealInput.js` (Eingabe-Validierung).
- Kein globaler Store: Daten kommen pro Route vom Server-Loader; der angemeldete Benutzer kommt aus `event.locals.user` (im Hook gesetzt) und über den Layout-Loader in alle Seiten.

**Daten & Schnittstellen:**
- Datenbank `KalorienTrackerDB` mit sechs Collections, alle Nutzdaten pro Benutzer (`userId`):
  - `users` – Konto: E-Mail (eindeutig), Passwort-Hash (scrypt), Name, Körperdaten (Geschlecht/Alter/Grösse/Gewicht/Aktivität/Ziel), berechnetes Kalorien-/Makroziel, Farbschema (`theme`, Default `dark`), `onboardedAt`.
  - `sessions` – Anmelde-Sessions mit Token und Ablaufdatum (TTL-Index → automatische Bereinigung).
  - `foods` – eigene Lebensmittel (Nährwerte je 100 g/ml, Einheit, optionales Foto als Base64).
  - `meals` – Mahlzeiten mit Zutaten-Liste (Snapshot je Zutat) und berechneten Gesamtnährwerten.
  - `entries` – Tageseinträge (`kind`: `food`/`meal`, Menge/Einheit, Nährwerte, Mahlzeitentyp, Datum; bei Mahlzeiten zusätzlich der Zutaten-Snapshot).
  - `weightEntries` – Gewicht pro Tag (ein Eintrag je Benutzer und Tag, eindeutiger Index).
- Indizes u. a.: `users.email` (unique), `sessions.expiresAt` (TTL), `foods/meals/entries` je `userId`, `weightEntries` je `userId+date` (unique).
- **Externe Schnittstelle:** Der Server-Endpunkt [`/api/food-search`](kalorientracker/src/routes/api/food-search/+server.js) fragt Open Food Facts ab (primär die neue Such-Engine „search-a-licious", Fallback auf die ältere API), bevorzugt deutsche Produktnamen und sortiert Produkte aus DE/CH/AT nach vorne. Die Abfrage läuft serverseitig (kein CORS, kein API-Key).
- **Externe KI-Schnittstelle:** Der Endpunkt [`/api/coach`](kalorientracker/src/routes/api/coach/+server.js) sendet die Tageswerte (Ziel + Tagessummen) an **OpenRouter** (OpenAI-kompatible API) und zeigt das zurückgegebene Coach-Feedback an. Schlüssel und Modell liegen in der `.env` (`OPENROUTER_API_KEY`, `OPENROUTER_MODEL`); der Aufruf erfolgt serverseitig und nur auf Nutzer-Klick (siehe Kap. 4.7).
- Schreiboperationen laufen über SvelteKit-Form-Actions (progressively enhanced).
- Der DB-Verbindungsstring liegt in `.env` (`DB_URI`) und wird über `$env/dynamic/private` eingebunden.

**Deployment:** Cloudflare Pages (zwei Projekte, je ein Branch; Adapter `adapter-cloudflare`, `wrangler.toml` mit `nodejs_compat` für den MongoDB-Treiber auf der Workers-Runtime). Der Produktions-Build wird lokal erzeugt und per `wrangler pages deploy` hochgeladen (Hilfsskript [`deploy.sh`](deploy.sh) im Repo-Root); die Projekte bleiben mit dem GitHub-Repository verknüpft. Beide Seiten sind live:
- **Hauptseite (Branch `main`):** https://kalorientracker-main.pages.dev
- **Erster Prototyp (Branch `prototyp-1`):** https://kalorientracker-prototyp.pages.dev

**Besondere Entscheidungen:**
- **Snapshot-Prinzip:** Beim Protokollieren werden die Nährwerte in den Tageseintrag *kopiert* (statt nur referenziert). So verfälscht eine spätere Änderung an einem Lebensmittel/einer Mahlzeit keine bereits erfassten Tage. Dasselbe gilt für die Zutaten einer Mahlzeit.
- **Kalorienziel = Summe der Makros:** Das angezeigte Kalorienziel entspricht immer `4·Protein + 4·KH + 9·Fett`, damit Ring und Makro-Anzeige konsistent zusammenpassen.
- **Passwort-Hashing mit `node:crypto` (scrypt):** keine zusätzliche Abhängigkeit, läuft auch in serverless-Umgebungen (Cloudflare Workers, Netlify); Vergleich timing-safe, generische Fehlermeldung beim Login.
- **Fotos als verkleinertes Base64 in MongoDB:** Das Bild wird im Browser per Canvas verkleinert und direkt in der DB gespeichert – kein externer Blob-Speicher/Key nötig (passend zum schlanken Prototyp-Charakter).
- **Open Food Facts ohne Key:** bewusst gewählt, weil sofort einsatzbereit, kostenlos und mit guter DE/CH-Abdeckung (nach Lokalisierung der Abfrage). Alternativen mit Key/OAuth (FatSecret u. a.) wurden geprüft, aber als unnötig aufwändig verworfen.
- **Deployment über lokalen Build:** Der Produktions-Build wird lokal erzeugt und per `wrangler pages deploy` (`deploy.sh`) hochgeladen, statt ihn in der Cloud-Build-Pipeline auszuführen – so wird der native MongoDB-Treiber zuverlässig gebündelt. Die automatischen Cloud-Builds sind deaktiviert, die git-Verknüpfung bleibt bestehen.

### 3.5 Validate

Mit dem **ersten Prototyp** (minimaler Tracker mit wiederverwendbaren Mahlzeiten, Branch `prototyp-1`) wurde eine **formative Usability-Evaluation** durchgeführt. Vorbereitung, Aufgabenblatt und Feedback-Grid liegen unter `Usability-Evaluation/`.

- **URL der getesteten Version:** https://kalorientracker-prototyp.pages.dev (erster Prototyp, Branch `prototyp-1`)
- **Ziele der Prüfung:**
  - Wird die **Startübersicht** verstanden – erkennen Nutzer:innen auf einen Blick die heute gegessenen Kalorien und den Rest bis zum Tagesziel?
  - Ist das zentrale Konzept klar – der Unterschied zwischen einer einmal gespeicherten, **wiederverwendbaren Mahlzeit** und einem **Eintrag für einen Tag**?
  - **Effektivität & Effizienz:** Können Nutzer:innen eine Mahlzeit ohne Hilfe erfassen und einem Tag zuordnen – und wie schnell gelingt das bei einer bereits gespeicherten Mahlzeit?
  - Finden und ändern sie ihr **persönliches Kalorienziel**?
  - Sind Navigation und (deutschsprachige) Begriffe erwartungskonform, und wird das eigentliche Problem gelöst (Ernährung einfach im Blick behalten)?
- **Vorgehen:** Moderierter, szenario-basierter Usability-Test mit **lautem Denken (Think-Aloud)**, on-site am Arbeitsplatz (Testperson und Testleiter:in nebeneinander), primär am Smartphone. Ca. 10 Minuten pro Test: kurze Vorabfragen, sieben einzeln und neutral vorgelegte Aufgaben (Kontext + Ziel, keine Lösungsbegriffe), Kurzfragen nach jeder Aufgabe, Abschlussinterview. Auswertung qualitativ (Beobachtungen, Aussagen) ergänzt um einfache Kennzahlen (Aufgabe gelöst ja/nein, grobe Zeit).
- **Stichprobe:** Gegenseitiges Testen mit **drei Mitstudierenden** (TP1–TP3), die den Prototyp vorher nicht kannten – Profil entspricht der primären Zielgruppe (erwachsene, technikaffine Personen mit Interesse an Ernährungs-Tracking).
- **Aufgaben/Szenarien** (Ausgangslage: „Du beginnst, bewusster auf deine Ernährung zu achten, und nutzt die App zum ersten Mal auf dem Smartphone."):
  1. **Überblick verschaffen:** Wie viel hast du heute bisher gegessen, wie viel ist bis zum Tagesziel noch offen?
  2. **Etwas Wiederkehrendes festhalten:** Ein fast tägliches Frühstück (~350 kcal) so speichern, dass es nicht jedes Mal neu eingegeben werden muss.
  3. **Eine Mahlzeit für heute erfassen:** Genau dieses gespeicherte Frühstück für den heutigen Tag eintragen.
  4. **Einen Fehler korrigieren:** Einen Eintrag, der gar nicht gegessen wurde, wieder entfernen.
  5. **Persönliches Ziel anpassen:** Die App auf höchstens 1'800 kcal/Tag einstellen.
  6. **Rückblick:** Prüfen, ob man in den letzten Tagen in der Nähe des Ziels geblieben ist.
  7. *(optional)* **Eine Angabe richtigstellen:** Die Kalorien des gespeicherten Frühstücks auf den korrekten Wert (~300 kcal) ändern.
- **Kennzahlen & Beobachtungen:**
  - **Messbares Usability-Ziel** (»mind. 4 von 5 Testpersonen erfassen eine gespeicherte Mahlzeit ohne Hilfe in unter 30 s«) **erreicht:** Alle drei Testpersonen erfassten die gespeicherte Mahlzeit (Aufgabe 3) ohne Eingreifen deutlich unter 30 Sekunden. Die Aufgaben 1, 3, 4 und 6 wurden durchgängig selbstständig gelöst.
  - **Positiv:** Die Startübersicht mit Kalorienring wurde sofort verstanden („auf einen Blick klar, wie viel noch geht"). Das Prinzip *einmal speichern → für einen Tag eintragen* war spätestens nach dem ersten Durchlauf klar. Löschen (Aufgabe 4) und Zielanpassung (Aufgabe 5) waren gut auffindbar.
  - **Problem 1 – Konto/Login vermisst (hoch):** Mehrere Testpersonen suchten zu Beginn nach einer Anmeldung bzw. einem persönlichen Profil. Ohne Konto wirkten die Daten „nicht wirklich meine", und es war unklar, ob die Einträge privat und dauerhaft gespeichert sind.
  - **Problem 2 – nur selbst angelegte Mahlzeiten (hoch):** Jedes Lebensmittel/jede Mahlzeit musste mit Nährwerten von Hand eingegeben werden. Die Testpersonen erwarteten, gängige Lebensmittel **suchen** zu können (bereits in Aufgabe 2), und empfanden die manuelle Eingabe als mühsam und als Einstiegshürde. Mehrfach kam der Wunsch, auch ein **einzelnes Lebensmittel** statt immer einer ganzen Mahlzeit zu erfassen.
  - **Problem 3 – Zielwert wirkte willkürlich (mittel):** Das Anpassen des Kalorienziels (Aufgabe 5) gelang, aber die Testpersonen wussten nicht, welcher Wert für sie sinnvoll ist, und wünschten sich einen **Vorschlag auf Basis ihrer Körperdaten**.
- **Zusammenfassung der Resultate:** Das Kernkonzept trägt: Übersicht und wiederverwendbare Mahlzeiten wurden verstanden und schnell bedient, das messbare Usability-Ziel wurde erreicht. Die grössten Schwächen lagen nicht im Ablauf, sondern im **fehlenden Benutzerkonto**, in der **mühsamen manuellen Lebensmitteleingabe** (keine Datenbank/Suche, nur eigene Mahlzeiten) und im **willkürlichen Zielwert**.
- **Abgeleitete Verbesserungen** (priorisiert; alle inzwischen umgesetzt, siehe Kap. 4):
  1. **Benutzerkonten mit Login/Registrierung** und persönlichen, dauerhaft gespeicherten Daten → Kap. 4.1.
  2. **Lebensmittel-Datenbank mit Suche** (Open Food Facts) statt reiner Handeingabe sowie das Erfassen **einzelner Lebensmittel** zusätzlich zu Mahlzeiten → Kap. 4.3 und 4.4.
  3. **Automatische Bedarfsberechnung** über ein kurzes Onboarding (Körperdaten → Kalorien-/Makroziel) statt eines frei geratenen Zielwerts → Kap. 4.2.

## 4. Erweiterungen

Die folgenden Funktionen gehen über den ursprünglichen Mindestumfang (schlanker Tracker mit wiederverwendbaren Mahlzeiten) hinaus.

### 4.1 Benutzerkonten mit Login & Registrierung
- **Beschreibung & Nutzen:** Registrierung und Anmeldung mit E-Mail und Passwort. Erst dadurch sind die Daten pro Person getrennt und über Geräte hinweg nutzbar. Passwörter werden mit scrypt gehasht (kein Klartext), Sessions laufen über ein httpOnly-Cookie mit automatischem Ablauf.
- **Wo umgesetzt:**
  - **Frontend:** [src/routes/login/+page.svelte](kalorientracker/src/routes/login/+page.svelte) (Umschalter Anmelden/Registrieren), Abmelden im Profil [src/routes/profile/+page.svelte](kalorientracker/src/routes/profile/+page.svelte).
  - **Backend:** [src/lib/server/auth.js](kalorientracker/src/lib/server/auth.js) (Hashing, Sessions), [src/routes/login/+page.server.js](kalorientracker/src/routes/login/+page.server.js), [src/routes/logout/+server.js](kalorientracker/src/routes/logout/+server.js), Zugriffsschutz in [src/hooks.server.js](kalorientracker/src/hooks.server.js).
  - **Datenbank:** Collections `users` (eindeutiger E-Mail-Index) und `sessions` (TTL-Index).
- **Referenz:** vgl. Kap. 3.4.2 (Daten & Schnittstellen).
- **Aus Evaluation abgeleitet?:** **Ja** – die Tester:innen vermissten ein Konto/Login; ohne Anmeldung wirkten die Daten unpersönlich und ihre dauerhafte, private Speicherung unklar (Kap. 3.5, Problem 1). Zugleich Voraussetzung für die übrigen Erweiterungen.

### 4.2 Onboarding mit automatischer Bedarfsberechnung
- **Beschreibung & Nutzen:** Ein 5-Schritt-Wizard erfragt Geschlecht, Alter, Grösse, Gewicht, Aktivitätsniveau und Ziel (Abnehmen/Halten/Aufbau) und berechnet daraus Kalorien- und Makroziel. Methode: Grundumsatz nach **Mifflin-St Jeor** → Gesamtbedarf über den Aktivitätsfaktor → Ziel-Anpassung (Defizit/Überschuss) → Makros (Protein nach Körpergewicht, Fett ~27,5 %, Rest Kohlenhydrate; 4/4/9 kcal je g). Im Profil lassen sich Werte ändern und das Ziel neu berechnen oder die Makros manuell anpassen.
- **Wo umgesetzt:**
  - **Frontend:** [src/routes/onboarding/+page.svelte](kalorientracker/src/routes/onboarding/+page.svelte) (Wizard mit Live-Vorschau), Profil [src/routes/profile/+page.svelte](kalorientracker/src/routes/profile/+page.svelte).
  - **Backend:** Berechnungslogik [src/lib/nutrition.js](kalorientracker/src/lib/nutrition.js); Speicherung über [src/routes/onboarding/+page.server.js](kalorientracker/src/routes/onboarding/+page.server.js) und [src/routes/profile/+page.server.js](kalorientracker/src/routes/profile/+page.server.js); Onboarding-Zwang im Hook.
  - **Datenbank:** Körperdaten und berechnete Ziele am `users`-Dokument.
- **Referenz:** Kap. 3.4.1 (Designentscheidungen).
- **Aus Evaluation abgeleitet?:** **Ja** – der frei einzugebende Zielwert wirkte in der Evaluation willkürlich; gewünscht war ein aus den Körperdaten berechneter Vorschlag (Kap. 3.5, Problem 3).

### 4.3 Lebensmittel-Datenbank (Open Food Facts) & eigene Lebensmittel mit Foto
- **Beschreibung & Nutzen:** Lebensmittel können in einer öffentlichen Datenbank gesucht und mit Mengenangabe (g/ml) erfasst werden. Alternativ legt man eigene Lebensmittel an (Nährwerte je 100 g/ml) und kann ein Foto hochladen. Die Suche ist auf deutsche/Schweizer Produkte optimiert und nutzt die neue Such-Engine von Open Food Facts mit Fallback.
- **Wo umgesetzt:**
  - **Frontend:** [src/routes/add/+page.svelte](kalorientracker/src/routes/add/+page.svelte) (Suche + Tag-Logging), [src/lib/components/FoodForm.svelte](kalorientracker/src/lib/components/FoodForm.svelte) (Formular + Foto-Verkleinerung im Browser).
  - **Backend:** Server-Endpunkt [src/routes/api/food-search/+server.js](kalorientracker/src/routes/api/food-search/+server.js); Lebensmittel-Routen [src/routes/add/food/new/+page.server.js](kalorientracker/src/routes/add/food/new/+page.server.js) und [src/routes/add/food/[id]/+page.server.js](kalorientracker/src/routes/add/food/%5Bid%5D/+page.server.js); Validierung [src/lib/server/foodInput.js](kalorientracker/src/lib/server/foodInput.js).
  - **Datenbank:** Collection `foods` (eigene Lebensmittel inkl. Foto als Base64).
- **Referenz:** Kap. 3.4.2 (Externe Schnittstelle).
- **Aus Evaluation abgeleitet?:** **Ja** – im Prototyp liessen sich nur selbst angelegte Mahlzeiten erfassen; die manuelle Nährwerteingabe war mühsam, eine Lebensmittel-Suche wurde gewünscht (Kap. 3.5, Problem 2).

### 4.4 Mahlzeiten aus mehreren Lebensmitteln
- **Beschreibung & Nutzen:** Eine Mahlzeit wird aus mehreren Lebensmitteln mit Mengen zusammengestellt (aus den eigenen Lebensmitteln, der Open-Food-Facts-Suche oder manuell). Die Gesamtnährwerte werden live berechnet. Eine gespeicherte Mahlzeit lässt sich mit einem Klick einem Tag hinzufügen und erscheint dort als aufklappbarer Block.
- **Wo umgesetzt:**
  - **Frontend:** [src/lib/components/MealBuilder.svelte](kalorientracker/src/lib/components/MealBuilder.svelte) (Zutaten-Editor mit Live-Summe), [src/routes/add/meal/new/+page.svelte](kalorientracker/src/routes/add/meal/new/+page.svelte) & [src/routes/add/meal/[id]/+page.svelte](kalorientracker/src/routes/add/meal/%5Bid%5D/+page.svelte), Anzeige in [src/lib/components/MealCard.svelte](kalorientracker/src/lib/components/MealCard.svelte).
  - **Backend:** Mahlzeiten-Routen + Validierung [src/lib/server/mealInput.js](kalorientracker/src/lib/server/mealInput.js); Berechnung in [src/lib/food.js](kalorientracker/src/lib/food.js); CRUD in [src/lib/server/db.js](kalorientracker/src/lib/server/db.js).
  - **Datenbank:** Collection `meals` (Zutaten-Snapshot + Gesamtnährwerte); Tageseinträge mit `kind: 'meal'`.
- **Referenz:** Kap. 2 (Kernfunktionalität).
- **Aus Evaluation abgeleitet?:** **Teilweise** – aus dem Wunsch, auch **einzelne Lebensmittel** zu erfassen und Mahlzeiten aus durchsuchbaren Lebensmitteln statt aus manuell getippten Nährwerten zusammenzustellen (Kap. 3.5, Problem 2).

### 4.5 Gewichtstracker mit Verlaufs-Chart
- **Beschreibung & Nutzen:** Tägliche Gewichtserfassung mit einem SVG-Verlaufsdiagramm (ohne externe Chart-Bibliothek). Das Tracken ändert das Kalorienziel bewusst nicht; auf Wunsch lässt sich das Ziel aber mit dem aktuellen Gewicht neu berechnen.
- **Wo umgesetzt:**
  - **Frontend:** [src/routes/weight/+page.svelte](kalorientracker/src/routes/weight/+page.svelte), Diagramm [src/lib/components/WeightChart.svelte](kalorientracker/src/lib/components/WeightChart.svelte).
  - **Backend:** [src/routes/weight/+page.server.js](kalorientracker/src/routes/weight/+page.server.js) (Erfassen/Löschen, „neu berechnen"-Action).
  - **Datenbank:** Collection `weightEntries` (ein Eintrag pro Tag, eindeutiger Index).
- **Referenz:** Kap. 3.4.1.
- **Aus Evaluation abgeleitet?:** Nein – Produktentscheid.

### 4.6 Wählbares Farbschema (Dark/Light Mode)
- **Beschreibung & Nutzen:** Die App bietet ein dunkles und ein helles Design. Standard ist **Dark Mode**; im Profil lässt sich das Farbschema pro Benutzer umschalten und wird dauerhaft am Konto gespeichert. Das gewählte Schema wird bereits **serverseitig** in den `<html>`-Tag geschrieben (`data-theme`), sodass die Seite ohne kurzes Aufblitzen des falschen Designs lädt. Technisch umgesetzt über die semantischen CSS-Custom-Properties: Nur die Token-Werte werden je Schema umgelegt, alle Komponenten adaptieren automatisch (Farbwerte auf WCAG-AA-Kontrast ausgelegt). Im Profil sorgt eine Live-Vorschau dafür, dass die Auswahl sofort sichtbar ist.
- **Wo umgesetzt:**
  - **Frontend:** Umschalter „Darstellung" im Profil [src/routes/profile/+page.svelte](kalorientracker/src/routes/profile/+page.svelte) (mit Live-Vorschau); Design-Tokens inkl. Dark-Variante in [src/app.css](kalorientracker/src/app.css); `data-theme`-Platzhalter in [src/app.html](kalorientracker/src/app.html).
  - **Backend:** Serverseitiges Setzen des Schemas in [src/hooks.server.js](kalorientracker/src/hooks.server.js) (`transformPageChunk`, Default Dark); Validierung & Speicherung in [src/routes/profile/+page.server.js](kalorientracker/src/routes/profile/+page.server.js); Default und Serialisierung in [src/lib/server/db.js](kalorientracker/src/lib/server/db.js) und [src/lib/server/auth.js](kalorientracker/src/lib/server/auth.js).
  - **Datenbank:** Feld `theme` (`'dark'`/`'light'`, Default `dark`) am `users`-Dokument.
- **Referenz:** Kap. 3.4.1 (Designentscheidungen: grünes Theming).

| Dark Mode (Standard) | Light Mode |
| --- | --- |
| ![Dashboard im Dark Mode](docs/screenshots/dashboard.png) | ![Dashboard im Light Mode](docs/screenshots/dashboard-light.png) |

- **Aus Evaluation abgeleitet?:** Nein – Produktentscheid.

### 4.7 KI-Coach: Tages-Feedback (OpenRouter)
- **Beschreibung & Nutzen:** Auf dem Dashboard liefert ein **KI-Coach** auf Knopfdruck ein kurzes, motivierendes Feedback zum heutigen Tag samt einem konkreten Tipp. Die App schickt dazu die Tageswerte (Ziel + bisher gegessene Kalorien/Makros, Anzahl Einträge) an ein Sprachmodell und zeigt die Antwort an. Der Aufruf passiert **nur auf Klick** (keine Aufrufe/Kosten im Hintergrund); die Ausgabe ist ausdrücklich als Coaching/Schätzung, nicht als medizinische Beratung gekennzeichnet.
- **Wo umgesetzt:**
  - **Frontend:** „KI-Coach"-Karte auf dem Dashboard [src/routes/+page.svelte](kalorientracker/src/routes/+page.svelte) (Button mit Lade- und Fehlerzustand, ruft den Endpunkt per `fetch` auf).
  - **Backend:** Server-Endpunkt [src/routes/api/coach/+server.js](kalorientracker/src/routes/api/coach/+server.js) (lädt die heutigen Einträge und berechnet die Summen serverseitig) und KI-Client [src/lib/server/coach.js](kalorientracker/src/lib/server/coach.js) (Prompt-Aufbau + Aufruf der OpenRouter-API).
  - **Konfiguration:** `OPENROUTER_API_KEY` und `OPENROUTER_MODEL` in der `.env` (serverseitig über `$env/dynamic/private`, analog zu `DB_URI`).
- **Technik:** OpenRouter wird über die **OpenAI-kompatible** Chat-Completions-API per `fetch` angesprochen – ohne zusätzliche Abhängigkeit. Fehlt der Schlüssel oder schlägt der Aufruf fehl, bleibt die App nutzbar und zeigt eine verständliche Meldung.
- **Referenz:** Kap. 6 (KI-Deklaration – die App nutzt KI hier zur **Laufzeit**, nicht nur zur Entwicklung).
- **Aus Evaluation abgeleitet?:** Nein – Produktentscheid.

## 5. Projektorganisation

- **Repository & Struktur:** SvelteKit-Standard mit `src/routes/` (Routen + Server-Loader/Actions), `src/lib/components/` (UI), `src/lib/` (reine Hilfslogik), `src/lib/server/` (DB-Layer & Auth, nur serverseitig importierbar), `static/` (Assets). `Informationen/`, `Usability-Evaluation/`, `.claude/`, `.env`, `node_modules/`, `build/` und `.svelte-kit/` sind in `.gitignore` ausgeschlossen.
- **Issue-Management:** _[z. B. GitHub Issues / Board – falls genutzt, hier beschreiben, sonst weglassen]_
- **Commit-Praxis:** Kurze, sprechende Commits im Imperativ (z. B. „Add login and per-user accounts", „Add onboarding and weight tracker", „Add food database and ingredient-based meals", „Improve food search relevance and ranking").

## 6. KI-Deklaration

### 6.1 KI-Tools
- **Eingesetzte Tools:** **Claude Code** (Anthropic) mit dem Modell **Claude Opus 4.x** als zentrales Werkzeug für die Implementierung. _[Falls weitere Tools genutzt wurden (z. B. ChatGPT, Copilot), hier ergänzen.]_
- **Zweck & Umfang:** KI wurde umfassend für die **technische Umsetzung** eingesetzt: Erstellen und Refactoring des SvelteKit-Codes (Routen, Komponenten, Datenbank-Layer, Authentifizierung, Anbindung der Lebensmittel-API), CSS/Design-Feinschliff, Verifikation per Build- und Browser-Tests sowie Textentwürfe (u. a. diese README). Das **Produkt- und UX-Konzept, die Feature-Entscheide, die Auswahl zwischen Optionen** (z. B. Berechnungsmethode für den Kalorienbedarf, Foto-Speicherung in der DB, Wahl der Lebensmittel-Datenbank) sowie das **Testen** habe ich vorgegeben bzw. selbst durchgeführt; die KI hat auf diese Vorgaben hin umgesetzt und Optionen vorgeschlagen.
- **Eigene Leistung (Abgrenzung):** Problemraumanalyse und App-Konzept, das Figma-Mockup und das Dokument „Workflows und Designentscheide", die Festlegung des Funktionsumfangs, sämtliche Produkt- und Designentscheidungen, das Abnehmen/Testen der Ergebnisse sowie die Vorbereitung und Durchführung der Usability-Evaluation.
- **KI als Produkt-Feature (Laufzeit):** Über die in Kap. 4.7 beschriebene Funktion nutzt die App **zur Laufzeit selbst** ein Sprachmodell (über OpenRouter). Dabei werden die Tageswerte (Ziel und Tagessummen, keine Klarnamen oder Kontaktdaten) an den Anbieter übermittelt. Das ist von der KI-Nutzung zur *Entwicklung* (oben) zu unterscheiden.

### 6.2 Prompt-Vorgehen
Ich bin **iterativ in kleinen Schritten** vorgegangen – Funktion für Funktion statt einer einzigen „bau mir die App"-Anfrage. Pro Schritt habe ich den Kontext und die gewünschte Konvention vorgegeben (z. B. Svelte-5-Runes statt Stores, DB-Zugriffe nur im Server-Layer) und bei grösseren Entscheidungen bewusst Rückfragen bzw. Optionen abgewogen, bevor umgesetzt wurde. Vorschläge habe ich vor der Übernahme gelesen, im Browser getestet und bei Bedarf angepasst. Beispiel-Prompt: _„Baue ein Onboarding, das Geschlecht/Alter/Grösse/Gewicht/Aktivität/Ziel abfragt und daraus mit Mifflin-St Jeor ein Kalorien- und Makroziel berechnet und im Profil speichert."_

### 6.3 Reflexion
- **Nutzen:** KI hat Boilerplate (CSS, Form-Actions, MongoDB-Patterns) und das Aufsetzen der Toolchain deutlich beschleunigt und half, gängige Best Practices (Zugriffsschutz, sichere Passwort-Speicherung) sauber umzusetzen.
- **Grenzen:** Bei Konzept- und Architekturfragen lieferte die KI eher Optionen als die eine Antwort – entscheiden musste ich selbst. Fachliche Korrektheit (z. B. Nährwert-Formeln) habe ich gegengeprüft.
- **Risiken / Qualitätssicherung:** Nach jedem Schritt manuelles Lesen des Codes sowie Build- und Browser-Tests des betroffenen Bereichs. Erkenntnis: KI ist als Pair-Programmer stark, ersetzt aber weder Konzept noch Validierung.

## 7. Anhang

- **Quellen:**
  - **Lebensmitteldaten:** [Open Food Facts](https://world.openfoodfacts.org/) – die Produktdaten stehen unter der **Open Database License (ODbL)**, einzelne Inhalte unter der Database Contents License; Bilder unter CC-BY-SA. Die Daten werden ausschliesslich abgefragt und angezeigt (Abfrage in [src/routes/api/food-search/+server.js](kalorientracker/src/routes/api/food-search/+server.js)).
  - **Icons:** Lucide (ISC/MIT-Lizenz), in [src/lib/components/Icon.svelte](kalorientracker/src/lib/components/Icon.svelte) als Inline-SVG nachgebaut.
  - **Berechnungsmethode:** Grundumsatz nach Mifflin-St Jeor; Aktivitätsfaktoren und Makro-Empfehlungen aus gängiger Ernährungs-/Sportwissenschaft.
  - **Doku:** SvelteKit (svelte.dev), MongoDB-Node-Treiber.
- **Testskript & Materialien:** Aufgabenblatt (7 Szenarien), Vorab- und Abschlussfragen sowie das Feedback-Grid liegen unter `Usability-Evaluation/` (lokal, nicht im öffentlichen Repo).
- **Rohdaten/Auswertung:** Beobachtungen pro Testperson im Feedback-Grid (`Usability-Evaluation/`); die verdichteten Ergebnisse stehen in Kap. 3.5.

---

## Setup & Entwicklung

> Die App liegt im Unterordner [`kalorientracker/`](kalorientracker/); alle folgenden Befehle dort ausführen.

```sh
cd kalorientracker

# Abhängigkeiten installieren
npm install

# .env anlegen (MongoDB-URI; OpenRouter optional – nur für den KI-Coach, Kap. 4.7)
cat > .env <<'EOF'
DB_URI="<mongodb-connection-string>"
OPENROUTER_API_KEY="<dein-openrouter-token>"
OPENROUTER_MODEL="openai/gpt-4o-mini"
EOF

# Dev-Server
npm run dev

# Production-Build + Preview
npm run build
npm run preview
```

### Deployment

Der Build wird lokal erzeugt und zu Cloudflare Pages hochgeladen. Das Skript [`deploy.sh`](deploy.sh) (Repo-Root) erkennt den aktuellen Branch automatisch (`main` → Hauptseite, `prototyp-1` → Prototyp), baut und lädt hoch:

```sh
# einmalig: bei Cloudflare anmelden
npx wrangler login

# danach pro Deploy:
./deploy.sh
```
