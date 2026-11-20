import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", assistant: "Jhoel" });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: "Falta configurar GROQ_API_KEY en el archivo .env"
      });
    }

    const { messages } = req.body ?? {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Debes enviar al menos un mensaje." });
    }

    const safeMessages = messages
      .filter(message =>
        message &&
        ["user", "assistant"].includes(message.role) &&
        typeof message.content === "string"
      )
      .slice(-20)
      .map(message => ({
        role: message.role,
        content: message.content.slice(0, 6000)
      }));

    if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
      return res.status(400).json({ error: "El último mensaje debe ser del usuario." });
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content: "Eres Jhoel, una asistente virtual amable, cercana, inteligente y respetuosa. Hablas español latinoamericano, preferentemente peruano. Respondes de forma natural, clara y útil. Puedes conversar sobre distintos temas. No afirmes que realizaste acciones que no has ejecutado."
          },
          ...safeMessages
        ],
        temperature: 0.7,
        max_completion_tokens: 1000
      })
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error("Groq API error:", data);
      return res.status(groqResponse.status).json({
        error: data.error?.message || "Error al consultar el modelo de IA."
      });
    }

    const reply = data.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return res.status(502).json({ error: "La IA no devolvió una respuesta." });
    }

    return res.json({ reply: reply.trim() });
  } catch (error) {
    console.error("Error del servidor:", error);
    return res.status(500).json({ error: "No se pudo conectar con el servicio de IA." });
  }
});

app.listen(PORT, () => {
  console.log(`Jhoel backend activo en http://localhost:${PORT}`);
});
