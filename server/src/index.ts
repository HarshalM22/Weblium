require("dotenv").config();
import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { PrismaClient } from '@prisma/client'; 
import { z } from "zod";
import { auth } from "./middleware";
const JWT_SECRET = process.env.JWT_SECRET || "ggwntafk";

export const SignUpSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
});

export const LoginSchema = z.object({
  password: z.string().min(6),
  email: z.string().email({ message: "Invalid email format" }),

});

const prisma = new PrismaClient() ;

const anthropic = new Anthropic();
const app = express();
app.use(cors());
app.use(express.json());

app.post("/template",auth, async (req, res) => {
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

app.post("/chat",auth, async (req, res) => {
  try {
    const messages = req.body.messages;

    const stream = await anthropic.messages.stream({
      messages,
      model: "claude-3-haiku-20240307", //claude-3-7-sonnet-20250219
      max_tokens: 4096,
      system: getSystemPrompt(),
    });

    stream.on("text", (text: string) => {
      process.stdout.write(text); 
    });

    stream.on("end", () => {
      console.log("\n--- Stream Ended ---");
      res.json({ message: "Stream finished, check server console for output." ,
        response : stream 
       });
       return;
    });

    stream.on("error", (err: any) => {
      console.error("Streaming error:", err);
    });

  } catch (err) {
    console.error("Error in /chat:", err);
    res.status(500).json({ error: "Chat completion failed" });
  }
});



app.post("/api/v1/signup", async function (req, res) {
  const parseResult = SignUpSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      error: parseResult.error.format(),
    });
  }

  const { email, password, username } = parseResult.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 4);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    res.status(200).json({ message: "User has been signed up." });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Error while signing up" });
  }
});


app.post("/api/v1/login", async function (req, res) {
  const parseResult = LoginSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      error: parseResult.error.format(),
    });
  }

  const { email, password } = parseResult.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email }, 
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.status(200).json({ token });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
});



app.listen(3000, () => console.log("Server running on port 3000"));
