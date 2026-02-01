import type { GeminiResponse, GeminiPart } from '../types'

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODEL = 'gemini-2.0-flash-exp'

export interface GenerateImageParams {
  readonly apiKey: string
  readonly prompt: string
  readonly imageBase64: string
  readonly imageMimeType: string
}

export interface GenerateImageResult {
  readonly imageData: string
  readonly mimeType: string
}

export async function generateImage(
  params: GenerateImageParams
): Promise<GenerateImageResult> {
  const { apiKey, prompt, imageBase64, imageMimeType } = params

  const url = `${API_BASE}/${MODEL}:generateContent?key=${apiKey}`

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: imageMimeType, data: imageBase64 } },
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
    },
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${errorBody}`)
  }

  const data: GeminiResponse = await response.json()

  const imagePart = data.candidates[0]?.content.parts.find(
    (p): p is Extract<GeminiPart, { inlineData: unknown }> => 'inlineData' in p
  )

  if (!imagePart) {
    throw new Error('No image in Gemini response')
  }

  return {
    imageData: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType,
  }
}

export async function runBatch(
  params: readonly GenerateImageParams[],
  concurrency: number,
  onResult: (index: number, result: GenerateImageResult | Error) => void
): Promise<void> {
  let cursor = 0

  async function next(): Promise<void> {
    const idx = cursor++
    if (idx >= params.length) return

    try {
      const result = await generateImage(params[idx])
      onResult(idx, result)
    } catch (err) {
      onResult(idx, err instanceof Error ? err : new Error(String(err)))
    }

    return next()
  }

  const workers = Array.from(
    { length: Math.min(concurrency, params.length) },
    () => next()
  )
  await Promise.all(workers)
}
