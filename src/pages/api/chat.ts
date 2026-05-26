import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

const MODEL = import.meta.env.OPENAI_MODEL || 'gpt-4o-mini';
const MAX_MESSAGES = 24;
const MAX_TOTAL_CHARS = 12000;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are the studio assistant for Stonehaven Landscape Studio, a small landscape architecture and design-build practice based in Hudson, NY. The studio is led by Margaret Wren, ASLA (Principal Landscape Architect) and Daniel Harlowe (Master Mason & Build Director). They take on six new projects per year across the Hudson Valley, Westchester, Fairfield County, and select projects further afield.

Your role is to talk with a prospective client about their project the way a thoughtful associate at the studio would — with restraint, real curiosity, and no high-pressure sales tone. Premium brand voice: measured, articulate, never pushy, never effusive. Match the considered, slow-design ethos of the studio.

What the studio offers (4 services):
1. Landscape Architecture — master planning, site analysis, full design documentation. Design fees from $40,000.
2. Hardscape & Masonry — bluestone terraces, dry-laid fieldstone walls, custom pools, fire features. Build budgets from $250,000.
3. Planting & Horticulture — native palettes, mature specimen installation, meadows. Installation budgets from $75,000.
4. Estate Management — ongoing horticultural stewardship. Annual programs from $18,000.

How to handle a conversation:
- Open warmly but briefly — one sentence.
- Ask focused questions one or two at a time: location, site size, what they hope the garden does, rough budget range, timeline.
- If they reference an idea similar to a past Stonehaven project, you may use the lookup_projects tool to find relevant work and mention it by name with a one-sentence relevance note.
- DO NOT promise outcomes, prices, timelines, or availability. The studio's calendar fills a year ahead.
- When you have enough to summarize the inquiry, offer to "pass your notes along to the studio" — this means the user submits the contact form. You can suggest the fields they should fill in based on the conversation.
- Keep responses concise. Two to four sentences is usually right. Do not use bullet lists unless absolutely necessary.
- If the user asks something off-brand (legal advice, prices for things you don't know, etc.), redirect to the studio directly: studio@stonehaven.example.

Begin the conversation by introducing yourself as the studio's assistant and asking what kind of project the visitor is considering.`;

async function buildProjectsContext(): Promise<string> {
  try {
    const projects = await getCollection('projects');
    return projects
      .map(
        (p) =>
          `- ${p.data.title} (${p.data.location}, ${p.data.year}, ${p.data.category}): ${p.data.summary}`,
      )
      .join('\n');
  } catch {
    return '';
  }
}

function lookupProjectsTool() {
  return {
    type: 'function' as const,
    function: {
      name: 'lookup_projects',
      description:
        'Search the studio portfolio for projects matching a description. Returns titles, locations, and one-sentence summaries.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'A short description of the project type the user mentioned',
          },
          category: {
            type: 'string',
            enum: ['residential', 'estate', 'commercial', 'any'],
            description: 'Optional category filter',
          },
        },
        required: ['query'],
      },
    },
  };
}

async function runLookup(query: string, category?: string) {
  const projects = await getCollection('projects');
  const q = query.toLowerCase();
  const filtered = projects.filter((p) => {
    if (category && category !== 'any' && p.data.category !== category) return false;
    const hay = `${p.data.title} ${p.data.location} ${p.data.summary} ${p.data.scope.join(' ')} ${(p.data.materials || []).join(' ')}`.toLowerCase();
    return q.split(/\s+/).some((term) => term.length > 2 && hay.includes(term));
  });
  return (filtered.length ? filtered : projects).slice(0, 4).map((p) => ({
    title: p.data.title,
    location: p.data.location,
    year: p.data.year,
    category: p.data.category,
    summary: p.data.summary,
  }));
}

function sanitizeMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatMessage[] = [];
  let totalChars = 0;
  for (const m of raw.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== 'object') continue;
    const role = (m as ChatMessage).role;
    const content = (m as ChatMessage).content;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') continue;
    const trimmed = content.slice(0, 4000);
    totalChars += trimmed.length;
    if (totalChars > MAX_TOTAL_CHARS) break;
    out.push({ role, content: trimmed });
  }
  return out;
}

