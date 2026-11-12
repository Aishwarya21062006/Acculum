import { GoogleGenAI } from '@google/genai';

class EmbeddingService {
  private ai: GoogleGenAI | null = null;
  private embeddingModel: string;

  constructor() {
    this.embeddingModel = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (apiKey && apiKey !== 'your-key-here' && apiKey !== 'your-google-gemini-api-key') {
      try {
        this.ai = new GoogleGenAI({ apiKey });
        console.log(`[EmbeddingService] Initialized Google Gen AI with model ${this.embeddingModel}`);
      } catch (err: any) {
        console.warn('[EmbeddingService] Failed to initialize Google Gen AI SDK:', err.message);
      }
    } else {
      console.warn('[EmbeddingService] GEMINI_API_KEY not configured. Running with fallback vector generator.');
    }
  }

  /**
   * Generates a 768-dimensional numerical vector embedding for the input text.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const trimmed = text.trim();
    if (!trimmed) {
      return new Array(768).fill(0);
    }

    if (this.ai) {
      try {
        const response = await this.ai.models.embedContent({
          model: this.embeddingModel,
          contents: trimmed,
        });

        const values = (response as any).embedding?.values || (response as any).values;
        if (Array.isArray(values) && values.length > 0) {
          return values;
        }
      } catch (err: any) {
        console.warn(`[EmbeddingService] Gemini API call error: ${err.message}. Using deterministic fallback vector.`);
      }
    }

    // Deterministic fallback vector of dimension 768 for offline development/testing
    return this.generateDeterministicFallbackVector(trimmed, 768);
  }

  /**
   * Generates embeddings in batches for efficient processing.
   */
  async generateBatchEmbeddings(texts: string[], batchSize: number = 10): Promise<number[][]> {
    const results: number[][] = [];
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map((text) => this.generateEmbedding(text));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    return results;
  }

  /**
   * Generates a normalized pseudo-random vector of specified dimensions based on text tokens.
   */
  private generateDeterministicFallbackVector(text: string, dimensions: number = 768): number[] {
    const vector = new Array(dimensions).fill(0);
    const words = text.toLowerCase().split(/\W+/).filter(Boolean);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = (hash << 5) - hash + word.charCodeAt(j);
        hash |= 0;
      }
      const idx = Math.abs(hash) % dimensions;
      vector[idx] += 1.0 / (1 + (i % 3));
    }

    // L2 Normalize
    let sumSq = 0;
    for (let i = 0; i < dimensions; i++) {
      sumSq += vector[i] * vector[i];
    }
    const norm = Math.sqrt(sumSq) || 1.0;
    for (let i = 0; i < dimensions; i++) {
      vector[i] = parseFloat((vector[i] / norm).toFixed(6));
    }

    return vector;
  }
}

export const embeddingService = new EmbeddingService();
export default embeddingService;

