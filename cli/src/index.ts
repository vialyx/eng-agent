import { Command } from "commander";
import * as path from "path";
import { runAgent } from "./agent";
import { AgentConfig } from "./types";

const program = new Command();

program
  .name("eng-agent")
  .description("AI engineering assistant that reasons across your codebase")
  .version("1.0.0");

program
  .command("ask <prompt>")
  .description("Ask a technical question about your codebase")
  .option("-d, --dir <path>", "Target directory to analyze", process.cwd())
  .option("-u, --url <url>", "Python service base URL", "http://localhost:8000")
  .option("-s, --steps <number>", "Max reasoning steps", "5")
  .action(async (prompt: string, options: { dir: string; url: string; steps: string }) => {
    const config: AgentConfig = {
      apiBaseUrl: options.url,
      maxSteps: parseInt(options.steps, 10),
      targetDir: path.resolve(options.dir),
    };
    try {
      await runAgent(prompt, config);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`\n❌ Error: ${message}\n`);
      process.exit(1);
    }
  });

program.parse(process.argv);

if (process.argv.length < 3) {
  program.help();
}
