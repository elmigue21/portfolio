import OpenAI from "openai";

// AI providers for the chatbot, in the order they're tried: Groq's large model,
// then Gemini, then Groq's small model. Groq limits tokens per minute per model,
// so the small model still has room when the large one is busy. A provider is
// skipped if it errors, times out or rate-limits before it starts answering.
// All speak the OpenAI chat API, so one code path serves them.
//
// Models are settings, not code: if a provider retires one, change GROQ_MODEL,
// GEMINI_MODEL or GROQ_FALLBACK_MODEL. /api/health checks each still exists.

type ProviderName = "groq" | "gemini" | "groq-small";

type Provider = {
  name: ProviderName;
  model: string;
  apiKey: string | undefined;
  baseURL: string;
  // Retries on temporary errors (e.g. 503) before moving to the next provider.
  retries: number;
  // Extra request options specific to this provider's model.
  extra?: Record<string, unknown>;
};

const GROQ_URL = "https://api.groq.com/openai/v1";

const PROVIDERS: Provider[] = [
  {
    name: "groq",
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    apiKey: process.env.GROQ_API_KEY,
    baseURL: GROQ_URL,
    retries: 0,
    // gpt-oss models think before answering; keep it short for a snappy chat.
    extra: { reasoning_effort: "low" },
  },
  {
    name: "gemini",
    // Google's alias for the current Flash model, so it doesn't get retired.
    model: process.env.GEMINI_MODEL || "gemini-flash-latest",
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    retries: 1,
  },
  {
    name: "groq-small",
    model: process.env.GROQ_FALLBACK_MODEL || "openai/gpt-oss-20b",
    apiKey: process.env.GROQ_API_KEY,
    baseURL: GROQ_URL,
    retries: 0,
    extra: { reasoning_effort: "low" },
  },
];

// Fail over quickly instead of waiting on a provider that's having trouble.
const REQUEST_TIMEOUT_MS = 20_000;

const clients = new Map<ProviderName, OpenAI>();

function clientFor(p: Provider): OpenAI {
  let client = clients.get(p.name);
  if (!client) {
    client = new OpenAI({
      apiKey: p.apiKey,
      baseURL: p.baseURL,
      timeout: REQUEST_TIMEOUT_MS,
      maxRetries: p.retries,
    });
    clients.set(p.name, client);
  }
  return client;
}

// Providers that have an API key set, in fallback order.
export function configuredProviders(): Provider[] {
  return PROVIDERS.filter((p) => p.apiKey);
}

export type ChatMessage = OpenAI.Chat.ChatCompletionMessageParam;
export type ChatTool = OpenAI.Chat.ChatCompletionTool;
export type ChatChunk = OpenAI.Chat.ChatCompletionChunk;

// Longest wait for the next piece of a streaming answer before giving up on it.
const CHUNK_TIMEOUT_MS = 15_000;
const MAX_COMPLETION_TOKENS = 700;

const hasOutput = (c: ChatChunk) => {
  const d = c.choices?.[0]?.delta;
  return !!(d?.content || d?.tool_calls?.length);
};

// Streams a completion from the first provider that starts answering. A
// provider counts as working once it sends actual text or a tool call (not
// just the opening "role" chunk); if it fails before that, the next one is
// tried. A failure mid-answer can't be retried without repeating text, so it
// ends the stream. `signal` stops generation when the visitor goes away.
export async function streamCompletion(options: {
  messages: ChatMessage[];
  tools?: ChatTool[];
  toolChoice?: "auto" | "none";
  signal?: AbortSignal;
}): Promise<{ provider: ProviderName; chunks: AsyncGenerator<ChatChunk> }> {
  const providers = configuredProviders();
  if (!providers.length) throw new Error("No AI provider configured: set GROQ_API_KEY or GEMINI_API_KEY");

  const failures: unknown[] = [];
  for (const p of providers) {
    if (options.signal?.aborted) break;
    try {
      const params = {
        model: p.model,
        messages: options.messages,
        stream: true,
        temperature: 0.7,
        // Hard cap on reply length (includes the model's short reasoning):
        // a guardrail against runaway output, and it saves free-tier tokens.
        max_completion_tokens: MAX_COMPLETION_TOKENS,
        ...(options.tools ? { tools: options.tools, tool_choice: options.toolChoice ?? "auto" } : {}),
        ...p.extra,
      } as OpenAI.Chat.ChatCompletionCreateParamsStreaming;
      const stream = await clientFor(p).chat.completions.create(params, { signal: options.signal });
      const iterator = stream[Symbol.asyncIterator]();

      // Each read gets a deadline, so a provider that stalls mid-stream can't
      // leave the visitor waiting until the server times out.
      const next = async () => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        const deadline = new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            stream.controller.abort();
            reject(new Error(`${p.name} stalled for ${CHUNK_TIMEOUT_MS}ms`));
          }, CHUNK_TIMEOUT_MS);
        });
        try {
          return await Promise.race([iterator.next(), deadline]);
        } finally {
          clearTimeout(timer);
        }
      };

      // Hold back chunks until real output arrives (or the stream ends).
      const buffered: ChatChunk[] = [];
      let result = await next();
      while (!result.done && !hasOutput(result.value)) {
        buffered.push(result.value);
        result = await next();
      }
      const firstReal = result;

      async function* chunks() {
        try {
          yield* buffered;
          let r = firstReal;
          while (!r.done) {
            yield r.value;
            r = await next();
          }
        } finally {
          // Stop the provider's stream if the reader leaves early.
          stream.controller.abort();
        }
      }
      return { provider: p.name, chunks: chunks() };
    } catch (err) {
      if (options.signal?.aborted) break;
      console.error(`[chat] ${p.name} failed, trying the next provider:`, err);
      failures.push(err);
    }
  }
  throw new AggregateError(failures, "All AI providers failed");
}

export type ProviderHealth = { provider: ProviderName; model: string; ok: boolean; problem?: "unreachable" | "model" };

// Checks each configured provider is reachable and still offers its model.
// Listing models costs no tokens.
export async function checkProviders(): Promise<ProviderHealth[]> {
  return Promise.all(
    configuredProviders().map(async (p): Promise<ProviderHealth> => {
      try {
        const models = await clientFor(p).models.list();
        // Gemini lists ids as "models/<name>".
        const has = models.data.some((m) => m.id === p.model || m.id === `models/${p.model}`);
        return has ? { provider: p.name, model: p.model, ok: true } : { provider: p.name, model: p.model, ok: false, problem: "model" };
      } catch (err) {
        console.error(`[health] ${p.name} unreachable:`, err);
        return { provider: p.name, model: p.model, ok: false, problem: "unreachable" };
      }
    })
  );
}
