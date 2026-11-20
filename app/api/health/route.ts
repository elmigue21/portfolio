import { checkProviders } from "@/lib/llm";

// Health check for an uptime monitor.
//   200 "ok"        every configured AI provider works
//   503 "degraded"  one is down; the chatbot still answers using the other
//   503 "down"      none work; the chatbot is broken
// A degraded state still returns 503 so the monitor emails you about the
// failing provider before the backup runs out too.
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  const providers = await checkProviders();
  const working = providers.filter((p) => p.ok).length;
  const status = providers.length && working === providers.length ? "ok" : working > 0 ? "degraded" : "down";
  return Response.json(
    { status, providers },
    { status: status === "ok" ? 200 : 503, headers: noStore }
  );
}
