import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Travel backend is live!");
});

app.post("/api/itinerary", async (req, res) => {
  const { destination, links = [], days = 1, notes = "" } = req.body;

  if (!destination || !Array.isArray(links) || links.length === 0) {
    return res.status(400).json({ error: "Missing destination or video links." });
  }

  const prompt = `You're a travel assistant. Create a ${days}-day travel itinerary for ${destination}.
Use inspiration from these videos:\n${links.join("\n")}
Include these notes: "${notes}"
Each day should have morning, afternoon, and evening plans with food, activities, and notable places.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You're a helpful travel planner." },
        { role: "user", content: prompt }
      ]
    });

    const itinerary = completion.choices[0].message.content;
    res.json({ itinerary });
  } catch (err) {
    console.error("OpenAI Error:", err?.response?.data || err.message || err);
    res.status(500).json({ error: "Failed to generate itinerary." });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
