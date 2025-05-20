require("dotenv").config();

import { InferenceClient } from "@huggingface/inference";

if (!process.env.HF_TOKEN) {
  console.error("❌ HF_TOKEN not found in environment variables.");
  process.exit(1);
}

const client = new InferenceClient(process.env.HF_TOKEN);

async function main() {
  try {
    const out = await client.chatCompletionStream({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      max_tokens: 1024,
      temperature: 0, //randomness and exploration for reliable results
      messages: [
        {
          role: "user",
          content: "what is the capital of india? ",
        },
      ],
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
