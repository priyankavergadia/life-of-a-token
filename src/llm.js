// llm.js — direct-from-browser adapters for Gemini, OpenAI, and Anthropic.
// The user's API key lives only in their browser (localStorage) and is sent
// straight to the provider — never to any server of ours (this is a static site).

export const PROVIDERS = {
  gemini: {
    label: 'Google Gemini',
    model: 'gemini-2.5-flash',
    embedModel: 'text-embedding-004',
    keyHint: 'AIza…',
    keyUrl: 'https://aistudio.google.com/apikey',
    embeds: true,
  },
  openai: {
    label: 'OpenAI (GPT)',
    model: 'gpt-4o-mini',
    embedModel: 'text-embedding-3-small',
    keyHint: 'sk-…',
    keyUrl: 'https://platform.openai.com/api-keys',
    embeds: true,
  },
  anthropic: {
    label: 'Anthropic (Claude)',
    model: 'claude-haiku-4-5-20251001',
    embedModel: null,
    keyHint: 'sk-ant-…',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    embeds: false,
  },
}

async function asJson(r) {
  const j = await r.json().catch(() => ({}))
  if (!r.ok) {
    const msg = j?.error?.message || j?.error?.type || j?.message || `HTTP ${r.status}`
    throw new Error(msg)
  }
  return j
}

/* ---------------------------------------------------------------- CHAT (text) */
export async function chat(provider, key, { system, prompt, temperature = 0.7, maxTokens = 300 }) {
  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${PROVIDERS.gemini.model}:generateContent?key=${encodeURIComponent(key)}`
    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    }
    if (system) body.systemInstruction = { parts: [{ text: system }] }
    const j = await asJson(await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }))
    return (j.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim()
  }
  if (provider === 'openai') {
    const messages = []
    if (system) messages.push({ role: 'system', content: system })
    messages.push({ role: 'user', content: prompt })
    const j = await asJson(await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: PROVIDERS.openai.model, messages, temperature, max_tokens: maxTokens }),
    }))
    return (j.choices?.[0]?.message?.content || '').trim()
  }
  if (provider === 'anthropic') {
    const j = await asJson(await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model: PROVIDERS.anthropic.model, max_tokens: maxTokens, temperature, system: system || undefined, messages: [{ role: 'user', content: prompt }] }),
    }))
    return (j.content || []).map((b) => b.text || '').join('').trim()
  }
  throw new Error('Unknown provider')
}

/* ---------------------------------------------------------------- EMBEDDINGS */
export async function embed(provider, key, texts) {
  if (provider === 'gemini') {
    const m = PROVIDERS.gemini.embedModel
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:batchEmbedContents?key=${encodeURIComponent(key)}`
    const body = { requests: texts.map((t) => ({ model: `models/${m}`, content: { parts: [{ text: t }] } })) }
    const j = await asJson(await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }))
    return j.embeddings.map((e) => e.values)
  }
  if (provider === 'openai') {
    const j = await asJson(await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: PROVIDERS.openai.embedModel, input: texts }),
    }))
    return j.data.map((d) => d.embedding)
  }
  throw new Error('Claude has no embeddings API — switch to Gemini or OpenAI for this lab.')
}

