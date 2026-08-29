import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getRun } from "../../lib/core";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const id = String(req.query.id || "");
  const run = getRun(id);
  if (!run) return res.status(404).json({ error: "Run not found", id });
  if (req.method === "POST" && req.query.action === "cancel") {
    if (!["COMPLETED", "FAILED"].includes(run.status)) run.status = "FAILED", run.error = "Cancelled by user", run.updatedAt = new Date().toISOString();
    return res.status(200).json({ run });
  }
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  return res.status(200).json({ run });
}
