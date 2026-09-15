import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[SignalScope] Supabase env vars missing. ' +
    'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in .env'
  );
}

// Use createBrowserClient from @supabase/ssr for proper session management
export const supabase = createBrowserClient(
  supabaseUrl ?? '',
  supabaseKey ?? ''
);

export type SupabaseUser = Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'];

/** Returns the currently authenticated user, or null. */
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/** Returns the current session's user_id, or null. */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}
