import type { VercelRequest, VercelResponse } from "@vercel/node";
import { unavailableSandbox } from "../lib/core";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const command = typeof req.body?.command === "string" ? req.body.command : "";
  if (!command.trim()) return res.status(400).json({ error: "command is required" });
  const result = unavailableSandbox(command);
  const status = result.risk.decision === "BLOCK" ? 403 : 503;
  return res.status(status).json(result);
}
