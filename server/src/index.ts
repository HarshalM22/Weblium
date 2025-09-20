require("dotenv").config();
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { BASE_PROMPT, getSystemPrompt } from "./prompt/prompt";
import { reactBasePrompt } from "./defaults/react";
import { nodeBasePrompt } from "./defaults/node";

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY not found in environment variables.");
  process.exit(1);
}

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Decide whether project is "node" or "react"
 */
app.post("/template", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // You can also use "gpt-4.1-mini" or "gpt-4o"
      messages: [
        {
          role: "system",
          content:
            "Return either node or react based on what you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything else.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 1,
      temperature: 0,
    });

    const answer = response.choices[0].message?.content?.trim().toLowerCase();
    console.log("Template answer:", answer);

    if (answer === "react") {
      res.json({
        basePrompt: [
          BASE_PROMPT,
          ` Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n - package-lock.json\n`,
        ],
        uiPrompt: [reactBasePrompt],
      });
      return;
    }

    if (answer === "node") {
      res.json({
        basePrompt: [
          ` Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n - package-lock.json\n `,
        ],
        uiPrompt: [nodeBasePrompt],
      });
      return;
    }

    res.status(403).json({ message: "You can’t access this" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Template endpoint failed" });
  }
});

/**
 * Chat completion endpoint
 */
app.post("/chat", async (req, res) => {
  try {
    const messages = req.body.messages;

    // Collect streamed response into full text
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: getSystemPrompt() }, ...messages],
      max_tokens: 2000,
      stream: true,
    });

    let responseText = "";
    for await (const chunk of response) {
      const delta = chunk.choices[0]?.delta?.content || "";
      if (delta) {
        process.stdout.write(delta);
        responseText += delta;
      }
    }

    res.json({ response: responseText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Chat endpoint failed" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
