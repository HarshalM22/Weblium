require("dotenv").config();

import { InferenceClient } from "@huggingface/inference";
import { getSystemPrompt } from "./prompt/prompt";

if (!process.env.HF_TOKEN) {
  console.error("❌ HF_TOKEN not found in environment variables.");
  process.exit(1);
}

const client = new InferenceClient(process.env.HF_TOKEN);

async function main() {
  try {
    const out = await client.chatCompletionStream({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        {
          role: "user",
          content: "For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n\nUse stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.\n\n",
        },
        {
          role:"user",
          content: "create a todo app"
        }
      ],
      system:getSystemPrompt(),
      max_tokens: 8000,
      stream: true,
    });
    console.log("💬 Assistant:");

    for await (const chunk of out) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        process.stdout.write(delta);
      }
    }
    console.log("\n✅ Done.");
  } catch (error) {
    console.error("❌ Error streaming response:", error);
  }
}

main();
