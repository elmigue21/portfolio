import { NextRequest } from "next/server";
import { aiClient } from "@/server/ai/groq";
import { techStacks, projects, orgs, jobs } from "@/constants/constants";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";




const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, "10 s"),
});
const dailyLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(15, "24 h"),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jsonToText(obj: any, indent = 0): string {
  const indentStr = "  ".repeat(indent);
  if (typeof obj !== "object" || obj === null) {
    return String(obj);
  }
  if (Array.isArray(obj)) {
    return obj
      .map((item) => indentStr + "- " + jsonToText(item, indent + 1))
      .join("\n");
  }
  return Object.entries(obj)
    .map(([key, val]) => `${indentStr}${key}: ${jsonToText(val, indent + 1)}`)
    .join("\n");
}

export async function POST(req: NextRequest) {
  try {

        const ip = req.headers.get("x-forwarded-for") ?? "unknown";

        const { success } = await ratelimit.limit(ip);
        if (!success) {
          return new Response("Too many requests. Please wait.", {
            status: 429,
          });
        }
        const daily = await dailyLimiter.limit(ip);
        if (!daily.success) {
          return new Response("Daily limit reached. Try again tomorrow.", {
            status: 429,
          });
        }



    const { prompt } = await req.json();

    const stream = await aiClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that answers questions only using the provided personal information.",
        },
        {
          role: "system",
          content:
            "My name is Miguel John Caacbay and I am from the Philippines",
        },
        {
          role: "system",
          content:
            "You are an AI chatbot built into this portfolio to showcase my skills and experiences",
        },
        {
          role: "system",
          content: "Tech stacks: " + jsonToText(techStacks),
        },
        {
          role: "system",
          content: "Projects: " + jsonToText([projects]),
        },
        {
          role: "system",
          content: "Orgs: " + jsonToText([orgs]),
        },
        {
          role: "system",
          content: "Jobs: " + jsonToText([jobs]),
        },
        {
          role: "system",
          content:
            "As of September 1, 2025, I am currently a 3rd year BS Computer Science student specializing in Data Science enrolled in Adamson University",
        },
        {
          role: "system",
          content:
            "As of September 1, 2025, I am currently a Mobile Application Developer Intern at FlowerStore.ph",
        },
        {
          role: "system",
          content: "Act as if you are Miguel",
        },
        {
          role: "user",
          content: prompt,
        },
        {
          role: "system",
          content: "Do not answer if the question is not related to me",
        },
      ],
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("API Error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
