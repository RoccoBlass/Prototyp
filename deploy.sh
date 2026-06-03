#!/usr/bin/env bash
#
# Manuelles Deploy zu Cloudflare Pages.
#
# Warum manuell? Cloudflares eigener Linux-Build zerlegt den zirkulaeren
# CommonJS-Code des mongodb-Treibers ("ReadPreference is not a constructor").
# Lokal gebaut laeuft alles einwandfrei, darum bauen wir hier lokal und laden
# das fertige Bundle hoch. Das Projekt wird automatisch am aktuellen Branch
# erkannt.
#
# Voraussetzung: einmalig `npx wrangler login` ODER `export CLOUDFLARE_API_TOKEN=...`
#
# Nutzung:  ./deploy.sh

set -euo pipefail

# In den App-Ordner wechseln (liegt neben diesem Skript).
cd "$(dirname "$0")/kalorientracker"

# Cloudflare-Zugangsdaten aus der (gitignorierten) .env laden, falls vorhanden
# und noch nicht in der Umgebung gesetzt. So braucht es keinen wrangler-Login.
if [ -f .env ]; then
	[ -z "${CLOUDFLARE_API_TOKEN:-}" ] && CLOUDFLARE_API_TOKEN="$(grep -E '^CLOUDFLARE_API_TOKEN=' .env | head -1 | cut -d= -f2- | tr -d '"')"
	[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ] && CLOUDFLARE_ACCOUNT_ID="$(grep -E '^CLOUDFLARE_ACCOUNT_ID=' .env | head -1 | cut -d= -f2- | tr -d '"')"
	export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
case "$BRANCH" in
	main)       PROJECT="kalorientracker-main" ;;
	prototyp-1) PROJECT="kalorientracker-prototyp" ;;
	*)
		echo "✗ Unbekannter Branch '$BRANCH' — erwartet 'main' oder 'prototyp-1'." >&2
		exit 1
		;;
esac

echo "▶ Branch '$BRANCH'  →  Projekt '$PROJECT'"

echo "▶ Baue lokal …"
npm run build

echo "▶ Lade zu Cloudflare Pages hoch …"
npx wrangler pages deploy .svelte-kit/cloudflare \
	--project-name "$PROJECT" \
	--branch "$BRANCH"

echo "✓ Fertig — live unter https://$PROJECT.pages.dev"
