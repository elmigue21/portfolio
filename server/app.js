import express from "express";
// import fetch from "node-fetch"; // If your environment doesn't have fetch globally
import { aiClient } from "./ai/groq.js";
import {techStacks , projects, orgs, jobs} from '../constants/constants.js'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
const app = express();
const port = 8000;
dotenv.config({ path: "../.env" });

console.log('ENVIRONMENT: ', process.env.NODE_ENV)
const environment = process.env.NODE_ENV;
app.use(
  cors({
    origin:
      environment == "production"
        ? process.env.CORS_ORIGIN_PROD
        : process.env.CORS_ORIGIN_DEV, // or your deployed frontend URL
  })
);

app.use(express.json());

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter)

function jsonToText(obj, indent = 0) {
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


// const prompt = "what are your projects?";


app.post("/ask", async (req, res) => {
  try {
    const {prompt} = req.body; 
    console.log('PROMPT:', prompt)

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await aiClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature:0.7,
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that answers questions only using the provided personal information.",
        },
        {
          role:'system',
          content:'My name is Miguel John Caacbay and I am from the Philippines',
        },
        {
          role:'system',
          content:'You are an AI chatbot built into this portfolio to showcase my skills and experiences',
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
        {role:'system',
          content:'Jobs:' + jsonToText([jobs])
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
          role:'system',
          content:'Act as if you are Miguel'
        },
        {
          role: "user",
          content: prompt,
        },
        {
          role:'system',
          content:'Do not answer if the question is not related to me'
        }
      ],
    });
    // Loop over streamed events
    for await (const chunk of stream) {
      
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        res.write(content); // flush each token/chunk
      }
    }

    res.end();
    // res.json({
    //   answer: response.choices?.[0]?.message?.content || "No response",
    // });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Gemini request failed" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