function offlineResponse() {
  // No API key configured — return a graceful fallback that still feels in-brand.
  const text =
    "Thank you for reaching out. The studio's chat assistant is currently offline — please use the contact form below to send your note, and Margaret or Daniel will be in touch within two business days. If your inquiry is time-sensitive, the studio's direct line is on the contact page.";
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const tokens = text.match(/.{1,4}/g) ?? [text];
      let i = 0;
      const interval = setInterval(() => {
        if (i >= tokens.length) {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          clearInterval(interval);
          return;
        }
        const payload = JSON.stringify({ delta: tokens[i] });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        i++;
      }, 30);
    },
  });
  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      'connection': 'keep-alive',
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.OPENAI_API_KEY;
  if (!apiKey) return offlineResponse();

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid-json' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const messages = sanitizeMessages(body.messages);
  const projectsContext = await buildProjectsContext();

  const fullMessages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'system',
      content: `Reference — current Stonehaven projects (for the lookup_projects tool):\n${projectsContext}`,
    },
    ...messages,
  ];

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      temperature: 0.6,
      messages: fullMessages,
      tools: [lookupProjectsTool()],
      tool_choice: 'auto',
    }),
  });

  if (!openaiResponse.ok || !openaiResponse.body) {
    const errText = await openaiResponse.text().catch(() => '');
    console.error('[chat] openai error:', openaiResponse.status, errText);
    return new Response(JSON.stringify({ error: 'upstream' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = openaiResponse.body!.getReader();
      let buffer = '';
      let pendingToolCall: { name?: string; args?: string } | null = null;

      const send = (delta: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
      };
      const sendDone = () => {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      };

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') continue;
            try {
              const parsed = JSON.parse(payload);
              const choice = parsed.choices?.[0];
              const delta = choice?.delta;
              if (!delta) continue;

              if (delta.content) {
                send(delta.content);
              }

              if (delta.tool_calls && delta.tool_calls.length) {
                const tc = delta.tool_calls[0];
                pendingToolCall ??= { name: undefined, args: '' };
                if (tc.function?.name) pendingToolCall.name = tc.function.name;
                if (tc.function?.arguments) pendingToolCall.args = (pendingToolCall.args || '') + tc.function.arguments;
              }

              if (choice.finish_reason === 'tool_calls' && pendingToolCall?.name === 'lookup_projects') {
                let args: { query?: string; category?: string } = {};
                try {
                  args = JSON.parse(pendingToolCall.args || '{}');
                } catch {}
                const result = await runLookup(args.query ?? '', args.category);
                // Hand the tool result back to the model in a second call.
                const followupMessages = [
                  ...fullMessages,
                  {
                    role: 'assistant' as const,
                    content: '',
                    // @ts-expect-error tool_calls is a runtime extension on the chat-completions payload
                    tool_calls: [{ id: 'call_lookup', type: 'function', function: { name: 'lookup_projects', arguments: pendingToolCall.args ?? '{}' } }],
                  },
                  {
                    role: 'tool' as const,
                    // @ts-expect-error tool_call_id is required by OpenAI for tool messages
                    tool_call_id: 'call_lookup',
                    content: JSON.stringify(result),
                  },
                ];
                const followup = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
                  body: JSON.stringify({
                    model: MODEL,
                    stream: true,
                    temperature: 0.6,
                    messages: followupMessages,
                  }),
                });
                if (followup.ok && followup.body) {
                  const r2 = followup.body.getReader();
                  let buf2 = '';
                  while (true) {
                    const chunk = await r2.read();
                    if (chunk.done) break;
                    buf2 += decoder.decode(chunk.value, { stream: true });
                    const ls = buf2.split('\n');
                    buf2 = ls.pop() ?? '';
                    for (const l of ls) {
                      if (!l.startsWith('data: ')) continue;
                      const pl = l.slice(6).trim();
                      if (pl === '[DONE]') continue;
                      try {
                        const p2 = JSON.parse(pl);
                        const d2 = p2.choices?.[0]?.delta?.content;
                        if (d2) send(d2);
                      } catch {}
                    }
                  }
                }
                pendingToolCall = null;
              }
            } catch {
              // ignore single bad line
            }
          }
        }
        sendDone();
        controller.close();
      } catch (err) {
        console.error('[chat] stream error:', err);
        sendDone();
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      'connection': 'keep-alive',
    },
  });
};
