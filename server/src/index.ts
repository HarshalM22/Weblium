require("dotenv").config();
import express from "express";
import { InferenceClient } from "@huggingface/inference";
import { BASE_PROMPT, getSystemPrompt } from "./prompt/prompt";
import { reactBasePrompt } from "./defaults/react";
import { nodeBasePrompt } from "./defaults/node";
import cors from "cors";

if (!process.env.HF_TOKEN) {
  console.error("HF_TOKEN not found in environment variables.");
  process.exit(1);
}

const client = new InferenceClient(process.env.HF_TOKEN);
const app = express();
app.use(cors());
app.use(express.json());

app.post("/template", async (req, res) => {
  const prompt = req.body.prompt;

  const response = await client.chatCompletion({
    model: "meta-llama/Llama-3.1-8B-Instruct",
    messages: [
      {
        role: "system",
        content:
          "Retrun either node or react based on what do you think this project should be . only return a single word either 'node or 'react' . Do not return anything else",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 1,
    temperature: 0,
  });

  const answer = response.choices[0].message.content;
  console.log(answer);

  if (answer == "react" || answer == "React") {
    res.json({
      basePrompt: [
        BASE_PROMPT,
        ` Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n - package-lock.json\n`,
      ],
      uiPrompt: [reactBasePrompt],
    });
    return;
  }
  if (answer == "node" || answer == "Node") {
    res.json({
      basePrompt: [
        ` Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n - package-lock.json\n `,
      ],
      uiPrompt: [nodeBasePrompt],
    });
    return;
  }
  res.status(403).json({ message: "You cant access this" });
  return;
});

app.post("/chat", async (req, res) => {
  const messages = req.body.messages;
  const response = await client.chatCompletionStream({
    model: "meta-llama/Llama-3.1-8B-Instruct",
    messages: [{ role: "system", content: getSystemPrompt() }, ...messages],
    max_tokens: 8000,
    stream: true,
  });
  let responseText = "";
  for await (const chunk of response) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) {
      process.stdout.write(delta);
      responseText += delta;
    }
  }

  

  res.json({
    response: responseText ,
  });
});

app.listen(3000);
