# Labs — code + documentation

Each section ships with **downloadable code** (a `.py` script and a Jupyter
`.ipynb` notebook) and **two docs**: a non-technical *for everyone* walkthrough
and a technical *for developers* guide.

All code is **LangChain-based** and **model-agnostic** — flip a `PROVIDER`
variable between Gemini, OpenAI, and Claude.

| Section | For everyone | For developers | Open in Colab | Download |
|---|---|---|---|---|
| Life of a Token | [for-everyone](life-of-a-token-for-everyone.md) | [for-developers](life-of-a-token-for-developers.md) | [Colab](https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/life-of-a-token.ipynb) | [.ipynb](../../public/labs/life-of-a-token.ipynb) · [.py](../../public/labs/life-of-a-token.py) |
| GenAI Lab (6 labs) | [for-everyone](genai-lab-for-everyone.md) | [for-developers](genai-lab-for-developers.md) | [Colab](https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/genai-lab.ipynb) | [.ipynb](../../public/labs/genai-lab.ipynb) · [.py](../../public/labs/genai-lab.py) |
| Project: LLM Outputs | [for-everyone](llm-outputs-for-everyone.md) | [for-developers](llm-outputs-for-developers.md) | [Colab](https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/project-llm-outputs.ipynb) | [.ipynb](../../public/labs/project-llm-outputs.ipynb) · [.py](../../public/labs/project-llm-outputs.py) |
| Project: RAG | [for-everyone](rag-for-everyone.md) | [for-developers](rag-for-developers.md) | [Colab](https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/project-rag.ipynb) | [.ipynb](../../public/labs/project-rag.ipynb) · [.py](../../public/labs/project-rag.py) |
| Project: Tools | [for-everyone](tools-for-everyone.md) | [for-developers](tools-for-developers.md) | [Colab](https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/project-tools.ipynb) | [.ipynb](../../public/labs/project-tools.ipynb) · [.py](../../public/labs/project-tools.py) |
| Project: Personalization | [for-everyone](personalization-for-everyone.md) | [for-developers](personalization-for-developers.md) | [Colab](https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/project-personalization.ipynb) | [.ipynb](../../public/labs/project-personalization.ipynb) · [.py](../../public/labs/project-personalization.py) |
| Vibe Coding (assignment) | [for-everyone](vibe-coding-for-everyone.md) | [for-developers](vibe-coding-for-developers.md) | — | — *(guide, no notebook)* |
| Greeting Cards (final project) | [for-everyone](greeting-card-for-everyone.md) | [for-developers](greeting-card-for-developers.md) | [Colab](https://colab.research.google.com/github/priyankavergadia/life-of-a-token/blob/main/public/labs/greeting-card.ipynb) | [.ipynb](../../public/labs/greeting-card.ipynb) · [.py](../../public/labs/greeting-card.py) |

### Direct download links (from the live site)

Base URL: `https://priyankavergadia.github.io/life-of-a-token/labs/`

- `genai-lab.ipynb` / `genai-lab.py`
- `project-llm-outputs.ipynb` / `project-llm-outputs.py`
- `project-rag.ipynb` / `project-rag.py`
- `project-tools.ipynb` / `project-tools.py`
- `project-personalization.ipynb` / `project-personalization.py`

### Running the notebooks
1. Open the `.ipynb` in **Jupyter**, **VS Code**, or **Google Colab** (or run the `.py`).
2. Run the **Setup** cell — it installs packages and asks for your API key.
3. Set `PROVIDER` to `"gemini"`, `"openai"`, or `"anthropic"`.
4. Run top to bottom. (Embeddings-based labs — RAG, Personalization, the Embeddings lab — need **Gemini** or **OpenAI**; Claude has no embeddings API.)
