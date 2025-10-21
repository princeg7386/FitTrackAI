import { createClient } from '@supabase/supabase-js';

// Prefer loading keys from Vite environment variables.
// For client-side usage use a public/anonymous key (prefixed with VITE_ or VITE_PUBLIC_).
// In development create a `.env` file in the project root with these values.
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://xyz.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string) || (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'your_anon_key_here';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Dev-time warning if placeholders are still present to help developers configure environment
if (typeof window !== 'undefined') {
	const isPlaceholder = supabaseUrl.includes('xyz.supabase.co') || supabaseAnonKey === 'your_anon_key_here';
	if (isPlaceholder) {
		// eslint-disable-next-line no-console
		console.warn('[supabase] Placeholder Supabase URL or anon key detected. Copy `.env.example` to `.env` and set VITE_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY for local development.');
	}
}
