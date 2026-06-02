import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// Cloudflares Linux-Build mangelt mit esbuild-Minify die zirkulären
		// CommonJS-Klassen von mongodb ("ReadPreference is not a constructor").
		// Minify aus + strictRequires = stabiles, deterministisches Bundle.
		minify: false,
		commonjsOptions: {
			strictRequires: true
		}
	}
});
