import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Next.js 15+ defaults the client Router Cache staleTime to 0 for
    // dynamic routes (every navigation always refetches from the server).
    // Our routes (dashboard/transactions/budget) are all dynamic (cookie-based
    // auth), so without this every single tab switch re-hits Supabase.
    // A short staleTime lets recently-visited pages pop back instantly from
    // the client cache, while still refreshing automatically after a
    // mutation (Server Actions call revalidatePath, which bypasses this).
    staleTimes: {
      dynamic: 30,
    },
  },
};

export default nextConfig;
