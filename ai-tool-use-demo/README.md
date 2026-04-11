# AI Dietro le Quinte - Ep.1 Tool Use

A React demo app that visually shows how an AI agent with tool use works, step by step.

## What it does

The app lets you ask a question to Claude (via Anthropic API). Behind the scenes, it runs a full **agentic loop** and visualizes every step in real time:

1. **User message** - your question
2. **Tool call** - Claude decides to call a tool (with JSON input)
3. **Tool result** - the tool returns a result (JSON)
4. **Final response** - Claude formulates an answer using the tool results

The loop continues as long as `stop_reason === "tool_use"` and stops when `stop_reason === "end_turn"`.

## Available tools

| Tool | Description |
|------|-------------|
| `get_weather(city)` | Simulated weather data for a city |
| `calculate(expression)` | Evaluates math expressions |
| `search_web(query)` | Simulated web search results |

## Setup

```bash
cd ai-tool-use-demo
npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

## Run

Start both the backend server and the Vite dev server:

```bash
# Terminal 1 - Backend (port 3001)
npm run server

# Terminal 2 - Frontend (port 5173)
npm run dev
```

Then open http://localhost:5173

## Stack

- React + Vite (frontend)
- Express (backend API proxy)
- Anthropic SDK (Claude API)
- SSE (Server-Sent Events) for real-time step streaming
