# Labs — code + documentation

Each section ships with **downloadable code** (a `.py` script and a Jupyter
`.ipynb` notebook) and **two docs**: a non-technical *for everyone* walkthrough
and a technical *for developers* guide.

All code is **LangChain-based** and **model-agnostic** — flip a `PROVIDER`
variable between Gemini, OpenAI, and Claude.

| Section | For everyone | For developers | Download code |
|---|---|---|---|
| GenAI Lab (6 labs) | [for-everyone](genai-lab-for-everyone.md) | [for-developers](genai-lab-for-developers.md) | [.py](../../public/labs/genai-lab.py) · [.ipynb](../../public/labs/genai-lab.ipynb) |
| Project: LLM Outputs | [for-everyone](llm-outputs-for-everyone.md) | [for-developers](llm-outputs-for-developers.md) | [.py](../../public/labs/project-llm-outputs.py) · [.ipynb](../../public/labs/project-llm-outputs.ipynb) |
| Project: RAG | [for-everyone](rag-for-everyone.md) | [for-developers](rag-for-developers.md) | [.py](../../public/labs/project-rag.py) · [.ipynb](../../public/labs/project-rag.ipynb) |
| Project: Tools | [for-everyone](tools-for-everyone.md) | [for-developers](tools-for-developers.md) | [.py](../../public/labs/project-tools.py) · [.ipynb](../../public/labs/project-tools.ipynb) |
| Project: Personalization | [for-everyone](personalization-for-everyone.md) | [for-developers](personalization-for-developers.md) | [.py](../../public/labs/project-personalization.py) · [.ipynb](../../public/labs/project-personalization.ipynb) |

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
