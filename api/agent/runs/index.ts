import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createRun, listRuns } from "../../_lib/core";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") return res.status(200).json({ runs: listRuns(), source: "ephemeral-deployment-memory" });
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const task = typeof req.body?.task === "string" ? req.body.task.trim() : "";
  if (!task) return res.status(400).json({ error: "task is required" });
  return res.status(202).json({ run: createRun(task) });
}
