import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;;

  app.use(express.json());

  // API Route for GenAI Risk Screening
  app.post("/api/assess", async (req, res) => {
    try {
      const { description, businessFunction } = req.body;

      if (!description || !description.trim()) {
        return res.status(400).json({ error: "Use case description is required." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not configured in the server's environment. Please open Settings > Secrets to configure your Gemini API Key." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
Audit & Screen the following proposed generative AI use case:

Business Function: ${businessFunction || "Other"}
Use Case Description:
${description}

Provide a structured risk assessment of this AI deployment.
Guidelines for assessment:
- Keep the tone highly professional, objective, advisory, and tailored for a compliance auditor.
- Do not give legal advice. Ensure recommendations are formulated as standards, risks, or compliance indicators.
- Select the overall risk rating ('Low', 'Medium', or 'High') based on complexity, exposure, decision capacity, and critical risks (such as processed PII, client impact, code execution, financial advisory, etc.).
- Elaborate concrete suggested controls and human review follow-up questions.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional AI compliance auditor. You produce strict, objective, educational assessments for genAI use cases under modern emerging guardrails (like the EU AI Act, NIST AI RMF, etc.). Avoid styling, markdown jargon, or flowery speech inside the fields, keeping descriptions concise and actionable.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: "Executive use case summary. Concise, professional, and clear."
              },
              dataCategories: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Core data categories processed (e.g. customer PII, corporate IP, billing, logs)."
              },
              riskFlags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "High-priority compliance, operational, and organizational risk flags."
              },
              suggestedControls: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Specific, actionable compliance controls and operational guardrails to enforce."
              },
              humanReviewQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Specific operational or engineering questions to review with the technical team."
              },
              overallRiskRating: {
                type: Type.STRING,
                description: "One of: 'Low', 'Medium', or 'High'."
              },
              ratingExplanation: {
                type: Type.STRING,
                description: "Objective justification for the selected risk rating."
              }
            },
            required: [
              "summary",
              "dataCategories",
              "riskFlags",
              "suggestedControls",
              "humanReviewQuestions",
              "overallRiskRating",
              "ratingExplanation"
            ]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response received from the AI model.");
      }

      const assessment = JSON.parse(text);
      return res.json(assessment);

    } catch (err: any) {
      console.error("AI screening error:", err);
      return res.status(500).json({ error: err.message || "An unexpected error occurred during compliance generation." });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Compliance server listening on port ${PORT}`);
  });
}

startServer();
