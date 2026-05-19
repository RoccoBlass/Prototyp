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

Wer auf seine Ernährung achtet (z. B. zur Gewichtskontrolle oder beim Muskelaufbau), möchte den Tag über grob im Blick haben, wie viele Kalorien und Makros (Protein, Kohlenhydrate, Fett) schon konsumiert wurden. Bestehende Apps wie MyFitnessPal können das natürlich auch, sind in meinen Augen aber überladen, verlangen ein Konto und blenden Werbung ein. Dazu kommt: Wer immer wieder dieselben Mahlzeiten isst, gibt die gleichen Werte gefühlt zum hundertsten Mal ein.

- **Problem:** Bestehende Tracking-Apps sind zu komplex und ignorieren, dass viele Mahlzeiten Wiederholungen sind.
- **Ziele:** Tagesüberblick mit klarem Fortschritt zum eigenen Ziel; Mahlzeiten als Vorlagen, die mit einem Klick erfasst werden können; Wochenrückblick; persönliches Tagesziel anpassbar; reduzierte UI ohne Login.
- **Primäre Zielgruppe:** Erwachsene, die ihre Kalorien- und Nährwertaufnahme bewusst verfolgen wollen und dafür eine schnelle, schlanke Lösung suchen.
- **Weitere Stakeholder:** _[z. B. Modulleitung, Mitstudierende als Tester:innen]_

## 2. Lösungsidee

Statt jedes Essen jedesmal komplett neu einzugeben, lege ich häufig konsumierte Mahlzeiten einmal als **Vorlage** an (Name, Kalorien, Makros). Diese Vorlagen kann ich dann mit einem Klick als Tageseintrag protokollieren – inkl. Mahlzeitentyp (Frühstück, Mittag, Abendessen, Snack). Auf dem Dashboard sehe ich den heutigen Stand mit Kalorienring und Makros, im Verlauf die letzten 7 Tage, im Profil mein persönliches Tagesziel.

- **Annahmen:** Nutzer:innen kennen ihren Kalorienbedarf bzw. wissen, wie sie ihn ermitteln. Die Werte tragen sie aus Verpackungen oder eigener Recherche ein – eine Lebensmitteldatenbank ist im Prototyp bewusst nicht vorgesehen.
- **Abgrenzung:** Kein Multi-User-System, keine Authentifizierung, keine Lebensmittel-API/Barcode-Scan, keine Mengen in Gramm pro Eintrag, kein Auswertungszeitraum > 7 Tage.

## 3. Vorgehen & Artefakte

Das Projekt orientierte sich am Design-Sprint-Vorgehen aus dem Unterricht.

### 3.1 Understand & Define

- **Zielgruppenverständnis:** Im Problemraum habe ich mir bestehende Tracking-Apps angeschaut (MyFitnessPal, Yazio, FatSecret) und Erfahrungen aus dem eigenen Umfeld einbezogen. Daraus entstanden zwei Proto-Personas: einerseits jemand sportlich Aktives im Aufbau, andererseits eine berufstätige Person mit relativ konstanten Routinegerichten.
- **Wesentliche Erkenntnisse:**
  - Wiederholung ist riesig: Über die Woche kehren oft dieselben 5–10 Mahlzeiten wieder. Genau hier setzt das Vorlagen-Prinzip an.
  - Ein sichtbares Ziel motiviert mehr als reine Zahlen – ein Fortschrittsring wirkt stärker als eine reine Tabelle.
  - Lebensmittelsuchen werden häufig abgebrochen, wenn das gesuchte Produkt nicht sofort gefunden wird.
  - Login + Werbung + Cross-Selling sind in bestehenden Apps der grösste Reibungspunkt.

### 3.2 Sketch

- **Variantenüberblick:** Drei Skizzen entstanden:
  - (a) klassisches Eingabeformular pro Mahlzeit
  - (b) Vorlagensammlung mit „Tap-to-Log"
  - (c) Tagesplan mit fixen Mahlzeit-Slots
- **Skizzen:** _[Skizzen unter `/docs/sketches/` ablegen und hier referenzieren. (a) wurde verworfen wegen wiederholter Eingabearbeit, (c) weil sie unterschiedliche Esstypen (z. B. mehrere Snacks) nicht sauber abbildet.]_

### 3.3 Decide

Gewählt habe ich Variante (b). Entscheidkriterien waren minimaler Aufwand pro Logging-Vorgang, niedrige kognitive Last, hohe Wiederverwendung und einfache technische Umsetzung in SvelteKit.

