require("dotenv").config();
import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import cors from "cors";

const anthropic = new Anthropic();
const app = express();
app.use(cors());
app.use(express.json());

// --------------------- TEMPLATE ENDPOINT ---------------------
app.post("/template", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await anthropic.messages.create({
      messages: [{ role: "user", content: prompt }],
      model: "claude-3-haiku-20240307",
      max_tokens: 200,
      system:
        "Return either node or react based on what you think this project should be. Only return a single word: 'node' or 'react'. Do not return anything extra.",
    });

    const answerBlock = response.content[0];
    const answer =
      answerBlock.type === "text" ? answerBlock.text.trim().toLowerCase() : "";

    if (answer === "react") {
      res.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [reactBasePrompt],
      });
      return;
    }

    if (answer === "node") {
      res.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [nodeBasePrompt],
      });
      return;
    }

    res.status(400).json({ message: "Invalid model response", raw: answer });
  } catch (err) {
    console.error("Error in /template:", err);
    res.status(500).json({ error: "Template selection failed" });
  }
});

// --------------------- CHAT ENDPOINT ---------------------
app.post("/chat", async (req, res) => {
  try {
    const messages = req.body.messages;

    // Start streaming response
    const stream = await anthropic.messages.stream({
      messages,
      model: "claude-3-haiku-20240307",
      max_tokens: 4096,
      system: getSystemPrompt(),
    });

    // Log each chunk as it's received
    stream.on("text", (text: string) => {
      process.stdout.write(text); // no newline, logs as a continuous stream
    });

    stream.on("end", () => {
      console.log("\n--- Stream Ended ---");
      res.json({ message: "Stream finished, check server console for output." ,
        response : stream 
       });
    });

    stream.on("error", (err: any) => {
      console.error("Streaming error:", err);
      res.status(500).json({ error: "Streaming failed." });
    });

  } catch (err) {
    console.error("Error in /chat:", err);
    res.status(500).json({ error: "Chat completion failed" });
  }
});


app.listen(3000, () => console.log("Server running on port 3000"));