/* ------------------------------------------------------------------- VISION */
export async function chatWithImage(provider, key, { prompt, base64, mime = 'image/png' }) {
  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${PROVIDERS.gemini.model}:generateContent?key=${encodeURIComponent(key)}`
    const body = { contents: [{ role: 'user', parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: base64 } }] }] }
    const j = await asJson(await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }))
    return (j.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim()
  }
  if (provider === 'openai') {
    const j = await asJson(await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: PROVIDERS.openai.model, max_tokens: 350,
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } }] }],
      }),
    }))
    return (j.choices?.[0]?.message?.content || '').trim()
  }
  if (provider === 'anthropic') {
    const j = await asJson(await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({
        model: PROVIDERS.anthropic.model, max_tokens: 350,
        messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: mime, data: base64 } }, { type: 'text', text: prompt }] }],
      }),
    }))
    return (j.content || []).map((b) => b.text || '').join('').trim()
  }
  throw new Error('Unknown provider')
}

/* ---------------------------------------------------- AGENT (one tool round) */
// A single tool the model may call. We run it locally, then ask the model to answer.
function shippingCost(weight_kg, destination) {
  const total = 10 + Number(weight_kg) * 2.5
  return `The shipping cost to ${destination} for a ${weight_kg}kg package is $${total.toFixed(2)}`
}
const TOOL = {
  name: 'calculate_shipping_cost',
  description: 'Calculate the shipping cost based on package weight (kg) and destination city.',
  params: { weight_kg: 'number', destination: 'string' },
}

export async function runAgent(provider, key, query) {
  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${PROVIDERS.gemini.model}:generateContent?key=${encodeURIComponent(key)}`
    const tools = [{ function_declarations: [{ name: TOOL.name, description: TOOL.description, parameters: { type: 'object', properties: { weight_kg: { type: 'number' }, destination: { type: 'string' } }, required: ['weight_kg', 'destination'] } }] }]
    const c1 = await asJson(await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: query }] }], tools }) }))
    const fc = c1.candidates?.[0]?.content?.parts?.find((p) => p.functionCall)?.functionCall
    if (!fc) return { args: null, toolResult: null, answer: c1.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '(no tool call)' }
    const toolResult = shippingCost(fc.args.weight_kg, fc.args.destination)
    const c2 = await asJson(await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: query }] }, { role: 'model', parts: [{ functionCall: fc }] }, { role: 'user', parts: [{ functionResponse: { name: TOOL.name, response: { result: toolResult } } }] }], tools }) }))
    const answer = c2.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim()
    return { args: fc.args, toolResult, answer }
  }
  if (provider === 'openai') {
    const tools = [{ type: 'function', function: { name: TOOL.name, description: TOOL.description, parameters: { type: 'object', properties: { weight_kg: { type: 'number' }, destination: { type: 'string' } }, required: ['weight_kg', 'destination'] } } }]
    const msgs = [{ role: 'user', content: query }]
    const c1 = await asJson(await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify({ model: PROVIDERS.openai.model, messages: msgs, tools }) }))
    const call = c1.choices?.[0]?.message?.tool_calls?.[0]
    if (!call) return { args: null, toolResult: null, answer: c1.choices?.[0]?.message?.content || '(no tool call)' }
    const args = JSON.parse(call.function.arguments)
    const toolResult = shippingCost(args.weight_kg, args.destination)
    msgs.push(c1.choices[0].message)
    msgs.push({ role: 'tool', tool_call_id: call.id, content: toolResult })
    const c2 = await asJson(await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify({ model: PROVIDERS.openai.model, messages: msgs, tools }) }))
    return { args, toolResult, answer: (c2.choices?.[0]?.message?.content || '').trim() }
  }
  if (provider === 'anthropic') {
    const headers = { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }
    const tools = [{ name: TOOL.name, description: TOOL.description, input_schema: { type: 'object', properties: { weight_kg: { type: 'number' }, destination: { type: 'string' } }, required: ['weight_kg', 'destination'] } }]
    const c1 = await asJson(await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers, body: JSON.stringify({ model: PROVIDERS.anthropic.model, max_tokens: 400, tools, messages: [{ role: 'user', content: query }] }) }))
    const use = (c1.content || []).find((b) => b.type === 'tool_use')
    if (!use) return { args: null, toolResult: null, answer: (c1.content || []).map((b) => b.text || '').join('') || '(no tool call)' }
    const toolResult = shippingCost(use.input.weight_kg, use.input.destination)
    const c2 = await asJson(await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers,
      body: JSON.stringify({
        model: PROVIDERS.anthropic.model, max_tokens: 400, tools,
        messages: [
          { role: 'user', content: query },
          { role: 'assistant', content: c1.content },
          { role: 'user', content: [{ type: 'tool_result', tool_use_id: use.id, content: toolResult }] },
        ],
      }),
    }))
    return { args: use.input, toolResult, answer: (c2.content || []).map((b) => b.text || '').join('').trim() }
  }
  throw new Error('Unknown provider')
}

/* ----------------------------------------------------------------- MATH UTILS */
export function cosine(a, b) {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i] }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1)
}