**End-to-End-Ablauf:**
1. Nutzer:in öffnet das Dashboard und sieht den aktuellen Tagesstand.
2. Klick auf „Hinzufügen" → Mahlzeitentyp + Vorlage auswählen (oder neue Vorlage anlegen).
3. Eintrag erscheint sofort auf dem Dashboard, der Kalorienring aktualisiert sich.
4. Über „Verlauf" lässt sich die Woche überblicken.
5. Über „Profil" (unten links) kann das Tagesziel jederzeit angepasst werden.

**Mockup:** _[URL zu Figma einfügen; Screenshots der wichtigsten Screens unter `/docs/mockups/` ablegen.]_

### 3.4 Prototype

#### 3.4.1 Entwurf (Design)

**Informationsarchitektur** – flach gehalten, fünf Hauptbereiche:

| Route | Funktion |
| --- | --- |
| `/` | Dashboard (Tagesüberblick) |
| `/add` | Mahlzeit erfassen (Vorlagen-Auswahl) |
| `/add/new`, `/add/edit/[id]` | Vorlage anlegen / bearbeiten |
| `/history` | Verlauf der letzten 7 Tage |
| `/profile` | Persönliches Tagesziel anpassen |

Auf dem Desktop wird die Navigation als Sidebar dargestellt, mobil als Bottom-Nav. Das Profil ist auf dem Desktop unten links angedockt, auf Mobile als kleiner User-Button oben rechts in der Topbar.

**User Interface Design:** _[Screenshots der wichtigsten Screens hier einfügen: Dashboard, Mahlzeit hinzufügen, neue Vorlage, Verlauf, Profil.]_

