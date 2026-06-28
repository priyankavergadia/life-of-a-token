"""
Life of a Token — every step in code (transformers / GPT-2)

Runnable script version of the notebook (life-of-a-token.ipynb).
Pick a provider + paste an API key in the SETUP section, then run top to bottom.
"""


# # Life of a Token — every step, in real code
#
# The visual tab shows what happens inside a transformer. This notebook does the
# **same journey for real** on a small open model (GPT-2): your text → tokens →
# embeddings → positions → attention → layers → the predicted next token.
#
# Run top to bottom. Everything is a small function you can poke at.

# --- notebook setup cell: run these installs manually ---
# %pip install -q transformers torch tiktoken numpy

import torch, numpy as np
from transformers import GPT2LMHeadModel, GPT2TokenizerFast

# A small, fully open transformer so we can inspect every internal step.
tok = GPT2TokenizerFast.from_pretrained("gpt2")
model = GPT2LMHeadModel.from_pretrained(
    "gpt2", output_attentions=True, output_hidden_states=True
).eval()

TEXT = "The cat sat on the"   # <-- change this and re-run everything


# ## Step 1 · Tokenize — text becomes sub-word tokens + IDs

def tokenize(text):
    ids = tok(text, return_tensors="pt").input_ids        # shape (1, seq_len)
    pieces = [tok.decode([i]) for i in ids[0].tolist()]
    return ids, pieces

ids, pieces = tokenize(TEXT)
print("token count:", ids.shape[1])
for piece, tid in zip(pieces, ids[0].tolist()):
    print(f"  {tid:>6}  {piece!r}")
# (tiktoken gives the same idea: enc = tiktoken.get_encoding("gpt2"); enc.encode(TEXT))


# ## Step 2 · Embeddings — each token ID becomes a vector of meaning

wte = model.transformer.wte          # learned token-embedding table
token_emb = wte(ids)                 # (1, seq_len, 768)
print("embedding shape:", tuple(token_emb.shape), "(seq_len x 768 dims)")
print("first 8 dims of token 0:", token_emb[0, 0, :8].detach().numpy().round(3))

def cosine(a, b):
    a, b = a.detach().numpy(), b.detach().numpy()
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))

# How similar are the input tokens to each other, by meaning?
for i in range(len(pieces)):
    for j in range(i + 1, len(pieces)):
        print(f"  {pieces[i]!r:>8} <-> {pieces[j]!r:<8} {cosine(token_emb[0, i], token_emb[0, j]):.2f}")


# ## Step 3 · Positional encoding — add a sense of order

wpe = model.transformer.wpe                       # learned position-embedding table
positions = torch.arange(ids.shape[1])
pos_emb = wpe(positions)                           # (seq_len, 768)

hidden_0 = token_emb + pos_emb                     # what actually enters block 1
print("token + position =", tuple(hidden_0.shape))
print("position 0 vs 1 differ ->", not torch.allclose(pos_emb[0], pos_emb[1]))
# Same words in a different order now get different inputs -> word order matters.


# ## Step 4 · Attention — every token looks at the others

with torch.no_grad():
    out = model(ids)

# out.attentions: one entry per layer, each (1, n_heads, seq, seq)
A = out.attentions[0][0, 0]            # layer 0, head 0 attention matrix
print("attention matrix (rows = the token attending, cols = attended to):")
print("        " + "  ".join(f"{p!r:>6}" for p in pieces))
for i, row in enumerate(A):
    print(f"{pieces[i]!r:>7} " + "  ".join(f"{v:6.2f}" for v in row.numpy()))
# Note the upper-right triangle is ~0: the causal mask — tokens only look BACK.


# ## Step 5 · Feed-forward & stacking — repeat the block N times

# out.hidden_states: the representation after each block (plus the input) =>
# len = n_layers + 1. Each block = attention + a feed-forward network (+residuals).
hs = out.hidden_states
print("transformer blocks:", len(hs) - 1)
print("hidden size:", hs[0].shape[-1])
# How much the last token's vector changes as it flows deeper:
for layer in range(0, len(hs), 3):
    drift = (hs[layer][0, -1] - hs[0][0, -1]).norm().item()
    print(f"  after block {layer:>2}: drift from input = {drift:6.2f}")


# ## Step 6 · Predict — score the whole vocabulary, pick the next token

logits = out.logits[0, -1]                  # next-token scores after the last token
probs = torch.softmax(logits, dim=-1)       # -> probabilities that sum to 1
top = torch.topk(probs, 8)

print(f"Next token after: {TEXT!r}\n")
for prob, idx in zip(top.values, top.indices):
    print(f"  {tok.decode([idx])!r:>12}  {prob.item()*100:5.1f}%")

print("\nGreedy continuation:")
gen = model.generate(ids, max_new_tokens=10, do_sample=False, pad_token_id=tok.eos_token_id)
print("  ", tok.decode(gen[0]))
# The model appends one token, then runs the WHOLE pipeline again for the next.
