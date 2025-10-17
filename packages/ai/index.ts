/**
 * Shared AI Package for LEGACORE Platform
 * 
 * This package provides AI utilities and integrations that can be used
 * across all white-label applications.
 */

export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'custom'
  apiKey?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface AIPrompt {
  system?: string
  user: string
  context?: Record<string, any>
}

export interface AIResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model?: string
}

/**
 * Base AI Client class
 * Extend this for specific AI provider implementations
 */
export abstract class AIClient {
  protected config: AIConfig

  constructor(config: AIConfig) {
    this.config = config
  }

  abstract generateCompletion(prompt: AIPrompt): Promise<AIResponse>
  abstract generateStream(prompt: AIPrompt): AsyncGenerator<string, void, unknown>
}

/**
 * Mock AI Client for testing and development
 */
export class MockAIClient extends AIClient {
  async generateCompletion(prompt: AIPrompt): Promise<AIResponse> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return {
      content: `Mock AI Response for: ${prompt.user}`,
      usage: {
        promptTokens: 50,
        completionTokens: 100,
        totalTokens: 150
      },
      model: 'mock-model'
    }
  }

  async *generateStream(prompt: AIPrompt): AsyncGenerator<string, void, unknown> {
    const response = `Mock AI Response for: ${prompt.user}`
    const words = response.split(' ')

    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 50))
      yield word + ' '
    }
  }
}

/**
 * AI Utilities
 */
export const AIUtils = {
  /**
   * Score content relevance (0-100)
   */
  scoreRelevance(content: string, criteria: string[]): number {
    const lowerContent = content.toLowerCase()
    const matchedCriteria = criteria.filter(c => 
      lowerContent.includes(c.toLowerCase())
    )
    return Math.round((matchedCriteria.length / criteria.length) * 100)
  },

  /**
   * Generate summary of content
   */
  async summarize(content: string, maxLength: number = 200): Promise<string> {
    // Simple summarization (in production, use actual AI)
    if (content.length <= maxLength) {
      return content
    }
    return content.substring(0, maxLength - 3) + '...'
  },

  /**
   * Extract keywords from content
   */
  extractKeywords(content: string, count: number = 5): string[] {
    const words = content.toLowerCase().match(/\b\w+\b/g) || []
    const frequency = words.reduce((acc, word) => {
      if (word.length > 3) {
        acc[word] = (acc[word] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([word]) => word)
  },

  /**
   * Classify content sentiment
   */
  classifySentiment(content: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful']
    const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'horrible']
    
    const lowerContent = content.toLowerCase()
    const positiveCount = positiveWords.filter(w => lowerContent.includes(w)).length
    const negativeCount = negativeWords.filter(w => lowerContent.includes(w)).length
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }
}

/**
 * Factory function to create AI client
 */
export function createAIClient(config: AIConfig): AIClient {
  // For now, return mock client
  // In production, return actual provider-specific client
  return new MockAIClient(config)
}

export default {
  AIClient,
  MockAIClient,
  AIUtils,
  createAIClient
}
