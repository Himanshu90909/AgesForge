# AegisForge

AegisForge is an agent operating system control plane for coding-agent execution, failure intelligence, adaptive sandbox policy, evaluation, and experience memory.

## Production surfaces

- Frontend dashboard: Vite + React, deployed as a Vercel static build.
- MCP server: Streamable HTTP-compatible JSON-RPC endpoint at `/mcp` (implemented by `api/mcp.ts`).
- Health: call the `aegis_health` MCP tool.
- Tools: `aegis_health`, `run_agent_step`, and `classify_failure`.

## Local development

```bash
npm install
npm run dev
```

The dashboard runs on port 3000. The MCP handler is available through Vercel's local runtime with `vercel dev`.

## Vercel deployment

Import this repository into Vercel with the project root set to the repository root. The included `vercel.json` builds the dashboard and rewrites `/mcp` to `/api/mcp`.

Optional environment variable:

```text
GEMINI_API_KEY=...
```

The current MCP tools use deterministic safe responses so the server remains usable without credentials. A subsequent worker deployment can replace the deterministic adapter with the real Rust sandbox and queue services.

## MCP smoke test

After deployment, send an `initialize` request to `https://YOUR_DOMAIN/mcp`, then call `tools/list` and `tools/call` using JSON-RPC 2.0.
