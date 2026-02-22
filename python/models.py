from typing import Literal
from pydantic import BaseModel


class FileContext(BaseModel):
    path: str
    content: str


class ReasonRequest(BaseModel):
    prompt: str
    files: list[FileContext] = []
    max_steps: int = 5


class AgentStep(BaseModel):
    step_type: Literal["plan", "tool_call", "observation", "reflection", "final"]
    content: str
    tool_name: str | None = None
    tool_input: str | None = None


class ReasonResponse(BaseModel):
    steps: list[AgentStep]
    final_report: str


class EmbedRequest(BaseModel):
    texts: list[str]


class EmbedResponse(BaseModel):
    embeddings: list[list[float]]
