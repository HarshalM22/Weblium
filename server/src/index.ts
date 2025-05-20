require("dotenv").config();

import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN);

async function main() {
  const out = await client.chatCompletion({
    model: "meta-llama/Llama-3.1-8B-Instruct",
    max_tokens: 512, 
    temperature: 0,  //randomness and exploration for reliable results
    messages: [{
      role:"user",
      content:"write a code for a simple TODO app"
    }],
  });
  console.log(out.choices[0].message.content);
}

main();
