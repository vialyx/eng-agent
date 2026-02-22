import numpy as np


class VectorStore:
    def __init__(self) -> None:
        self._texts: list[str] = []
        self._vectors: list[list[float]] = []

    def add(self, texts: list[str], vectors: list[list[float]]) -> None:
        self._texts.extend(texts)
        self._vectors.extend(vectors)

    def search(self, query_vector: list[float], top_k: int = 5) -> list[tuple[str, float]]:
        if not self._vectors:
            return []
        q = np.array(query_vector, dtype=np.float32)
        matrix = np.array(self._vectors, dtype=np.float32)
        q_norm = np.linalg.norm(q)
        norms = np.linalg.norm(matrix, axis=1)
        # Avoid division by zero
        denom = norms * q_norm
        denom = np.where(denom == 0, 1e-10, denom)
        similarities = matrix.dot(q) / denom
        top_indices = np.argsort(similarities)[::-1][:top_k]
        return [(self._texts[i], float(similarities[i])) for i in top_indices]

    def clear(self) -> None:
        self._texts = []
        self._vectors = []
