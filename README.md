# eng-agent

A minimal AI engineering assistant that reasons across multiple steps to answer technical questions about your codebase.

## Architecture

```
User prompt
    ↓
[TypeScript CLI]
    ↓  HTTP
[Python FastAPI — LLM + embeddings]
    ↓
Agent loop:
  1. Plan steps
  2. Call tools (read file, search codebase)
  3. Observe results
  4. Reflect & decide next step
  5. Return final report
```

## Prerequisites

- Node.js 18+
- Python 3.11+
- OpenAI API key

## Setup

### 1. Clone and configure

```bash
cp .env.example .env
# Edit .env and set OPENAI_API_KEY
```

### 2. Start the Python service

```bash
cd python
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### 3. Install and build the CLI

```bash
cd cli
npm install
npm run build
```

## Usage

```bash
cd cli
node dist/index.js ask "What are the biggest risk areas in our API surface?" --dir /path/to/your/codebase
node dist/index.js ask "Which modules have the most coupling?" --dir /path/to/your/codebase
```

### Options

| Flag | Default | Description |
|------|---------|-------------|
| `-d, --dir <path>` | current directory | Target directory to analyze |
| `-u, --url <url>` | `http://localhost:8000` | Python service URL |
| `-s, --steps <n>` | `5` | Max reasoning steps |

## Example Output

```
🤖 eng-agent starting...

Target directory: /your/codebase
Question: What are the biggest risk areas in our API surface?

📂 Collecting files...
📁 src
  📄 index.ts
  📄 routes.ts
Loaded 2 file(s) for analysis.

🧠 Running reasoning loop...

📋 [PLAN]
I will analyze the API surface by examining route definitions, middleware, ...

🔍 [OBSERVATION]
In routes.ts, I found 3 unvalidated input handlers...

💭 [REFLECTION]
The main risks are: missing input validation, no rate limiting...

📝 [FINAL]
## Risk Analysis Report
...
```

## Python API Reference

### `POST /reason`

```json
{
  "prompt": "What are the biggest risk areas?",
  "files": [{"path": "src/index.ts", "content": "..."}],
  "max_steps": 5
}
```

Response:
```json
{
  "steps": [
    {"step_type": "plan", "content": "...", "tool_name": null, "tool_input": null}
  ],
  "final_report": "## Risk Analysis\n..."
}
```

### `POST /embed`

```json
{"texts": ["function handleRequest()", "class ApiController"]}
```

### `GET /health`

Returns `{"status": "ok"}`.

## Tech Stack

- **TypeScript** (Node.js CLI): Agent orchestration, file system tools, streaming output
- **Python** (FastAPI): LLM calls via OpenAI SDK, in-memory embeddings with numpy
