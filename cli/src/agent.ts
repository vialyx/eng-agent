import chalk from "chalk";
import { AgentConfig, AgentStep, FileContext, ReasonResponse } from "./types";
import { AgentApiClient } from "./api";
import { collectFiles, listDirectory } from "./tools";

function printStep(step: AgentStep): void {
  const icons: Record<string, string> = {
    plan: "📋",
    tool_call: "🔧",
    observation: "🔍",
    reflection: "💭",
    final: "📝",
  };
  const colors: Record<string, (s: string) => string> = {
    plan: chalk.blue,
    tool_call: chalk.yellow,
    observation: chalk.cyan,
    reflection: chalk.magenta,
    final: chalk.green,
  };
  const icon = icons[step.step_type] ?? "•";
  const color = colors[step.step_type] ?? chalk.white;
  console.log(color(`\n${icon} [${step.step_type.toUpperCase()}]`));
  if (step.tool_name) {
    console.log(chalk.gray(`  Tool: ${step.tool_name} | Input: ${step.tool_input}`));
  }
  console.log(step.content);
}

export async function runAgent(
  prompt: string,
  config: AgentConfig
): Promise<ReasonResponse> {
  const client = new AgentApiClient(config.apiBaseUrl);

  // Check service health
  const healthy = await client.health();
  if (!healthy) {
    throw new Error(
      `Cannot reach Python service at ${config.apiBaseUrl}. ` +
      "Please start it with: cd python && uvicorn main:app --reload"
    );
  }

  console.log(chalk.bold("\n🤖 eng-agent starting...\n"));
  console.log(chalk.gray(`Target directory: ${config.targetDir}`));
  console.log(chalk.gray(`Question: ${prompt}\n`));

  // Collect files from target directory
  console.log(chalk.dim("📂 Collecting files..."));
  const tree = listDirectory(config.targetDir);
  console.log(chalk.dim(tree.output));

  const files: FileContext[] = collectFiles(config.targetDir);
  console.log(chalk.dim(`Loaded ${files.length} file(s) for analysis.\n`));

  // Call the reasoning service
  console.log(chalk.bold("🧠 Running reasoning loop...\n"));
  const response = await client.reason({
    prompt,
    files,
    max_steps: config.maxSteps,
  });

  // Stream steps to terminal
  for (const step of response.steps) {
    printStep(step);
  }

  // Final report
  console.log(chalk.bold.green("\n\n═══════════════════════════════════════"));
  console.log(chalk.bold.green("           FINAL REPORT"));
  console.log(chalk.bold.green("═══════════════════════════════════════\n"));
  console.log(response.final_report);
  console.log(chalk.bold.green("\n═══════════════════════════════════════\n"));

  return response;
}
