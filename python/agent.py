import json
from .models import AgentStep, FileContext, ReasonResponse
from .llm import chat_completion

SYSTEM_PROMPT = """You are an expert engineering assistant that analyzes codebases.
You reason step by step to answer technical questions.

When given a prompt and file context, you will:
1. First output a PLAN listing the steps you will take (step_type: "plan")
2. For each analytical step, output an OBSERVATION of what you found (step_type: "observation") 
3. After gathering observations, output a REFLECTION synthesizing insights (step_type: "reflection")
4. Finally output a comprehensive FINAL_REPORT (step_type: "final")

Respond ONLY with a JSON array of steps. Each step has:
{
  "step_type": "plan" | "observation" | "reflection" | "final",
  "content": "your analysis here",
  "tool_name": null or "read_file" | "search_code",
  "tool_input": null or the file path or search query
}

Be thorough and technical. Reference specific files and line patterns in your observations."""


class ReasoningAgent:
    def run(self, prompt: str, files: list[FileContext], max_steps: int = 5) -> ReasonResponse:
        file_context = "\n\n".join(
            f"=== {f.path} ===\n{f.content}" for f in files
        ) if files else "No files provided."

        user_message = f"""Question: {prompt}

File Context:
{file_context}

Analyze the above and return a JSON array of reasoning steps."""

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ]

        raw = chat_completion(messages)

        # Parse JSON response
        try:
            # Strip markdown code fences if present
            text = raw.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1]
                text = text.rsplit("```", 1)[0]
            steps_data = json.loads(text)
        except (json.JSONDecodeError, IndexError):
            # Fallback: wrap entire response as a single final step
            steps_data = [{"step_type": "final", "content": raw, "tool_name": None, "tool_input": None}]

        steps = [AgentStep(**s) for s in steps_data]

        # Extract final report
        final_steps = [s for s in steps if s.step_type == "final"]
        final_report = final_steps[-1].content if final_steps else (steps[-1].content if steps else "No report generated.")

        return ReasonResponse(steps=steps, final_report=final_report)
