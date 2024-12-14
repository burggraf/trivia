import { sveltekit } from '@sveltejs/kit/vite';
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);

export default defineConfig(({ mode }) => {
	// Load env file based on `mode` in the current working directory.
	// Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
	const env = loadEnv(mode, process.cwd(), '');

	return {
		plugins: [sveltekit()],
		define: {
			__DATE__: `'${new Date().toISOString()}'`,
			'__APP_VERSION__': JSON.stringify(pkg.version),
			'__APP_NAME__': JSON.stringify(pkg.name),
			'__APP_TITLE__': JSON.stringify(pkg.title),
			'__APP_HOMEPAGE__': JSON.stringify(pkg.homepage),
			'__APP_DESCRIPTION__': JSON.stringify(pkg.description),
			'__APP_MENU_TITLE__': JSON.stringify(pkg.menu_title),
			'__APP_MENU_SUBTITLE__': JSON.stringify(pkg.menu_subtitle),
			'__APP_PROFILE_TABLE__': JSON.stringify(pkg.profileTable),
			'__APP_PROFILE_KEY__': JSON.stringify(pkg.profileKey),
			'__APP_THEME_COLOR__': JSON.stringify(pkg.theme_color),
			'__APP_BACKGROUND_COLOR__': JSON.stringify(pkg.background_color),
			'__APP_IDENTIFIER__': JSON.stringify(pkg.identifier),
			'__SUPABASE_URL_ENCRYPTED__': JSON.stringify(env.SUPABASE_URL_ENCRYPTED),
			'__SUPABASE_URL_ENCRYPTION_KEY__': JSON.stringify(env.SUPABASE_URL_ENCRYPTION_KEY),
			'__SUPABASE_ANON_KEY_ENCRYPTED__': JSON.stringify(env.SUPABASE_ANON_KEY_ENCRYPTED),
			'__SUPABASE_ANON_KEY_ENCRYPTION_KEY__': JSON.stringify(env.SUPABASE_ANON_KEY_ENCRYPTION_KEY),
		}
	}
});
