import { GoogleGenAI, Type } from "@google/genai";
import { AppConfig, PlannerOutput, ExecutionResult, AgentStep } from '../types';
import { TOOLS_DEFINITION, githubTool, weatherTool } from './tools';

// Retry helper with exponential backoff for transient API errors
const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable = error.message?.includes('503') ||
                          error.message?.includes('overloaded') ||
                          error.message?.includes('UNAVAILABLE');
      if (!isRetryable || attempt === maxRetries - 1) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Max retries exceeded');
};

// --- PLANNER AGENT ---
export const runPlanner = async (userTask: string, config: AppConfig): Promise<PlannerOutput> => {
  if (!config.geminiApiKey) throw new Error("Gemini API Key is required");

  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
  const modelId = "gemini-3-flash-preview"; 

  const systemInstruction = `
    You are the PLANNER AGENT for an operations assistant.
    Your job is to break down a User Task into a linear sequence of steps using ONLY the available tools.
    
    ${TOOLS_DEFINITION}

    RULES:
    1. Output MUST be a valid JSON object with a single key "steps".
    2. "steps" is an array of objects with "tool", "action", and "params".
    3. Do not include any explanations, markdown code blocks, or text outside the JSON.
    4. If the user asks for something impossible with the tools, return an empty steps array.
  `;

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: modelId,
      contents: userTask,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                steps: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            tool: { type: Type.STRING, enum: ["github_tool", "weather_tool"] },
                            action: { type: Type.STRING },
                            params: {
                                type: Type.OBJECT,
                                // We must define all possible parameters for all tools here
                                // to satisfy the "non-empty properties for OBJECT type" requirement.
                                properties: {
                                    query: { type: Type.STRING },
                                    language: { type: Type.STRING },
                                    city: { type: Type.STRING }
                                }
                            }
                        },
                        required: ["tool", "action", "params"]
                    }
                }
            }
        }
      }
    }));

    const text = response.text || "{}";
    return JSON.parse(text) as PlannerOutput;
  } catch (e: any) {
    console.error("Planner Error", e);
    throw new Error(`Planner failed to generate a valid plan: ${e.message}`);
  }
};

// --- EXECUTOR AGENT ---
export const runExecutor = async (plan: PlannerOutput, config: AppConfig, onStepComplete: (res: ExecutionResult) => void): Promise<ExecutionResult[]> => {
  const results: ExecutionResult[] = [];

  for (const step of plan.steps) {
    const result: ExecutionResult = {
      step,
      status: 'success',
      timestamp: new Date().toISOString()
    };

    try {
      if (step.tool === 'github_tool' && step.action === 'search') {
        result.data = await githubTool(step.params as any, config);
      } else if (step.tool === 'weather_tool' && step.action === 'get_current') {
        result.data = await weatherTool(step.params as any, config);
      } else {
        throw new Error(`Unknown tool or action: ${step.tool}.${step.action}`);
      }
    } catch (e: any) {
      result.status = 'error';
      result.error = e.message;
    }

    results.push(result);
    onStepComplete(result);
    
    // Small delay to prevent rate limiting and improve UX pacing
    await new Promise(r => setTimeout(r, 800));
  }

  return results;
};

// --- VERIFIER AGENT ---
export const runVerifier = async (originalTask: string, results: ExecutionResult[], config: AppConfig): Promise<string> => {
  if (!config.geminiApiKey) throw new Error("Gemini API Key is required");

  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
  const modelId = "gemini-3-flash-preview"; 

  const executionSummary = results.map(r => `
    Tool: ${r.step.tool}
    Status: ${r.status}
    Params: ${JSON.stringify(r.step.params)}
    Output: ${r.status === 'success' ? JSON.stringify(r.data) : r.error}
  `).join('\n---\n');

  const systemInstruction = `
    You are the VERIFIER AGENT. 
    Your input is the original User Task and the results from the Executor Agent.
    
    Your goal is to:
    1. Check if the task was completed successfully based on the execution results.
    2. Synthesize the data into a helpful, human-readable final response.
    3. If there were errors, explain them clearly.
    4. Format the output nicely using Markdown (bolding key data).
  `;

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: modelId,
      contents: `Original Task: "${originalTask}"\n\nExecution Results:\n${executionSummary}`,
      config: {
        systemInstruction: systemInstruction,
      }
    }));

    return response.text || "Could not verify results.";
  } catch (e: any) {
    throw new Error(`Verifier failed: ${e.message}`);
  }
};