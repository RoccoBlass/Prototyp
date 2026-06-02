import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// mongodb hat zirkuläre CommonJS-Abhängigkeiten. Ohne strictRequires
		// bricht das gebündelte read_preference.js auf Cloudflares Workers-
		// Runtime ("ReadPreference is not a constructor"), weil ein static
		// initializer vor der Klassendefinition läuft. strictRequires erzwingt
		// geordnetes, lazy CommonJS-Wrapping und behebt das.
		commonjsOptions: {
			strictRequires: true
		}
	}
});
