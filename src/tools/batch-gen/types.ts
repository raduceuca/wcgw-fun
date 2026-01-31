export interface TagDefinition {
  readonly name: string
  readonly values: readonly string[]
}

export interface ResolvedPrompt {
  readonly text: string
  readonly tags: Readonly<Record<string, string>>
}

export type GenerationStatus = 'pending' | 'generating' | 'success' | 'error'

export interface GenerationResult {
  readonly id: string
  readonly prompt: ResolvedPrompt
  readonly status: GenerationStatus
  readonly imageData?: string
  readonly mimeType?: string
  readonly error?: string
}

export interface GeminiRequestPayload {
  readonly contents: readonly GeminiContent[]
  readonly generationConfig: {
    readonly responseModalities: readonly string[]
  }
}

export interface GeminiContent {
  readonly role: string
  readonly parts: readonly GeminiPart[]
}

export type GeminiPart =
  | { readonly text: string }
  | { readonly inlineData: { readonly mimeType: string; readonly data: string } }

export interface GeminiResponse {
  readonly candidates: readonly {
    readonly content: {
      readonly parts: readonly GeminiPart[]
    }
  }[]
}
