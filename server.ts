import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialization of Gemini API
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "AegisForge Agent OS",
    version: "3.2.0-core",
    geminiEnabled: Boolean(getGeminiClient()),
    timestamp: new Date().toISOString(),
  });
});

// Run live agent workflow with Gemini
app.post("/api/agent/run-step", async (req, res) => {
  try {
    const { stepType, task, currentCode, errorTrace, previousSteps } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Return simulated intelligence if no API key is provided
      return res.json({
        success: true,
        isSimulated: true,
        output: generateSimulatedStepOutput(stepType, task, currentCode, errorTrace),
      });
    }

    let systemInstruction = "You are AegisForge, an elite autonomous self-evolving coding agent operating system built for deep systems engineering, precise root-cause analysis, and regression-free patches.";
    let prompt = "";

    switch (stepType) {
      case "planning":
        prompt = `Analyze this software engineering task and create a rigorous, step-by-step execution plan with tool requirements and test specifications:\nTask: ${task}\nInitial Code:\n${currentCode || "(None)"}`;
        break;
      case "code_generation":
        prompt = `Write robust, production-grade code to solve this task:\nTask: ${task}\nPlan: ${JSON.stringify(previousSteps || [])}\nProvide clean implementation.`;
        break;
      case "failure_analysis":
        prompt = `Perform deep failure taxonomy classification and root-cause analysis for this execution failure:\nTask: ${task}\nCode:\n${currentCode}\nError/Trace:\n${errorTrace}\n\nClassify failure type (compilation, dependency, runtime, test_failure, timeout, resource_exhaustion, security_violation, logic_flaw), identify exact AST/line root cause, and formulate a targeted repair strategy.`;
        break;
      case "patch_synthesis":
        prompt = `Synthesize a verified unified patch to fix the identified root cause without regressions:\nTask: ${task}\nFailing Code:\n${currentCode}\nError Trace:\n${errorTrace}\n\nReturn the complete updated code and explanation.`;
        break;
      case "regression_generation":
        prompt = `Generate a 4-tier regression and adversarial test suite for this fix:\nTask: ${task}\nFixed Code:\n${currentCode}\n\nGenerate: 1) Repro test 2) Invariant boundary test 3) Adversarial security test 4) Stress/performance test.`;
        break;
      default:
        prompt = `Process this coding agent step: ${stepType} for task: ${task}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    res.json({
      success: true,
      isSimulated: false,
      output: response.text || "Execution completed.",
    });
  } catch (error: any) {
    console.error("Agent step error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to execute agent step",
      fallback: generateSimulatedStepOutput(req.body.stepType, req.body.task, req.body.currentCode, req.body.errorTrace),
    });
  }
});

// Heuristic fallback generator for instant, rich offline/demo execution
function generateSimulatedStepOutput(stepType: string, task: string, code?: string, errorTrace?: string): any {
  switch (stepType) {
    case "planning":
      return {
        planSteps: [
          "1. Isolate execution namespace and verify dependency graph",
          "2. Construct reproducing test harness with invariant assertions",
          "3. Synthesize minimal zero-allocation fix addressing concurrency/memory vulnerability",
          "4. Run test suite inside adaptive Rust sandbox with strict syscall filtering",
          "5. Run 4-tier regression matrix (Adversarial, Fuzz, Invariant, Benchmark)",
          "6. Extract failure episodic memory signature and update policy heuristics"
        ],
        estimatedComplexity: "O(1) Memory, O(N) Compute",
        sandboxPolicy: "RESTRICT_NETWORK, ENABLE_SECCOMP_BPF, 512MB_CGROUP",
      };
    case "failure_analysis":
      return {
        category: "logic_flaw",
        severity: "HIGH",
        astNode: "TokenExpirationValidator.validate() -> line 42",
        rootCause: "Clock skew window was unhandled; expired timestamp token comparison evaluated (<) instead of (<=) with missing grace margin.",
        confidenceScore: 0.96,
        repairStrategy: "Inject strict monotonic time check with configurable leeway window and atomic revocation blacklist query.",
      };
    case "patch_synthesis":
      return {
        patchSummary: "Applied atomic monotonic expiration check and synchronized mutex lock guard around concurrent state transition.",
        unifiedDiff: "@@ -40,4 +40,7 @@\n-    if (token.exp < Date.now()) {\n+    const now = Math.floor(Date.now() / 1000);\n+    if (token.exp <= now) {\n+      throw new TokenExpiredException('Token timestamp expired');\n+    }",
      };
    case "regression_generation":
      return {
        reproPass: true,
        invariantPass: true,
        adversarialPass: true,
        performancePass: true,
        suiteSummary: "4/4 Test Tiers Passed. 0 Regressions. Execution time 1.42ms.",
      };
    default:
      return { status: "success", detail: "Step processed successfully." };
  }
}

async function startServer() {
  // Vite middleware for development
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
    console.log(`[AegisForge Core OS] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
