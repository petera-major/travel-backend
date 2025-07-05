import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();
const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());


app.get("/ping", (req, res) => {
    res.send("pong!");
  });  

app.post("/api/itinerary", async (req, res) => {
    console.log("Recieved request:", req.body);
    const { destination, links, days, notes } = req.body;
  
    if (!destination || !links || !Array.isArray(links) || links.length === 0) {
      return res.status(400).json({ error: "Missing destination or valid links." });
    }
  
    const prompt = `You're a travel assistant. Create a ${days || 1}-day travel itinerary for ${destination}.
    
  Use inspiration from these video links:\n${links.join("\n")}
  
  Also include these personal notes from the user for context:\n"${notes || "No notes provided"}"
  
  The itinerary should include morning, afternoon, and evening plans each day, including food, attractions, and experiences. Structure it clearly by day.`;
  
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You're a helpful travel assistant generating customized trip itineraries.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });
  
      const itinerary = completion.choices[0].message.content;
      res.json({ itinerary });
    } catch (err) {
      console.error("OpenAI Error:", err);
      res.status(500).json({ error: "Failed to generate itinerary." });
    }
  });  

  const PORT = process.env.PORT || 8080;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
  