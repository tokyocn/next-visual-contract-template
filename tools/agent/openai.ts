export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type GenerateOptions = {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  responseFormat?: 'text' | 'json';
};

type OpenAIContentItem = {
  type: 'text';
  text: string;
};

type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: OpenAIContentItem[];
};

function buildPayload(messages: ChatMessage[], options: GenerateOptions) {
  const model = options.model ?? process.env.OPENAI_MODEL ?? 'gpt-4.1-mini';
  const maxOutputTokens = options.maxTokens ?? 4096;
  const temperature = options.temperature ?? 0.2;
  const responseFormat = options.responseFormat === 'json'
    ? { type: 'json_schema', json_schema: { name: 'structured_response', schema: { type: 'object', properties: { content: { type: 'string' } }, required: ['content'] } } }
    : { type: 'text' as const };

  const payload = {
    model,
    input: messages.map<OpenAIMessage>(msg => ({
      role: msg.role,
      content: [{ type: 'text', text: msg.content }]
    })),
    max_output_tokens: maxOutputTokens,
    temperature,
    response_format: responseFormat
  };

  return payload;
}

export async function generateText(messages: ChatMessage[], options: GenerateOptions = {}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY. Cannot call OpenAI Responses API.');
  }

  const payload = buildPayload(messages, options);
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '<no body>');
    throw new Error(`OpenAI request failed: ${res.status} ${res.statusText} ${errText}`);
  }

  const data = await res.json();
  const output = data?.output;
  if (Array.isArray(output)) {
    for (const item of output) {
      if (item?.content) {
        for (const content of item.content) {
          if (content?.type === 'text' && typeof content.text === 'string') {
            return content.text;
          }
        }
      }
    }
  }

  if (typeof data?.output_text === 'string') {
    return data.output_text;
  }

  throw new Error('OpenAI response missing output text.');
}
