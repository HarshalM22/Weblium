require("dotenv").config();
import express from "express";
import { InferenceClient } from "@huggingface/inference";
import { BASE_PROMPT, getSystemPrompt } from "./prompt/prompt";
import { reactBasePrompt } from "./defaults/react";
import { nodeBasePrompt } from "./defaults/node";

if (!process.env.HF_TOKEN) {
  console.error("HF_TOKEN not found in environment variables.");
  process.exit(1);
}

const client = new InferenceClient(process.env.HF_TOKEN);
const app = express();
app.use(express.json());

app.post("/template", async (req, res) => {
  const prompt = req.body.prompt;

  const response = await client.chatCompletion({
    model: "meta-llama/Llama-3.1-8B-Instruct",
    messages: [
      {
        role: "user",
        content: `Retrun either node or react based on what do you think this project should be , only return a single word either 'node or 'react' , Do not return anything extra`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 200,
    temperature: 0,
  });

  const answer = response.choices[0].message.content;

  if (answer == "react") {
    res.json({
      prompt: [BASE_PROMPT, ` Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n - package-lock.json\n`],
      uiPrompt : [reactBasePrompt]
    });
    return;
  }
  if (answer == "node") {
    res.json({
      prompt: [` Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n - package-lock.json\n `],
      uiPrompt : [nodeBasePrompt]
    });
    return;
  }
  res.status(403).json({ message: "You cant access this" });
  return;
});

app.listen(3000);

// async function main() {
//   try {
//     const out = await client.chatCompletionStream({
//       model: "meta-llama/Llama-3.1-8B-Instruct",
//       messages: [
//         {
//           role: "user",
//           content: "For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n\nUse stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.\n\n",
//         },
//         {
//           role: "user",
//           content: `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
//         },
//         {
//           role: "user",
//           content: "Here"
//         }

//       ],
//       system: getSystemPrompt(),
//       max_tokens: 8000,
//       stream: true,
//     });
//     console.log("💬 Assistant:");

//     for await (const chunk of out) {
//       const delta = chunk.choices?.[0]?.delta?.content;
//       if (delta) {
//         process.stdout.write(delta);
//       }
//     }
//     console.log("\n✅ Done.");
//   } catch (error) {
//     console.error("❌ Error streaming response:", error);
//   }
// }

// main();
