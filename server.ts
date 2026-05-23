import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit to handle high-resolution canvas base64 image data
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(customKey?: string): GoogleGenAI {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY environment variable is missing. Please enter your personal Google AI Studio API key in the 'Settings' tab on the bottom left."
    );
  }
  // Create a new instance dynamically if a custom key is provided, or reuse standard instance
  if (customKey) {
    return new GoogleGenAI({
      apiKey: customKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// REST API for Mathematical Verification and Generation
app.post("/api/solve", async (req, res) => {
  try {
    const { text, image, mode, settings, customApiKey } = req.body;
    const ai = getGeminiClient(customApiKey);

    let contents: any[] = [];
    let prompt = `You are an elite, highly adaptive Mathematical Engine and Expert Calculator. Your job is to process mathematical inputs—which may include units, standard LaTeX equations (e.g., \\frac{a^2 + b^2}{c^2}), handwritten inputs, or word problems—and return incredibly accurate, step-by-step solutions under standard JSON formatting.

Input Mode: ${mode || "text"}
User custom settings:
- Decimals focus: ${settings?.decimalPlaces || "auto"}
- Complex number form preference: ${settings?.complexMode || "Cartesian (a + bi)"}
- Symbolic computation priority: ${settings?.symbolicMode ? "Yes (keep radicals, fractions, pi intact where possible)" : "No"}
- Explanation Verbosity: ${settings?.verbosity || "standard"} (Options: 'concise', 'standard', 'detailed'. Tailor the steps count and text explanation detail accordingly)

SPECIAL INSTRUCTIONS:
1. Unit Conversion Support:
   - Identify common physical, computational, or thermodynamic units in the query (e.g., meters, feet, inches, kilometers, miles, seconds, minutes, hours, kilograms, pounds, Celsius, Fahrenheit, Kelvin, etc.).
   - Perform accurate, precise conversion steps showing conversion factors.
   - Categorize unit conversion problems as "Unit Conversion".

2. Robust LaTeX Parsing:
   - Accurately parse LaTeX input queries (e.g., equations containing fractions like \\frac{a^2 + b^2}{c^2}, integrals like \\int_{a}^{b} x^2, brackets, symbols, etc.).
   - Keep LaTeX notations clean, valid, and double-escaped in the JSON keys.

3. Verbosity Adaptability ('concise', 'standard', 'detailed'):
   - 'concise': Reduce steps to 1 or 2 core stages. Focus only on the direct calculation or immediate formula resolution.
   - 'standard': Balanced step-by-step derivation (usually 3 to 5 steps). Good for standard mathematical pedagogy details.
   - 'detailed': Provide fully expanded steps (usually 5 or more steps), explain every intermediate operation (e.g. algebraic substitution, common denominator search, unit conversion factors, rules of calculus), and offer deeper academic insights.

Your output must be structured strictly as a standard JSON object containing exactly the following keys (ensure all LaTeX is double-escaped for JSON compatibility):
{
  "detectedInput": "clean LaTeX description of parsed equation, units, or question containing double backslashes",
  "coreAnswer": "highly prominent final answer. Wrap math details inside LaTeX standard $...$. E.g., '$x = 5$'",
  "category": "Math category (e.g., Algebra, Calculus, Linear Algebra, Complex Numbers, Geometry, Arithmetic, Trigonometry, Statistics, Vector Calculus, Unit Conversion)",
  "steps": [
    {
      "explanation": "Clear, educational explanation of what is being done in this step matching the requested verbosity.",
      "math": "LaTeX visual statement representing this step with double backslashes for commands. E.g., 'f(x) = \\\\int_{0}^{2} 3x^2 \\\\, dx'"
    }
  ],
  "alternativeForms": [
    {
      "label": "Brief label (e.g. 'Decimal Value', 'Exact Radical Form', 'Polar Representation', 'Alternative Units')",
      "value": "Value, also wrapped or structured mathematically in LaTeX if necessary"
    }
  ],
  "graphData": {
    "isPlottable": true,
    "title": "Clean f(x) title style",
    "points": [
      {"x": -5, "y": 25},
      {"x": -4, "y": 16}
    ]
  }
}

Guidelines for graphData:
- Set isPlottable to true Only if the parsed mathematical expression defines, represents, or evaluates to a 2D function/curve of interest in terms of x (e.g., f(x) = sin(x), x^2 + 2x, y = 5x - 3).
- Provide between 20 to 45 data points inside 'points' ranging over an interesting visual range (usually x from -10 to 10, or adjusted for logarithmic/trig functions) so it can be graphed beautifully in a line chart.
- If not a function, leave graphData as null or empty, or set "isPlottable": false.

Please execute with mathematical perfection. Return ONLY raw JSON, do not wrap in markdown tags or backticks.`;

    if (mode === "canvas" && image) {
      // Clean base64 header if present
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      
      contents.push({
        inlineData: {
          mimeType: "image/png",
          data: base64Data,
        },
      });

      prompt += `\n\nAnalyze the handwritten canvas/drawing content in the attached image context. Parse the drawn digits and math expressions carefully. If the image is partially drawing and partially text, integrate both. Proceed to solve the parsed formulation fully.`;
    } else {
      contents.push({
        text: text || "1 + 1",
      });
      prompt += `\n\nAnalyze and solve the typed text expression: "${text || "1 + 1"}"`;
    }

    contents.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: contents },
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    res.json(JSON.parse(responseText));
  } catch (error: any) {
    console.error("Math Engine service error:", error);
    res.status(500).json({
      error: error.message || "An unexpected error occurred in the math engine service.",
      isSecretIssue: error.message?.includes("GEMINI_API_KEY"),
    });
  }
});

async function startServer() {
  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Math Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
