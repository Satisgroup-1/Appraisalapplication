// AI floorplan extraction: send a PDF or image of floorplans to the Claude
// API and receive structured envelope JSON (per-floor polygon, windows,
// cores) matching the app's Envelope schema. Runs in the Electron main
// process so credentials never reach the renderer.

import { buildClient } from './auth';

export const MODEL = 'claude-opus-5';

const ENVELOPE_SCHEMA = {
  type: 'object',
  properties: {
    floors: {
      type: 'array',
      description: 'One entry per floor shown on the plans, ground floor first.',
      items: {
        type: 'object',
        properties: {
          floor: {
            type: 'string',
            description: "Floor label: 'B', 'G', '1', '2', ...",
          },
          use: {
            type: 'string',
            enum: ['residential', 'commercial', 'mixed', 'unknown'],
            description: 'Existing use of this floor as drawn.',
          },
          envelope: {
            type: 'array',
            description:
              'External wall polygon in metres, counter-clockwise, origin bottom-left, rotated so the LONG axis is x. 4-10 vertices.',
            items: {
              type: 'array',
              items: { type: 'number' },
            },
          },
          cores: {
            type: 'array',
            description: 'Stair/lift cores to retain, as rectangles in the same coordinates.',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['stair', 'lift', 'core'] },
                poly: {
                  type: 'array',
                  items: { type: 'array', items: { type: 'number' } },
                },
              },
              required: ['type', 'poly'],
              additionalProperties: false,
            },
          },
          windows: {
            type: 'array',
            description:
              "Window positions along the two long facades. x in metres; side 'front' = min-y facade, 'rear' = max-y facade.",
            items: {
              type: 'object',
              properties: {
                x: { type: 'number' },
                side: { type: 'string', enum: ['front', 'rear'] },
              },
              required: ['x', 'side'],
              additionalProperties: false,
            },
          },
          assumptions: {
            type: 'array',
            description:
              'Every assumption made while reading this floor: assumed scale, uncertain wall positions, inferred window locations, low-confidence readings.',
            items: { type: 'string' },
          },
        },
        required: ['floor', 'use', 'envelope', 'cores', 'windows', 'assumptions'],
        additionalProperties: false,
      },
    },
    scaleBasis: {
      type: 'string',
      description: 'How dimensions were established (printed dimensions, scale bar, assumed door widths...).',
    },
    warnings: {
      type: 'array',
      description: 'Anything that could invalidate the extraction (no scale found, partial plans, listed building notes).',
      items: { type: 'string' },
    },
  },
  required: ['floors', 'scaleBasis', 'warnings'],
  additionalProperties: false,
} as const;

const PROMPT = `You are extracting building geometry from architectural floorplans for a residential conversion feasibility study.

For EACH floor shown in the document:
1. Determine the external envelope polygon in METRES. Use printed dimensions or the scale bar; if neither exists, estimate from standard door openings (~0.9m) and state that clearly in assumptions.
2. Rotate coordinates so the building's long axis lies on x, origin at bottom-left.
3. Record retained stair/lift cores as rectangles.
4. Record window positions along the two long facades ('front' = min-y facade, 'rear' = max-y). Estimate positions at regular spacing if individual windows are unclear, and say so.
5. Note the floor's existing use.

Be explicit about every assumption. A wrong scale invalidates everything downstream, so if you are not confident in the scale, say so prominently in warnings.`;

type MediaType = 'image/png' | 'image/jpeg' | 'image/webp';

const MEDIA: Record<string, MediaType> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

export async function extractEnvelopes(payload: {
  name: string;
  ext: string;
  base64: string;
  hint?: string;
}): Promise<unknown> {
  const client = await buildClient();

  const fileBlock =
    payload.ext === 'pdf'
      ? {
          type: 'document' as const,
          source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: payload.base64 },
        }
      : {
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: MEDIA[payload.ext] ?? 'image/png',
            data: payload.base64,
          },
        };

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    output_config: {
      format: { type: 'json_schema', schema: ENVELOPE_SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [
      {
        role: 'user',
        content: [
          fileBlock,
          {
            type: 'text',
            text: `${PROMPT}\n\nFile: ${payload.name}${payload.hint ? `\nUser guidance: ${payload.hint}` : ''}`,
          },
        ],
      },
    ],
  });

  const response = await stream.finalMessage();

  if (response.stop_reason === 'refusal') {
    throw new Error('The model declined to process this document. Try a clearer plan image.');
  }
  const text = response.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') throw new Error('No structured output returned.');
  return JSON.parse(text.text);
}