// Classical MDS → 2D coordinates from high-dim vectors (small n). Uses cosine
// distance + Jacobi eigen-decomposition of the double-centered Gram matrix.
export function mds2d(vectors) {
  const n = vectors.length
  // distance^2 matrix from cosine distance
  const D2 = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const d = 1 - cosine(vectors[i], vectors[j])
    D2[i][j] = d * d
  }
  // double centering: B = -1/2 J D2 J
  const rowM = D2.map((r) => r.reduce((a, b) => a + b, 0) / n)
  const grand = rowM.reduce((a, b) => a + b, 0) / n
  const B = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    B[i][j] = -0.5 * (D2[i][j] - rowM[i] - rowM[j] + grand)
  }
  const { values, vectors: vecs } = jacobiEigen(B)
  // top 2 eigen pairs
  const idx = values.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).slice(0, 2).map((p) => p[1])
  const coords = []
  for (let i = 0; i < n; i++) {
    const x = vecs[i][idx[0]] * Math.sqrt(Math.max(values[idx[0]], 0))
    const y = vecs[i][idx[1]] * Math.sqrt(Math.max(values[idx[1]], 0))
    coords.push([x, y])
  }
  // normalize into -1..1
  const xs = coords.map((c) => c[0]), ys = coords.map((c) => c[1])
  const sx = Math.max(...xs.map(Math.abs)) || 1, sy = Math.max(...ys.map(Math.abs)) || 1
  return coords.map(([x, y]) => [x / sx, y / sy])
}

function jacobiEigen(Ain) {
  const n = Ain.length
  const A = Ain.map((r) => r.slice())
  const V = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
  for (let sweep = 0; sweep < 100; sweep++) {
    // largest off-diagonal
    let p = 0, q = 1, max = 0
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (Math.abs(A[i][j]) > max) { max = Math.abs(A[i][j]); p = i; q = j }
    if (max < 1e-9) break
    const app = A[p][p], aqq = A[q][q], apq = A[p][q]
    const phi = 0.5 * Math.atan2(2 * apq, aqq - app)
    const c = Math.cos(phi), s = Math.sin(phi)
    for (let i = 0; i < n; i++) {
      const aip = A[i][p], aiq = A[i][q]
      A[i][p] = c * aip - s * aiq
      A[i][q] = s * aip + c * aiq
    }
    for (let i = 0; i < n; i++) {
      const api = A[p][i], aqi = A[q][i]
      A[p][i] = c * api - s * aqi
      A[q][i] = s * api + c * aqi
    }
    for (let i = 0; i < n; i++) {
      const vip = V[i][p], viq = V[i][q]
      V[i][p] = c * vip - s * viq
      V[i][q] = s * vip + c * viq
    }
  }
  return { values: A.map((r, i) => r[i]), vectors: V }
}

/* ============================================================
   Structured output (JSON) + vision-to-JSON + multi-tool agent
   ============================================================ */
export function parseJSON(text) {
  if (!text) throw new Error('Empty response')
  let t = text.trim()
  // strip ```json fences
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  // grab the outermost {...}
  const a = t.indexOf('{'), b = t.lastIndexOf('}')
  if (a >= 0 && b > a) t = t.slice(a, b + 1)
  return JSON.parse(t)
}

// Chat that returns parsed JSON. Caller describes the shape in `prompt`/`system`.
export async function chatJSON(provider, key, { system, prompt, temperature = 0.4, maxTokens = 500 }) {
  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${PROVIDERS.gemini.model}:generateContent?key=${encodeURIComponent(key)}`
    const body = { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature, maxOutputTokens: maxTokens, response_mime_type: 'application/json' } }
    if (system) body.systemInstruction = { parts: [{ text: system }] }
    const j = await asJson(await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }))
    return parseJSON((j.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join(''))
  }
  if (provider === 'openai') {
    const messages = []
    if (system) messages.push({ role: 'system', content: system })
    messages.push({ role: 'user', content: prompt })
    const j = await asJson(await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: PROVIDERS.openai.model, messages, temperature, max_tokens: maxTokens, response_format: { type: 'json_object' } }),
    }))
    return parseJSON(j.choices?.[0]?.message?.content || '')
  }
  if (provider === 'anthropic') {
    const j = await asJson(await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: PROVIDERS.anthropic.model, max_tokens: maxTokens, temperature, system: (system || '') + '\nRespond with ONLY a single valid JSON object, no prose, no markdown.', messages: [{ role: 'user', content: prompt }] }),
    }))
    return parseJSON((j.content || []).map((b) => b.text || '').join(''))
  }
  throw new Error('Unknown provider')
}

// Vision → structured JSON (image in, parsed object out).
export async function visionJSON(provider, key, { prompt, base64, mime = 'image/png' }) {
  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${PROVIDERS.gemini.model}:generateContent?key=${encodeURIComponent(key)}`
    const body = { contents: [{ role: 'user', parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: base64 } }] }], generationConfig: { temperature: 0, response_mime_type: 'application/json' } }
    const j = await asJson(await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }))
    return parseJSON((j.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join(''))
  }
  if (provider === 'openai') {
    const j = await asJson(await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: PROVIDERS.openai.model, max_tokens: 500, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } }] }] }),
    }))
    return parseJSON(j.choices?.[0]?.message?.content || '')
  }
  if (provider === 'anthropic') {
    const j = await asJson(await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: PROVIDERS.anthropic.model, max_tokens: 500, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: mime, data: base64 } }, { type: 'text', text: prompt + '\nRespond with ONLY a single valid JSON object.' }] }] }),
    }))
    return parseJSON((j.content || []).map((b) => b.text || '').join(''))
  }
  throw new Error('Unknown provider')
}