**Designentscheidungen:**
- **Mobile-first** mit responsivem Desktop-Layout (ab 900 px wird die Sidebar eingeblendet). Das Tracken passiert typischerweise am Handy.
- **Grünes Theming** als positives Signal („Gesundheit"); Rot ausschliesslich, wenn das Tagesziel überschritten wird.
- **Kalorienring statt Balken** auf dem Dashboard, weil ein Ring den Fortschritt schneller erfassbar macht.
- **Mahlzeitentyp wird automatisch nach Tageszeit vorgeschlagen** (Frühstück bis 10, Mittagessen bis 14, Snack bis 17, sonst Abendessen) – spart einen Klick.

#### 3.4.2 Umsetzung (Technik)

**Technologie-Stack:** SvelteKit (Svelte 5 mit Runes-Syntax, JavaScript ohne TypeScript), MongoDB Atlas via offiziellen `mongodb`-Treiber, Plain CSS mit Custom Properties (kein UI-Framework). Vite als Build-Tool, `@sveltejs/adapter-auto` lokal, Netlify-Adapter für das Deployment.

**Tooling:** VS Code mit Svelte-Erweiterung, Node.js + npm lokal, MongoDB Atlas in der Cloud, Netlify als Hosting (siehe [netlify.toml](netlify.toml)). Wo KI im Spiel war, ist im Kapitel **6. KI-Deklaration** beschrieben.

**Struktur & Komponenten:**
- Routen unter [src/routes/](src/routes/): `+layout.svelte` mit Navigation und Profil-Footer; je Bereich eine `+page.svelte` (UI) und `+page.server.js` (Loader / Form-Actions).
- Wiederverwendbare Komponenten unter [src/lib/components/](src/lib/components/): `CalorieBar` (Kalorienring), `NutrientSummary` (Makros), `MealCard` (einzelne Mahlzeit mit Lösch-Button), `Icon` (Inline-SVG-Set, an Lucide angelehnt).
- Sämtliche DB-Zugriffe sind in [src/lib/server/db.js](src/lib/server/db.js) gekapselt – nur dort darf Mongo importiert werden.
- Kein globaler Store: Daten kommen pro Route vom Server-Loader, das Tagesziel zusätzlich aus dem Layout-Loader [src/routes/+layout.server.js](src/routes/+layout.server.js).

**Daten & Schnittstellen:**
- Datenbank `KalorienTrackerDB` mit drei Collections:
  - `mealTemplates` – Vorlagen (Name + Werte)
  - `entries` – Tageseinträge mit Verweis auf Template, Mahlzeitentyp und Datum
  - `settings` – persönliche Einstellungen (Single-Document mit fixem `_id: 'user'`, aktuell nur das Tagesziel)
- Indizes auf `mealTemplates.name`, `mealTemplates.updatedAt`, `entries.date`, `entries.createdAt`.
- Beim ersten Start migriert `migrateLegacyMealsIfNeeded()` eine ältere flache `meals`-Collection ins neue Modell.
- Schreiboperationen laufen über SvelteKit-Form-Actions, also progressively enhanced (funktionieren auch ohne JavaScript).
- DB-Verbindungsstring liegt in `.env` (`DB_URI`) und ist über `$env/static/private` eingebunden.

**Deployment:** _[Netlify-URL einfügen, z. B. https://kalorientracker.netlify.app]_

**Besondere Entscheidungen:**
- **Vorlage ↔ Eintrag getrennt:** Werte aus der Vorlage werden in den Eintrag *kopiert*. Das hat den Vorteil, dass eine spätere Änderung an einer Vorlage nicht rückwirkend alte Tage verfälscht.
- **Settings als Single-Document:** Das Projekt ist single-user, daher keine eigene Settings-Tabelle pro Wert, sondern ein einzelnes Dokument mit Upsert.
- **Kein Auth im Prototyp:** Bewusst weggelassen, weil der Fokus auf dem Tracking-Workflow liegt und Auth den Scope der Übung gesprengt hätte.

### 3.5 Validate

- **URL der getesteten Version:** _[separat deployte Test-URL einfügen]_
- **Ziele der Prüfung:**
  - Wird das Konzept Vorlage vs. Tageseintrag intuitiv verstanden?
  - Klappt der erste Logging-Vorgang (Vorlage anlegen + Eintrag erfassen) ohne Erklärung?
  - Wird der Zusammenhang zwischen Profil-Tagesziel und Dashboard-Ring erkannt?
- **Vorgehen:** _[z. B. moderiertes Remote-Testing mit Bildschirmfreigabe, Think-Aloud-Methode, ca. 10 min pro Person]_
- **Stichprobe:** _[Anzahl + Profil der Tester:innen]_
- **Aufgaben/Szenarien:**
  1. Lege eine Vorlage für dein typisches Frühstück an.
  2. Erfasse, was du heute zu Mittag gegessen hast.
  3. Schau dir an, wie viele Kalorien du in den letzten Tagen hattest.
  4. Stelle dein persönliches Tagesziel auf 2200 kcal um.
- **Kennzahlen & Beobachtungen:** _[hier eintragen]_
- **Zusammenfassung der Resultate:** _[2–4 Sätze]_
- **Abgeleitete Verbesserungen:** _[priorisiert; falls bereits umgesetzt → in Kap. 4]_

## 4. Erweiterungen

### 4.1 Persönliches Profil mit Kalorien- und Makro-Zielen
- **Beschreibung & Nutzen:** Über das Feld unten links (Sidebar/Topbar) gelangt man auf eine Profilseite, auf der ein Anzeigename, das tägliche Kalorienziel (500–10000 kcal, frei oder per Schnell-Preset 1500/1800/2000/2200/2500/3000, Standard 2000 kcal) sowie die Tagesziele für Protein, Kohlenhydrate und Fett festgelegt werden. Kalorienziel wirkt auf den Kalorienring im Dashboard und die Soll/Ist-Anzeige im Verlauf, die Makro-Ziele auf die Nährstoff-Übersicht. Damit ist der Tracker für unterschiedliche Phasen (Cut, Maintain, Bulk) sinnvoll nutzbar.
- **Wo umgesetzt:**
  - **Frontend:** Route [src/routes/profile/+page.svelte](src/routes/profile/+page.svelte); Profil-Eintrag in der Sidebar/Topbar in [src/routes/+layout.svelte](src/routes/+layout.svelte); Verwendung der Werte in [src/routes/+page.svelte](src/routes/+page.svelte), [src/routes/history/+page.svelte](src/routes/history/+page.svelte) und konfigurierbare Ziele in [src/lib/components/NutrientSummary.svelte](src/lib/components/NutrientSummary.svelte).
  - **Backend:** Form-Action `updateProfile` in [src/routes/profile/+page.server.js](src/routes/profile/+page.server.js); globaler Loader [src/routes/+layout.server.js](src/routes/+layout.server.js) stellt die Einstellungen allen Routen bereit.
  - **Datenbank:** Collection `settings` mit `getSettings()` / `saveSettings()` in [src/lib/server/db.js](src/lib/server/db.js).
- **Referenz:** vgl. Kap. 3.4.2 (Daten & Schnittstellen).
- **Aus Evaluation abgeleitet?:** _[Ja/Nein – falls aus Test-Issue abgeleitet, hier verlinken]_

### 4.2 Mahlzeitenvorlagen mit Wiederverwendung
- **Beschreibung & Nutzen:** Häufig konsumierte Gerichte werden einmalig als Vorlage angelegt und können danach per Klick als Tageseintrag protokolliert werden. Das senkt den Eingabeaufwand bei Routinegerichten erheblich – die eigentliche Kernidee des Konzepts.
- **Wo umgesetzt:**
  - **Frontend:** [src/routes/add/+page.svelte](src/routes/add/+page.svelte) (Vorlagen-Auswahl mit Suche), [src/routes/add/new/+page.svelte](src/routes/add/new/+page.svelte), [src/routes/add/edit/[id]/+page.svelte](src/routes/add/edit/%5Bid%5D/+page.svelte)
  - **Backend:** Form-Action `log` (Eintrag aus Vorlage); CRUD-Funktionen `addTemplate`, `updateTemplate`, `deleteTemplate`, `addEntryFromTemplate` in [src/lib/server/db.js](src/lib/server/db.js).
  - **Datenbank:** Trennung in zwei Collections (`mealTemplates`, `entries`), Migration aus älterer flacher `meals`-Collection.
- **Referenz:** Kap. 3.4.1 / 3.4.2.
- **Aus Evaluation abgeleitet?:** Nein – Kernidee der gewählten Variante (Kap. 3.3).

## 5. Projektorganisation

- **Repository & Struktur:** SvelteKit-Standard mit `src/routes/` (Routen + Server-Loader/Actions), `src/lib/components/` (UI), `src/lib/server/` (DB-Layer, nur serverseitig importierbar), `static/` (Assets). `Informationen/` und `.claude/` sind in `.gitignore` ausgeschlossen, ebenso `.env`, `node_modules/`, `build/` und `.svelte-kit/`.
- **Issue-Management:** _[z. B. GitHub Issues / Trello-Board oder weglassen]_
- **Commit-Praxis:** Kurze, sprechende Commits im Imperativ (z. B. „Split meals into reusable templates and daily entries", „Configure Netlify deployment").

## 6. KI-Deklaration

### 6.1 KI-Tools
- **Eingesetzte Tools:** _[z. B. Claude Code (Anthropic, Claude Opus 4.x), GitHub Copilot, ChatGPT – mit Version anpassen]_
- **Zweck & Umfang:** _[konkretisieren, z. B.: KI wurde primär für Codevorschläge (Svelte-5-Runes-Syntax, MongoDB-Queries), Refactoring (Trennung Templates/Entries), CSS-Feinschliff sowie für Textentwürfe (README, UI-Texte) eingesetzt. Architekturentscheide, UX-Konzept und Designentscheide wurden von mir getroffen und der KI als Vorgaben gegeben.]_
- **Eigene Leistung (Abgrenzung):** _[z. B.: Problemraumanalyse, Konzept der Trennung Vorlage/Eintrag, UI-Konzept, Routenstruktur, Validierung, Auswertung der Tests, sämtliche inhaltlichen Entscheide.]_

### 6.2 Prompt-Vorgehen
_[Vorgehen kurz beschreiben. Beispiel: Ich habe iterativ in kleinen Schritten geprompt-et, statt einmalige „bau mir die App"-Anfragen zu stellen. Bei Code-Aufgaben gab ich den Kontext (vorhandene Dateien, gewünschte Konvention, Svelte-5-Runes statt Stores) explizit mit. Vor der Übernahme habe ich Vorschläge gelesen und teilweise angepasst. Beispiel-Prompt: „Erweitere `src/lib/server/db.js` um Funktionen zum Lesen und Schreiben des Kalorientagesziels in einer neuen Settings-Collection."]_

### 6.3 Reflexion
_[z. B.: Nutzen – KI hat Boilerplate (CSS, Form-Actions, MongoDB-Patterns) deutlich beschleunigt. Grenzen – bei Architekturentscheidungen lieferten die Vorschläge eher Optionen als die eine Antwort; entscheiden musste ich selbst. Risiken/QS – nach jedem Schritt manuelles Lesen und Browser-Test des betroffenen Bereichs. Erkenntnis: KI ist als Pair-Programmer stark, ersetzt aber weder Konzept noch Validierung.]_

## 7. Anhang

- **Quellen:** Lucide-Icons (MIT-Lizenz, in [src/lib/components/Icon.svelte](src/lib/components/Icon.svelte) als Inline-SVG nachgebaut); SvelteKit-Doku (svelte.dev); MongoDB-Node-Treiber-Doku.
- **Testskript & Materialien:** _[Link/Datei einfügen]_
- **Rohdaten/Auswertung:** _[Link/Datei einfügen]_

---

## Setup & Entwicklung

```sh
# Abhängigkeiten installieren
npm install

# .env mit MongoDB-URI anlegen
echo 'DB_URI="<mongodb-connection-string>"' > .env

# Dev-Server
npm run dev

# Production-Build + Preview
npm run build
npm run preview
```
