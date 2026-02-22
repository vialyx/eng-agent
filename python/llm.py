import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


def chat_completion(messages: list[dict], model: str = "gpt-4o-mini") -> str:
    response = _client.chat.completions.create(
        model=model,
        messages=messages,
    )
    return response.choices[0].message.content or ""


def get_embeddings(texts: list[str]) -> list[list[float]]:
    response = _client.embeddings.create(
        model="text-embedding-3-small",
        input=texts,
    )
    return [item.embedding for item in response.data]
