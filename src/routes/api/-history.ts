// This API route is no longer used.
// History is now stored in and fetched from Supabase directly via the browser client.
// Kept as an empty stub to prevent TanStack Router from warning about missing exports.

// @ts-ignore
import { createAPIFileRoute } from '@tanstack/react-start/api';

export const APIRoute = createAPIFileRoute('/api/history')({
  GET: async () => {
    return new Response(JSON.stringify({ message: 'Use Supabase client directly' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
});
