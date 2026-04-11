import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from Vite build
app.use(express.static(join(__dirname, "dist")));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// --- Tool definitions for Claude ---
const tools = [
  {
    name: "get_weather",
    description:
      "Get the current weather for a given city. Returns temperature, conditions, humidity and wind speed.",
    input_schema: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "The city name, e.g. 'Rome' or 'New York'",
        },
      },
      required: ["city"],
    },
  },
  {
    name: "calculate",
    description:
      "Evaluate a mathematical expression and return the result. Supports basic arithmetic (+, -, *, /, **, %).",
    input_schema: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description: "The math expression to evaluate, e.g. '(12 + 8) * 3'",
        },
      },
      required: ["expression"],
    },
  },
  {
    name: "search_web",
    description:
      "Search the web for a given query and return a list of relevant results with titles and snippets.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query",
        },
      },
      required: ["query"],
    },
  },
];

// --- Simulated tool implementations ---

function getWeather(city) {
  const cities = {
    roma: { temp: 22, conditions: "Soleggiato", humidity: 45, wind: 12 },
    rome: { temp: 22, conditions: "Sunny", humidity: 45, wind: 12 },
    milano: { temp: 18, conditions: "Nuvoloso", humidity: 65, wind: 8 },
    milan: { temp: 18, conditions: "Cloudy", humidity: 65, wind: 8 },
    napoli: { temp: 25, conditions: "Soleggiato", humidity: 55, wind: 15 },
    naples: { temp: 25, conditions: "Sunny", humidity: 55, wind: 15 },
    "new york": { temp: 15, conditions: "Partly Cloudy", humidity: 60, wind: 20 },
    london: { temp: 12, conditions: "Rainy", humidity: 80, wind: 25 },
    londra: { temp: 12, conditions: "Piovoso", humidity: 80, wind: 25 },
    tokyo: { temp: 20, conditions: "Clear", humidity: 50, wind: 10 },
    paris: { temp: 16, conditions: "Overcast", humidity: 70, wind: 14 },
    parigi: { temp: 16, conditions: "Coperto", humidity: 70, wind: 14 },
    berlino: { temp: 14, conditions: "Nuvoloso", humidity: 68, wind: 18 },
    berlin: { temp: 14, conditions: "Cloudy", humidity: 68, wind: 18 },
  };

  const key = city.toLowerCase().trim();
  const data = cities[key] || {
    temp: Math.floor(Math.random() * 30) + 5,
    conditions: ["Sunny", "Cloudy", "Rainy", "Windy", "Partly Cloudy"][
      Math.floor(Math.random() * 5)
    ],
    humidity: Math.floor(Math.random() * 60) + 30,
    wind: Math.floor(Math.random() * 30) + 5,
  };

  return {
    city,
    temperature: `${data.temp}°C`,
    conditions: data.conditions,
    humidity: `${data.humidity}%`,
    wind: `${data.wind} km/h`,
  };
}

function calculate(expression) {
  // Allow only safe math characters
  const sanitized = expression.replace(/[^0-9+\-*/().%\s^]/g, "");
  // Replace ^ with ** for exponentiation
  const expr = sanitized.replace(/\^/g, "**");
  try {
    // Using Function constructor for math evaluation (server-side only, controlled input)
    const result = new Function(`"use strict"; return (${expr})`)();
    if (typeof result !== "number" || !isFinite(result)) {
      return { expression, error: "Invalid expression or result is not a finite number" };
    }
    return { expression, result };
  } catch {
    return { expression, error: "Could not evaluate expression" };
  }
}

function searchWeb(query) {
  const results = [
    {
      title: `${query} - Wikipedia`,
      snippet: `Comprehensive article about "${query}" with detailed information, history, and references.`,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
    },
    {
      title: `Understanding ${query} | Expert Guide`,
      snippet: `An in-depth guide to "${query}": key concepts, latest developments, and practical applications.`,
      url: `https://example.com/guide/${encodeURIComponent(query)}`,
    },
    {
      title: `${query} - Latest News and Updates`,
      snippet: `Stay up to date with the latest news about "${query}". Recent reports and analysis from trusted sources.`,
      url: `https://example.com/news/${encodeURIComponent(query)}`,
    },
  ];
  return { query, results };
}

function executeTool(name, input) {
  switch (name) {
    case "get_weather":
      return getWeather(input.city);
    case "calculate":
      return calculate(input.expression);
    case "search_web":
      return searchWeb(input.query);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// --- SSE endpoint for agentic loop ---

app.post("/api/chat", async (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const sendEvent = (type, data) => {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  };

  try {
    const { message } = req.body;

    if (!message) {
      sendEvent("error", { content: "No message provided" });
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    // Send the user message step
    sendEvent("user_message", { content: message });

    // Build initial messages array
    const messages = [{ role: "user", content: message }];

    const systemPrompt = `You are a helpful AI assistant. You have access to tools for getting weather, calculating math expressions, and searching the web. Use them when relevant to answer the user's question. Always respond in the same language the user uses.`;

    // --- Agentic loop ---
    let loopCount = 0;
    const maxLoops = 10;

    while (loopCount < maxLoops) {
      loopCount++;

      sendEvent("thinking", { content: `API call #${loopCount}...` });

      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        tools,
        messages,
      });

      // Push assistant response into history
      messages.push({ role: "assistant", content: response.content });

      // Process response content blocks
      const toolUseBlocks = [];

      for (const block of response.content) {
        if (block.type === "text") {
          sendEvent("assistant_text", { content: block.text });
        } else if (block.type === "tool_use") {
          sendEvent("tool_call", {
            toolName: block.name,
            toolInput: block.input,
            toolUseId: block.id,
          });

          // Execute the tool
          const result = executeTool(block.name, block.input);

          sendEvent("tool_result", {
            toolName: block.name,
            toolUseId: block.id,
            result,
          });

          toolUseBlocks.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        }
      }

      // If stop_reason is NOT "tool_use", we're done
      if (response.stop_reason !== "tool_use") {
        break;
      }

      // Otherwise, add tool results as a user message and continue the loop
      messages.push({ role: "user", content: toolUseBlocks });
    }

    sendEvent("done", {});
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("Error in agentic loop:", err);
    sendEvent("error", { content: err.message || "Internal server error" });
    res.write("data: [DONE]\n\n");
    res.end();
  }
});

// SPA fallback - serve index.html for all non-API routes
app.get("/{*path}", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
