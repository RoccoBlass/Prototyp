# Markt-, Konkurrenz- und Datenquellen-Analyse

> Zusätzliches Analyse-Artefakt über den Unterrichtsumfang hinaus (vgl. README Kap. 3.1 und 4).
> Ziel: Die Positionierung des Kalorientrackers im Schweizer Markt begründen und die Wahl der
> Lebensmittel-Datenquelle empirisch absichern. Stand: 2026-06-02.

## 1. Ausgangsthese

Verbreitete Kalorientracker sind entweder **überladen/werbefinanziert** oder mit **US-/international
lastigen Lebensmitteldaten** schlecht auf den Schweizer Markt ausgerichtet. Eine schlanke, werbefreie,
Schweiz-fokussierte App mit wiederverwendbaren Mahlzeiten könnte sich hier differenzieren.

## 2. Konkurrenzüberblick

| App | Stärken | Schwächen (v. a. CH-Sicht) |
| --- | --- | --- |
| **MyFitnessPal** | Riesige Lebensmittel-Datenbank, etabliert | Werbung, viele Funktionen → überladen; Datenbank crowd-getrieben, US-lastig; Kernfunktionen zunehmend hinter Paywall |
| **YAZIO** | Aufgeräumtes UI, DE-Markt | Premium-Druck; Fokus auf Pläne/Programme statt schnelles Loggen |
| **FatSecret** | Solide Datenbank, kostenlos | UI altbacken; weniger CH-spezifisch |
| **Lifesum** | Sehr gutes Design | Stark monetarisiert; Datenbankqualität schwankt |
| **Cronometer** | Sehr genaue Mikronährstoffe | Für Alltags-Tracking zu detailliert/komplex |

**Lücke / Positionierung:** *schlank, werbefrei, schnelles Loggen über wiederverwendbare Mahlzeiten,
und bewusst auf Schweizer Produkte ausgerichtet* (deutschsprachig, CH-Produkte im Such-Ranking bevorzugt).

## 3. Datenquellen-Analyse (Lebensmittel)

Kernfrage: Deckt die angebundene Quelle **Schweizer Produkte** ausreichend ab, oder gibt es Bessere?

### 3.1 Empirische Prüfung von Open Food Facts (OFF)

Direkte Abfragen gegen die OFF-API (search-a-licious, wie in der App):

- **~103'600** Produkte mit Verkaufsland Schweiz.
- Eigenmarken: **Migros ~9'200**, **Lidl ~18'800**, **Denner ~1'500**, **M-Budget ~770**, **Coop Prix Garantie ~370**.
- **Alle** getesteten typisch Schweizer Produkte wurden mit verwertbaren Nährwerten gefunden:
  Rivella, Aromat, Ovomaltine, Zweifel, Cenovis, Le Parfait, Ricola, Caotina, Le Gruyère, Appenzeller,
  Cervelat, Kägi fret, Thomy, Birchermüesli (Migros). Vieles ist explizit als CH-Produkt getaggt.
- Schwäche: crowd-sourced → Datenqualität schwankt (in den Trefferlisten je ~10–19 von 20 mit
  vollständigen Nährwerten); **generische/unverpackte** Lebensmittel weniger einheitlich als Markenartikel.

### 3.2 Alternativen

| Quelle | CH-Eignung | Bewertung |
| --- | --- | --- |
| **Open Food Facts** (gewählt) | ✅ stark bei Markenprodukten, gratis, kein API-Key | beibehalten |
| **BLV-Nährwertdatenbank** (naehrwertdaten.ch) | ✅✅ offiziell, beste Qualität – aber **nur generische** Lebensmittel, kein Live-API | ideale Ergänzung |
| **FoodRepo** (foodrepo.org) | ✅ Schweiz-spezifisch, offenes API | kleiner, weniger gepflegt als OFF |
| FatSecret / Nutritionix / Edamam | ⚠️ | kommerziell, API-Key/OAuth, nicht besser für CH |

### 3.3 Schlussfolgerung

Open Food Facts ist für **Schweizer Markenprodukte** die beste frei verfügbare Quelle und stützt die
Positionierung. Die einzige relevante Lücke (generische Grundnahrungsmittel) liesse sich später mit der
offiziellen **BLV-Nährwertdatenbank** als zweiter Quelle schliessen. Ein Wechsel weg von OFF ist nicht
sinnvoll.

## 4. Methodik & Quellen

- Vorgehen: Direkte API-Abfragen (Trefferzahlen, CH-Tagging, Nährwert-Vollständigkeit) statt Schätzung.
- Open Food Facts (ODbL), `search.openfoodfacts.org` / `world.openfoodfacts.org/api/v2`.
- BLV-Nährwertdatenbank: naehrwertdaten.ch (Bundesamt für Lebensmittelsicherheit und Veterinärwesen).
