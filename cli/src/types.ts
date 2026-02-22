export interface FileContext {
  path: string;
  content: string;
}

export type StepType = "plan" | "tool_call" | "observation" | "reflection" | "final";

export interface AgentStep {
  step_type: StepType;
  content: string;
  tool_name?: string | null;
  tool_input?: string | null;
}

export interface ReasonRequest {
  prompt: string;
  files: FileContext[];
  max_steps?: number;
}

export interface ReasonResponse {
  steps: AgentStep[];
  final_report: string;
}

export interface EmbedRequest {
  texts: string[];
}

export interface EmbedResponse {
  embeddings: number[][];
}

export interface ToolResult {
  tool_name: string;
  input: string;
  output: string;
  error?: string;
}

export interface AgentConfig {
  apiBaseUrl: string;
  maxSteps: number;
  targetDir: string;
}