// Generic multi-tool agent loop. tools: [{name, description, properties, required, fn}]
// fn(args) -> string. Returns { trace: [{name,args,result}], answer }.
export async function runAgentMulti(provider, key, query, tools, system, maxRounds = 5) {
  const byName = Object.fromEntries(tools.map((t) => [t.name, t]))
  const trace = []

  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${PROVIDERS.gemini.model}:generateContent?key=${encodeURIComponent(key)}`
    const decls = tools.map((t) => ({ name: t.name, description: t.description, parameters: { type: 'object', properties: t.properties, required: t.required || [] } }))
    const contents = [{ role: 'user', parts: [{ text: query }] }]
    const base = { tools: [{ function_declarations: decls }] }
    if (system) base.systemInstruction = { parts: [{ text: system }] }
    for (let r = 0; r < maxRounds; r++) {
      const j = await asJson(await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...base, contents }) }))
      const parts = j.candidates?.[0]?.content?.parts || []
      const calls = parts.filter((p) => p.functionCall).map((p) => p.functionCall)
      if (!calls.length) return { trace, answer: parts.map((p) => p.text || '').join('').trim() }
      contents.push({ role: 'model', parts: calls.map((c) => ({ functionCall: c })) })
      const respParts = []
      for (const c of calls) {
        const result = String(byName[c.name].fn(c.args))
        trace.push({ name: c.name, args: c.args, result })
        respParts.push({ functionResponse: { name: c.name, response: { result } } })
      }
      contents.push({ role: 'user', parts: respParts })
    }
    return { trace, answer: '(stopped after max rounds)' }
  }

  if (provider === 'openai') {
    const oaTools = tools.map((t) => ({ type: 'function', function: { name: t.name, description: t.description, parameters: { type: 'object', properties: t.properties, required: t.required || [] } } }))
    const messages = []
    if (system) messages.push({ role: 'system', content: system })
    messages.push({ role: 'user', content: query })
    for (let r = 0; r < maxRounds; r++) {
      const j = await asJson(await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify({ model: PROVIDERS.openai.model, messages, tools: oaTools }) }))
      const msg = j.choices?.[0]?.message
      if (!msg?.tool_calls?.length) return { trace, answer: (msg?.content || '').trim() }
      messages.push(msg)
      for (const call of msg.tool_calls) {
        const args = JSON.parse(call.function.arguments || '{}')
        const result = String(byName[call.function.name].fn(args))
        trace.push({ name: call.function.name, args, result })
        messages.push({ role: 'tool', tool_call_id: call.id, content: result })
      }
    }
    return { trace, answer: '(stopped after max rounds)' }
  }

  if (provider === 'anthropic') {
    const headers = { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }
    const anTools = tools.map((t) => ({ name: t.name, description: t.description, input_schema: { type: 'object', properties: t.properties, required: t.required || [] } }))
    const messages = [{ role: 'user', content: query }]
    for (let r = 0; r < maxRounds; r++) {
      const j = await asJson(await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers, body: JSON.stringify({ model: PROVIDERS.anthropic.model, max_tokens: 600, system: system || undefined, tools: anTools, messages }) }))
      const uses = (j.content || []).filter((b) => b.type === 'tool_use')
      if (!uses.length) return { trace, answer: (j.content || []).map((b) => b.text || '').join('').trim() }
      messages.push({ role: 'assistant', content: j.content })
      const results = []
      for (const u of uses) {
        const result = String(byName[u.name].fn(u.input))
        trace.push({ name: u.name, args: u.input, result })
        results.push({ type: 'tool_result', tool_use_id: u.id, content: result })
      }
      messages.push({ role: 'user', content: results })
    }
    return { trace, answer: '(stopped after max rounds)' }
  }
  throw new Error('Unknown provider')
}
