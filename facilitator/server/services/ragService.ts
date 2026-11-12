import { GoogleGenAI } from '@google/genai';
import dbManager from '../db/database.js';
import embeddingService from './embeddingService.js';
import supabaseService from './supabaseService.js';

export interface RetrievedChunk {
  id: string;
  textbook_id: string;
  chapter: string;
  topic: string;
  page_number: number;
  chunk_text: string;
  similarity: number;
}

export interface RAGAnswerResult {
  answer: string;
  references: {
    chapter: string;
    topic: string;
    page_number: number;
  }[];
  passages_retrieved: number;
  sufficient_context: boolean;
}

class RAGService {
  private ai: GoogleGenAI | null = null;
  private generationModel: string;

  constructor() {
    this.generationModel = process.env.GEMINI_GENERATION_MODEL || 'gemini-2.5-flash';
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (apiKey && apiKey !== 'your-key-here' && apiKey !== 'your-google-gemini-api-key') {
      try {
        this.ai = new GoogleGenAI({ apiKey });
      } catch (err: any) {
        console.warn('[RAGService] GoogleGenAI init warning:', err.message);
      }
    }
  }

  /**
   * Cosine similarity between two float vectors.
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom ? dot / denom : 0;
  }

  /**
   * Retrieves the most relevant textbook chunks for a given query or topic.
   */
  async retrieveContext(
    query: string,
    options: {
      textbookId?: string;
      classGrade?: string;
      subject?: string;
      chapter?: string;
      topic?: string;
      topK?: number;
      minSimilarity?: number;
    } = {}
  ): Promise<RetrievedChunk[]> {
    const topK = options.topK || 5;
    const minSim = options.minSimilarity ?? 0.25;

    // 1. Generate query embedding
    const queryEmbedding = await embeddingService.generateEmbedding(query);

    // 2. If Supabase pgvector is configured, query RPC match_textbook_chunks
    if (supabaseService.hasValidConfig()) {
      try {
        const matches = await supabaseService.vectorSearch(queryEmbedding, {
          textbookId: options.textbookId,
          chapter: options.chapter,
          topic: options.topic,
          matchCount: topK,
          matchThreshold: minSim,
        });

        if (matches && matches.length > 0) {
          return matches.map((m: any) => ({
            id: m.id,
            textbook_id: m.textbook_id,
            chapter: m.chapter || 'Chapter',
            topic: m.topic || 'Topic',
            page_number: m.page_number || 1,
            chunk_text: m.chunk_text,
            similarity: m.similarity,
          }));
        }
      } catch (sbErr: any) {
        console.warn('[RAGService] Supabase vector search fallback to local store:', sbErr.message);
      }
    }

    // 3. Fallback: Search in local SQLite textbook_chunks
    let sql = 'SELECT * FROM textbook_chunks WHERE 1=1';
    const params: any[] = [];

    if (options.textbookId) {
      sql += ' AND textbook_id = ?';
      params.push(options.textbookId);
    }
    if (options.chapter) {
      sql += ' AND chapter LIKE ?';
      params.push(`%${options.chapter}%`);
    }
    if (options.topic) {
      sql += ' AND (topic LIKE ? OR chunk_text LIKE ?)';
      params.push(`%${options.topic}%`, `%${options.topic}%`);
    }

    const rows = dbManager.all<any>(sql, params);
    if (rows.length === 0 && (options.chapter || options.topic)) {
      // Broaden search to entire textbook
      const broadRows = dbManager.all<any>(
        'SELECT * FROM textbook_chunks WHERE textbook_id = ?',
        [options.textbookId || '']
      );
      if (broadRows.length > 0) rows.push(...broadRows);
    }

    // Calculate cosine similarity for each chunk
    const scoredChunks: RetrievedChunk[] = [];
    for (const r of rows) {
      let emb: number[] = [];
      try {
        emb = typeof r.embedding === 'string' ? JSON.parse(r.embedding) : r.embedding;
      } catch {
        emb = [];
      }

      const similarity = emb.length > 0 ? this.cosineSimilarity(queryEmbedding, emb) : 0.5;

      scoredChunks.push({
        id: r.id,
        textbook_id: r.textbook_id,
        chapter: r.chapter || 'Chapter',
        topic: r.topic || 'Topic',
        page_number: r.page_number,
        chunk_text: r.chunk_text,
        similarity,
      });
    }

    // Sort descending by similarity
    scoredChunks.sort((a, b) => b.similarity - a.similarity);
    return scoredChunks.slice(0, topK);
  }

  /**
   * Generates a grounded explanation for a student's question based strictly on textbook chunks.
   */
  async explainConcept(
    question: string,
    options: {
      textbookId?: string;
      topic?: string;
      chapter?: string;
      classGrade?: string;
      subject?: string;
    }
  ): Promise<RAGAnswerResult> {
    const searchTarget = options.topic ? `${options.topic}: ${question}` : question;
    const passages = await this.retrieveContext(searchTarget, {
      textbookId: options.textbookId,
      chapter: options.chapter,
      topic: options.topic,
      topK: 4,
    });

    if (passages.length === 0) {
      return {
        answer: 'The available textbook content is insufficient to answer this question accurately. Please refer to your teacher or verify the selected chapter.',
        references: [],
        passages_retrieved: 0,
        sufficient_context: false,
      };
    }

    const contextText = passages
      .map(
        (p, idx) =>
          `[Passage ${idx + 1}] (Chapter: ${p.chapter} | Topic: ${p.topic} | Page: ${p.page_number}):\n${p.chunk_text}`
      )
      .join('\n\n---\n\n');

    let answer = '';

    if (this.ai) {
      try {
        const prompt = `
You are Acculum's AI Learning Assistant for school students.
Answer the following student question using ONLY the retrieved textbook passages provided below.

STRICT INSTRUCTIONS:
1. Ground your explanation exclusively in the textbook passages.
2. If the answer cannot be found in the passages, clearly state: "The available textbook content is insufficient to answer this question."
3. Do NOT invent facts, theories, or details not mentioned in the passages.
4. Keep the explanation age-appropriate, encouraging, clear, and easy to understand.
5. Explicitly cite the chapter and page numbers from the passages in your explanation.

Student Question:
"${question}"

Textbook Passages:
${contextText}
`;

        const res = await this.ai.models.generateContent({
          model: this.generationModel,
          contents: prompt,
        });

        answer = res.text || '';
      } catch (err: any) {
        console.warn('[RAGService] Gemini generation call failed:', err.message);
      }
    }

    // Heuristic fallback if Gemini not available or failed
    if (!answer) {
      const topPassage = passages[0];
      answer = `Based on ${topPassage.chapter} (Page ${topPassage.page_number}):\n\n${topPassage.chunk_text.slice(0, 450)}...\n\n(Refer to Page ${topPassage.page_number} for further details).`;
    }

    const references = passages.map((p) => ({
      chapter: p.chapter,
      topic: p.topic,
      page_number: p.page_number,
    }));

    return {
      answer,
      references,
      passages_retrieved: passages.length,
      sufficient_context: true,
    };
  }
}

export const ragService = new RAGService();
export default ragService;

