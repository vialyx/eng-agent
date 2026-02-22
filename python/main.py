from fastapi import FastAPI
from .models import ReasonRequest, ReasonResponse, EmbedRequest, EmbedResponse
from .agent import ReasoningAgent
from .llm import get_embeddings

app = FastAPI(title="eng-agent Python service")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/reason", response_model=ReasonResponse)
async def reason(request: ReasonRequest) -> ReasonResponse:
    agent = ReasoningAgent()
    return agent.run(request.prompt, request.files, request.max_steps)


@app.post("/embed", response_model=EmbedResponse)
async def embed(request: EmbedRequest) -> EmbedResponse:
    embeddings = get_embeddings(request.texts)
    return EmbedResponse(embeddings=embeddings)
